"""One TCP connection on the server: preface, then frames until someone leaves.

Error handling follows the two levels in SPEC.md section 6:
  * stream error  (bad HEADERS payload) -> 400 on that stream, keep going
  * connection error (bad preface, oversized frame, stream ID going backwards,
    timeout) -> GOAWAY with an error code, then close
"""

from __future__ import annotations

import logging
import socket
import time
from dataclasses import dataclass
from email.utils import formatdate
from itertools import chain
from typing import Callable, Iterable, Iterator, Tuple

from .errors import ConnectionClosed, IdleTimeout, MalformedMessage, ProtocolViolation
from .frames import Frame, FrameReader
from .handler import Response, text_response
from .messages import GoAway, RequestHead, ResponseHead, decode_request_head, encode_goaway, encode_response_head
from .protocol import CONNECTION_STREAM_ID, END_STREAM, MAX_PAYLOAD_SIZE, ErrorCode, FrameType, Method, name_of
from .transport import SocketReader, SocketWriter

log = logging.getLogger(__name__)

Handler = Callable[[RequestHead], Response]
SERVER_NAME = "bserve/1"
_LINGER_SECONDS = 1.0


@dataclass(frozen=True)
class ConnectionLimits:
    idle_timeout: float = 60.0   # silence allowed between requests
    frame_timeout: float = 30.0  # a frame, once started, must finish within this
    send_timeout: float = 30.0   # a single write may block at most this long


class ServerConnection:
    def __init__(self, sock: socket.socket, peer: str, handler: Handler, limits: ConnectionLimits) -> None:
        self._sock = sock
        self._peer = peer
        self._handler = handler
        self._limits = limits
        self._frames = FrameReader(SocketReader(sock), limits.frame_timeout)
        self._writer = SocketWriter(sock, limits.send_timeout)
        self._last_stream_id = 0

    def serve(self) -> None:
        try:
            self._frames.read_preface(self._limits.idle_timeout)
            while self._serve_one_frame():
                pass
        except ConnectionClosed:
            pass
        except IdleTimeout:
            self._go_away(ErrorCode.NO_ERROR, "idle timeout")
        except ProtocolViolation as violation:
            log.warning("%s %s: %s", self._peer, violation.code.name, violation.detail)
            self._go_away(violation.code, violation.detail)
        except OSError as error:
            # Peer reset, send timed out, or a file failed mid-body. Once a
            # response has started there is no way to amend it: just close.
            log.info("%s connection ended: %s", self._peer, error)
        finally:
            log.info("%s closed after %d stream(s)", self._peer, self._last_stream_id)
            self._close_gracefully()

    def _serve_one_frame(self) -> bool:
        """Returns False when the client said GOAWAY."""
        frame = self._frames.read_frame(self._limits.idle_timeout)
        if frame.type == FrameType.HEADERS:
            self._serve_request(frame)
        elif frame.type == FrameType.GOAWAY:
            return False
        else:
            # DATA (v1 requests have no body) and every unknown type: the
            # payload was already read by Length, so skipping is free.
            log.debug("%s skipped %s frame", self._peer, name_of(FrameType, frame.type))
        return True

    def _serve_request(self, frame: Frame) -> None:
        if frame.stream_id == CONNECTION_STREAM_ID:
            raise ProtocolViolation(ErrorCode.PROTOCOL_ERROR, "stream 0 is the connection, not a request")
        if frame.stream_id <= self._last_stream_id:
            raise ProtocolViolation(
                ErrorCode.PROTOCOL_ERROR,
                f"stream id {frame.stream_id} is not greater than {self._last_stream_id}")
        self._last_stream_id = frame.stream_id

        try:
            request = decode_request_head(frame.payload)
        except MalformedMessage as error:
            log.info("%s stream %d malformed: %s", self._peer, frame.stream_id, error)
            response = text_response(400, f"malformed request: {error}")
        else:
            response = self._handle(request)
            log.info("%s stream %d %s %s -> %d", self._peer, frame.stream_id,
                     name_of(Method, request.method), request.path, response.status)
        self._send_response(frame.stream_id, response)

    def _handle(self, request: RequestHead) -> Response:
        try:
            return self._handler(request)
        except Exception:
            log.exception("%s handler failed", self._peer)
            return text_response(500, "internal server error")

    def _send_response(self, stream_id: int, response: Response) -> None:
        try:
            self._send_frames(stream_id, response)
        finally:
            close = getattr(response.body, "close", None)
            if close:
                close()  # e.g. the open file, even if sending failed half-way

    def _send_frames(self, stream_id: int, response: Response) -> None:
        fields = response.fields + [("server", SERVER_NAME), ("date", formatdate(usegmt=True))]
        head = encode_response_head(ResponseHead(response.status, fields))
        chunks = with_last_flag(split_payloads(response.body))

        first = next(chunks, None)
        if first is None:  # no body: the HEADERS frame ends the stream
            self._send(Frame(FrameType.HEADERS, END_STREAM, stream_id, head))
            return
        self._send(Frame(FrameType.HEADERS, 0, stream_id, head))
        for chunk, is_last in chain([first], chunks):
            self._send(Frame(FrameType.DATA, END_STREAM if is_last else 0, stream_id, chunk))

    def _send(self, frame: Frame) -> None:
        self._writer.send(frame.encode())

    def _go_away(self, code: ErrorCode, detail: str) -> None:
        payload = encode_goaway(GoAway(self._last_stream_id, code, detail))
        try:
            self._send(Frame(FrameType.GOAWAY, 0, CONNECTION_STREAM_ID, payload))
        except OSError:
            pass  # the peer is already gone; nothing more to tell it

    def _close_gracefully(self) -> None:
        """Half-close, drain briefly, close: avoids an RST eating our GOAWAY."""
        deadline = time.monotonic() + _LINGER_SECONDS
        try:
            self._sock.shutdown(socket.SHUT_WR)
            while deadline > time.monotonic():
                self._sock.settimeout(deadline - time.monotonic())
                if not self._sock.recv(4096):
                    break
        except OSError:
            pass
        finally:
            self._sock.close()


def split_payloads(body: Iterable[bytes]) -> Iterator[bytes]:
    """Re-slice body chunks so none exceeds the frame payload limit."""
    for chunk in body:
        for start in range(0, len(chunk), MAX_PAYLOAD_SIZE):
            yield chunk[start : start + MAX_PAYLOAD_SIZE]


def with_last_flag(items: Iterator[bytes]) -> Iterator[Tuple[bytes, bool]]:
    """Yield (item, is_last) with one item of lookahead, so the final DATA
    frame can carry END_STREAM without a trailing empty frame."""
    previous = next(items, None)
    for item in items:
        yield previous, False
        previous = item
    if previous is not None:
        yield previous, True
