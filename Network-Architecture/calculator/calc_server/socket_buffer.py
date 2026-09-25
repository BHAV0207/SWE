"""Buffered reads over a socket that never consume more than the caller asks for.

This is the heart of keep-alive: recv() hands us whatever TCP has, which may
include the start of the *next* request. Anything past what the current
request needs stays in the buffer for the next call to read_request().
"""

from __future__ import annotations

import socket
import time
from typing import Optional

from .http_types import ProtocolError

_RECV_SIZE = 4096


class SocketBuffer:
    def __init__(self, sock: socket.socket) -> None:
        self._sock = sock
        self._buffer = bytearray()
        self._deadline: Optional[float] = None

    @property
    def has_buffered_data(self) -> bool:
        return bool(self._buffer)

    def set_deadline(self, seconds_from_now: Optional[float]) -> None:
        """Bound the total time of all following reads (None = no bound)."""
        self._deadline = None if seconds_from_now is None else time.monotonic() + seconds_from_now

    def wait_for_data(self, timeout_seconds: float) -> bool:
        """Block until at least one byte is available. False on EOF or timeout."""
        if self._buffer:
            return True
        self.set_deadline(timeout_seconds)
        try:
            return self._fill()
        except TimeoutError:
            return False

    def read_until(self, delimiter: bytes, max_bytes: int, too_long_status: int = 400) -> bytes:
        """Return bytes up to and including `delimiter`; leave the rest buffered."""
        search_from = 0
        while True:
            index = self._buffer.find(delimiter, search_from)
            end = index + len(delimiter) if index != -1 else len(self._buffer)
            # Checked whether or not the delimiter was found: an oversized
            # head can arrive in a single recv().
            if end > max_bytes:
                raise ProtocolError(too_long_status, "line or header section too long")
            if index != -1:
                return self._take(end)
            # The delimiter may straddle two recv() calls; rescan the overlap.
            search_from = max(0, len(self._buffer) - len(delimiter) + 1)
            self._fill_or_fail()

    def read_exact(self, count: int) -> bytes:
        """Return exactly `count` bytes. Byte count+1 belongs to someone else."""
        while len(self._buffer) < count:
            self._fill_or_fail()
        return self._take(count)

    def _take(self, count: int) -> bytes:
        chunk = bytes(self._buffer[:count])
        del self._buffer[:count]
        return chunk

    def _fill_or_fail(self) -> None:
        if not self._fill():
            raise ProtocolError(400, "connection closed in the middle of a request")

    def _fill(self) -> bool:
        """recv() once into the buffer. False on EOF; TimeoutError past deadline."""
        self._sock.settimeout(self._remaining_time())
        try:
            data = self._sock.recv(_RECV_SIZE)
        except socket.timeout as exc:
            raise TimeoutError("read deadline exceeded") from exc
        if not data:
            return False
        self._buffer += data
        return True

    def _remaining_time(self) -> Optional[float]:
        if self._deadline is None:
            return None
        remaining = self._deadline - time.monotonic()
        if remaining <= 0:
            raise TimeoutError("read deadline exceeded")
        return remaining
