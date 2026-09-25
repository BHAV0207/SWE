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
from typing import Callable

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
        except (ConnectionResetError, BrokenPipeError):
            log.info("%s reset the connection", self._peer)
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

        response = self._handler(request)
        keep_alive = _client_wants_keep_alive(request)
        log.info("%s %s %s -> %d", self._peer, request.method, request.target, response.status)
        self._send(response, keep_alive, http_1_0_client=request.version == HTTP_1_0)
        return keep_alive

    def _send(self, response: Response, keep_alive: bool, http_1_0_client: bool = False) -> None:
        if not keep_alive:
            response.headers.add("Connection", "close")
        elif http_1_0_client:
            # 1.0 clients close by default; tell them we are not.
            response.headers.add("Connection", "keep-alive")
        self._sock.sendall(response.serialize())

    def _close_gracefully(self) -> None:
        """Half-close, drain, then close.

        Closing a socket that still has unread input makes the kernel send
        RST, which can destroy our last response before the client reads it.
        Shutting down our write side first and draining briefly avoids that.
        """
        try:
            self._sock.shutdown(socket.SHUT_WR)
            self._sock.settimeout(_LINGER_SECONDS)
            while self._sock.recv(4096):
                pass
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
