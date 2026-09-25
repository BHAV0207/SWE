"""Accept loop: one thread per connection, capped at max_connections."""

from __future__ import annotations

import logging
import selectors
import socket
import threading
from typing import List, Tuple

from .app import handle_request
from .config import ServerConfig
from .connection import Connection, Handler
from .http_types import Response

log = logging.getLogger(__name__)

# How often the accept loop wakes up to check whether it should stop.
_ACCEPT_POLL_SECONDS = 0.5
# Refusing an over-capacity client must never block the accept loop for long.
_REFUSAL_SEND_TIMEOUT_SECONDS = 1.0


class CalculatorServer:
    def __init__(self, config: ServerConfig, handler: Handler = handle_request) -> None:
        self._config = config
        self._handler = handler
        self._listeners: List[socket.socket] = []
        self._slots = threading.BoundedSemaphore(config.max_connections)
        self._stopping = threading.Event()

    @property
    def address(self) -> Tuple[str, int]:
        """(host, port) of the first listener; useful when the port was 0."""
        if not self._listeners:
            raise RuntimeError("server is not bound yet")
        return self._listeners[0].getsockname()[:2]

    def bind(self) -> None:
        self._listeners = _open_listeners(self._config.host, self._config.port)
        for listener in self._listeners:
            log.info("listening on %s port %d", *listener.getsockname()[:2])

    def serve_forever(self) -> None:
        if not self._listeners:
            self.bind()
        with selectors.DefaultSelector() as selector:
            for listener in self._listeners:
                selector.register(listener, selectors.EVENT_READ)
            while not self._stopping.is_set():
                for key, _ in selector.select(_ACCEPT_POLL_SECONDS):
                    self._accept(key.fileobj)
        for listener in self._listeners:
            listener.close()

    def stop(self) -> None:
        self._stopping.set()

    def _accept(self, listener: socket.socket) -> None:
        try:
            sock, address = listener.accept()
        except OSError as error:  # e.g. EMFILE, or the client already gave up
            log.warning("accept failed: %s", error)
            return
        sock.settimeout(None)  # don't inherit the listener's non-blocking mode
        if not self._slots.acquire(blocking=False):
            _refuse(sock)
            return
        connection = Connection(sock, address, self._handler, self._config)
        threading.Thread(target=self._run, args=(connection,), daemon=True).start()

    def _run(self, connection: Connection) -> None:
        try:
            connection.serve()
        finally:
            self._slots.release()


def _open_listeners(host: str, port: int) -> List[socket.socket]:
    """One listening socket per address `host` resolves to.

    "localhost" is both ::1 and 127.0.0.1, and clients try ::1 first. Listening
    on IPv4 only works, but every connection then starts with a refused IPv6
    attempt (on Windows that fallback costs about 2 seconds).
    """
    infos = socket.getaddrinfo(host, port, type=socket.SOCK_STREAM, flags=socket.AI_PASSIVE)
    addresses = list(dict.fromkeys((family, sockaddr[0]) for family, _, _, _, sockaddr in infos))

    listeners: List[socket.socket] = []
    for family, ip in addresses:
        try:
            listener = socket.create_server((ip, port), family=family)
        except OSError as error:
            if not listeners and (family, ip) == addresses[-1]:
                raise
            log.warning("could not listen on %s: %s", ip, error)
            continue
        listener.setblocking(False)
        listeners.append(listener)
        # With port 0, every family must share the port the first one got.
        port = listener.getsockname()[1]
    return listeners


def _refuse(sock: socket.socket) -> None:
    response = Response.text(503, "server busy, try again later")
    response.headers.add("Connection", "close")
    try:
        sock.settimeout(_REFUSAL_SEND_TIMEOUT_SECONDS)
        sock.sendall(response.serialize())
    except OSError:
        pass
    finally:
        sock.close()
