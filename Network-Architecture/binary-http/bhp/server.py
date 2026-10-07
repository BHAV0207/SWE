"""Accept loop: one thread per connection, capped."""

from __future__ import annotations

import logging
import selectors
import socket
import threading
from typing import List, Tuple

from .server_connection import ConnectionLimits, Handler, ServerConnection

log = logging.getLogger(__name__)

_ACCEPT_POLL_SECONDS = 0.5


class BhpServer:
    def __init__(self, host: str, port: int, handler: Handler,
                 limits: ConnectionLimits = ConnectionLimits(), max_connections: int = 100) -> None:
        self._host = host
        self._port = port
        self._handler = handler
        self._limits = limits
        self._slots = threading.BoundedSemaphore(max_connections)
        self._listeners: List[socket.socket] = []
        self._stopping = threading.Event()

    @property
    def address(self) -> Tuple[str, int]:
        if not self._listeners:
            raise RuntimeError("server is not bound yet")
        return self._listeners[0].getsockname()[:2]

    def bind(self) -> None:
        self._listeners = open_listeners(self._host, self._port)
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
        except OSError as error:
            log.warning("accept failed: %s", error)
            return
        sock.settimeout(None)
        if not self._slots.acquire(blocking=False):
            # Over capacity. There is no request to answer yet, so just close.
            log.warning("too many connections; refusing %s", address[0])
            sock.close()
            return
        peer = f"{address[0]}:{address[1]}"
        connection = ServerConnection(sock, peer, self._handler, self._limits)
        threading.Thread(target=self._run, args=(connection,), daemon=True).start()

    def _run(self, connection: ServerConnection) -> None:
        try:
            connection.serve()
        finally:
            self._slots.release()


def open_listeners(host: str, port: int) -> List[socket.socket]:
    """One listener per address `host` resolves to ("localhost" is ::1 and
    127.0.0.1); with port 0 they all share the port the first one got."""
    infos = socket.getaddrinfo(host, port, type=socket.SOCK_STREAM, flags=socket.AI_PASSIVE)
    addresses = list(dict.fromkeys((family, sockaddr[0]) for family, _, _, _, sockaddr in infos))

    listeners: List[socket.socket] = []
    for family, ip in addresses:
        try:
            listener = socket.create_server((ip, port), family=family)
        except OSError as error:
            log.warning("could not listen on %s: %s", ip, error)
            continue
        listener.setblocking(False)
        listeners.append(listener)
        port = listener.getsockname()[1]
    if not listeners:
        raise OSError(f"could not listen on any address for {host}:{port}")
    return listeners
