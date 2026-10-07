"""BHP/1 client: one TCP connection, any number of requests over it."""

from __future__ import annotations

import socket
from typing import Callable, Optional

from .errors import MalformedMessage, ProtocolViolation
from .frames import Frame, FrameReader
from .messages import GoAway, RequestHead, ResponseHead, decode_goaway, decode_response_head, encode_request_head
from .protocol import END_STREAM, MAX_PAYLOAD_SIZE, MAX_STREAM_ID, PREFACE, ErrorCode, FrameType, Method
from .transport import SocketReader, SocketWriter, Trace

USER_AGENT = "bcurl/1"
BodySink = Callable[[bytes], None]


class RequestTooLarge(ValueError):
    """The request does not fit in one HEADERS frame (v1 has no continuation)."""


class ServerWentAway(Exception):
    def __init__(self, goaway: GoAway) -> None:
        super().__init__(f"server sent GOAWAY (code {goaway.code}): {goaway.debug}")
        self.goaway = goaway


class BhpClient:
    def __init__(self, host: str, port: int, timeout: float = 30.0, trace: Optional[Trace] = None) -> None:
        self._authority = f"{host}:{port}"
        self._timeout = timeout
        self._sock = socket.create_connection((host, port), timeout=timeout)
        self._frames = FrameReader(SocketReader(self._sock), timeout, trace)
        self._writer = SocketWriter(self._sock, timeout, trace)
        self._next_stream_id = 1
        self._writer.send(PREFACE)

    def __enter__(self) -> "BhpClient":
        return self

    def __exit__(self, *exc_info) -> None:
        self.close()

    def close(self) -> None:
        self._sock.close()

    def fetch(self, path: str, method: Method = Method.GET, on_data: Optional[BodySink] = None) -> ResponseHead:
        """Send one request and read its response. Body bytes go to `on_data`
        as they arrive, so large files are never held in memory."""
        payload = self._encode_request(path, method)
        stream_id = self._allocate_stream_id()
        self._writer.send(Frame(FrameType.HEADERS, END_STREAM, stream_id, payload).encode())
        return self._read_response(stream_id, on_data or (lambda _: None))

    def _encode_request(self, path: str, method: Method) -> bytes:
        request = RequestHead(method, path, [
            ("host", self._authority),
            ("user-agent", USER_AGENT),
            ("accept", "*/*"),
            ("accept-encoding", "identity"),
        ])
        try:
            payload = encode_request_head(request)
            if len(payload) <= MAX_PAYLOAD_SIZE:
                return payload
        except ValueError:
            pass  # a length prefix overflowed, e.g. a path over 65,535 bytes
        raise RequestTooLarge(f"request for a {len(path)}-character path does not fit in one "
                              f"{MAX_PAYLOAD_SIZE}-byte HEADERS frame")

    def _read_response(self, stream_id: int, on_data: BodySink) -> ResponseHead:
        head: Optional[ResponseHead] = None
        while True:
            frame = self._frames.read_frame(self._timeout)
            if frame.type == FrameType.GOAWAY:
                raise ServerWentAway(decode_goaway(frame.payload))
            if frame.type not in (FrameType.HEADERS, FrameType.DATA) or frame.stream_id != stream_id:
                continue  # unknown frame types MUST be skipped; Length already did the work

            if frame.type == FrameType.HEADERS:
                if head is not None:
                    raise ProtocolViolation(ErrorCode.PROTOCOL_ERROR, "second HEADERS frame on one stream")
                head = _decode_response(frame)
            else:
                if head is None:
                    raise ProtocolViolation(ErrorCode.PROTOCOL_ERROR, "DATA frame before HEADERS")
                on_data(frame.payload)

            if frame.end_stream:
                return head

    def _allocate_stream_id(self) -> int:
        if self._next_stream_id > MAX_STREAM_ID:
            raise RuntimeError("stream ids exhausted; open a new connection")
        stream_id = self._next_stream_id
        self._next_stream_id += 1
        return stream_id


def _decode_response(frame: Frame) -> ResponseHead:
    try:
        return decode_response_head(frame.payload)
    except MalformedMessage as error:
        raise ProtocolViolation(ErrorCode.PROTOCOL_ERROR, f"malformed response: {error}") from None
