"""One TCP connection, many requests.

Loop: wait (idle timeout) -> read one request (request deadline) -> respond
-> repeat, until the client says Connection: close, goes quiet, hangs up, or
sends bytes we cannot frame.

Pipelining needs no special code: requests are read from the buffer in the
order they arrived and answered one by one, so responses leave in order.
"""

from __future__ import annotations

import logging
import socket
import time
from email.utils import formatdate
from typing import Callable, Optional

from .config import ServerConfig
from .http_types import HTTP_1_0, ProtocolError, Request, Response
from .request_parser import read_request
from .socket_buffer import SocketBuffer

log = logging.getLogger(__name__)

Handler = Callable[[Request], Response]

# After our last byte, how long we keep reading (and discarding) before the
# final close. See _close_gracefully.
_LINGER_SECONDS = 1.0


class Connection:
    def __init__(self, sock: socket.socket, address, handler: Handler, config: ServerConfig) -> None:
        self._sock = sock
        self._address = address
        self._handler = handler
        self._config = config
        self._buffer = SocketBuffer(sock)

    def serve(self) -> None:
        requests_served = 0
        try:
            while self._serve_one():
                requests_served += 1
        except ConnectionError:
            log.info("%s reset the connection", self._peer)
        except socket.timeout:
            log.info("%s stopped reading; response not delivered in time", self._peer)
        finally:
            log.info("%s closed after %d request(s)", self._peer, requests_served)
            self._close_gracefully()

    def _serve_one(self) -> bool:
        """Serve a single request. Returns True if the connection stays open."""
        if not self._buffer.wait_for_data(self._config.idle_timeout_seconds):
            return False  # idle timeout or clean EOF: nobody to answer.

        self._buffer.set_deadline(self._config.request_timeout_seconds)
        try:
            request = read_request(self._buffer, self._config)
        except ProtocolError as error:
            log.warning("%s protocol error: %s", self._peer, error.detail)
            self._send(Response.text(error.status, error.detail), keep_alive=False)
            return False
        except TimeoutError:
            self._send(Response.text(408, "request not received in time"), keep_alive=False)
            return False

        response = self._handle(request)
        keep_alive = _client_wants_keep_alive(request)
        log.info("%s %s %s -> %d", self._peer, request.method, request.target, response.status)
        self._send(response, keep_alive, request)
        return keep_alive

    def _handle(self, request: Request) -> Response:
        # The request was framed correctly, so even if the handler has a bug
        # we can answer it and carry on with the next one.
        try:
            return self._handler(request)
        except Exception:
            log.exception("%s handler failed for %s %s", self._peer, request.method, request.target)
            return Response.text(500, "internal server error")

    def _send(self, response: Response, keep_alive: bool, request: Optional[Request] = None) -> None:
        response.headers.add("Date", formatdate(usegmt=True))
        if not keep_alive:
            response.headers.add("Connection", "close")
        elif request is not None and request.version == HTTP_1_0:
            # 1.0 clients close by default; tell them we are not.
            response.headers.add("Connection", "keep-alive")
        include_body = request is None or request.method != "HEAD"
        # Reads leave the socket timeout at whatever their deadline had left,
        # so every send sets its own.
        self._sock.settimeout(self._config.send_timeout_seconds)
        self._sock.sendall(response.serialize(include_body))

    def _close_gracefully(self) -> None:
        """Half-close, drain, then close.

        Closing a socket that still has unread input makes the kernel send
        RST, which can destroy our last response before the client reads it.
        Shutting down our write side first and draining briefly avoids that.
        """
        deadline = time.monotonic() + _LINGER_SECONDS
        try:
            self._sock.shutdown(socket.SHUT_WR)
            while True:
                remaining = deadline - time.monotonic()
                if remaining <= 0:
                    break
                self._sock.settimeout(remaining)
                if not self._sock.recv(4096):
                    break
        except OSError:
            pass
        finally:
            self._sock.close()

    @property
    def _peer(self) -> str:
        host, port = self._address[:2]
        return f"{host}:{port}"


def _client_wants_keep_alive(request: Request) -> bool:
    tokens = request.headers.comma_tokens("Connection")
    if "close" in tokens:
        return False
    if request.version == HTTP_1_0:
        return "keep-alive" in tokens
    return True  # HTTP/1.1 connections are persistent by default.
