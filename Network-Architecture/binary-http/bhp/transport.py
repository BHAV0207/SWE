"""Byte-level socket I/O: exact reads with deadlines, timed writes."""

from __future__ import annotations

import socket
import time
from typing import Callable, Optional

_RECV_SIZE = 64 * 1024

# Called with ("send" | "recv", raw bytes) for every preface/frame on the wire.
Trace = Callable[[str, bytes], None]


class SocketReader:
    def __init__(self, sock: socket.socket) -> None:
        self._sock = sock
        self._buffer = bytearray()
        self._deadline: Optional[float] = None

    def set_deadline(self, seconds_from_now: Optional[float]) -> None:
        """Bound the total time of the following reads (None = unbounded)."""
        self._deadline = None if seconds_from_now is None else time.monotonic() + seconds_from_now

    def wait_for_data(self, timeout_seconds: Optional[float]) -> bool:
        """Block until a byte is available. False on clean EOF; TimeoutError on timeout."""
        if self._buffer:
            return True
        self.set_deadline(timeout_seconds)
        return self._fill()

    def read_exact(self, count: int) -> bytes:
        """Exactly `count` bytes. EOFError if the peer closes first."""
        while len(self._buffer) < count:
            if not self._fill():
                raise EOFError(f"connection closed after {len(self._buffer)} of {count} bytes")
        chunk = bytes(self._buffer[:count])
        del self._buffer[:count]
        return chunk

    def _fill(self) -> bool:
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


class SocketWriter:
    def __init__(self, sock: socket.socket, send_timeout: float, trace: Optional[Trace] = None) -> None:
        self._sock = sock
        self._send_timeout = send_timeout
        self._trace = trace

    def send(self, data: bytes) -> None:
        if self._trace:
            self._trace("send", data)
        # Reads leave the socket timeout at whatever their deadline had left.
        self._sock.settimeout(self._send_timeout)
        self._sock.sendall(data)
