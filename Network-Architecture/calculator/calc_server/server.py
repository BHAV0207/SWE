"""Accept loop: one thread per connection."""

from __future__ import annotations

import logging
import socket
import threading
from typing import Optional

from .app import handle_request
from .config import ServerConfig
from .connection import Connection, Handler

log = logging.getLogger(__name__)

# How often the accept loop wakes up to check whether it should stop.
_ACCEPT_POLL_SECONDS = 0.5


class CalculatorServer:
    def __init__(self, config: ServerConfig, handler: Handler = handle_request) -> None:
        self._config = config
        self._handler = handler
        self._listener: Optional[socket.socket] = None
        self._stopping = threading.Event()

    @property
    def address(self):
        """Actual (host, port) bound; useful when the port was 0."""
        if self._listener is None:
            raise RuntimeError("server is not bound yet")
        return self._listener.getsockname()[:2]

    def bind(self) -> None:
        self._listener = socket.create_server((self._config.host, self._config.port))
        self._listener.settimeout(_ACCEPT_POLL_SECONDS)
        log.info("listening on %s:%d", *self.address)

    def serve_forever(self) -> None:
        if self._listener is None:
            self.bind()
        with self._listener:
            while not self._stopping.is_set():
                try:
                    sock, address = self._listener.accept()
                except socket.timeout:
                    continue
                sock.settimeout(None)  # don't inherit the listener's poll timeout
                connection = Connection(sock, address, self._handler, self._config)
                threading.Thread(target=connection.serve, daemon=True).start()

    def stop(self) -> None:
        self._stopping.set()
