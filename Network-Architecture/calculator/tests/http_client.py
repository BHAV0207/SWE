"""Minimal test client: reads responses framed by Content-Length."""

from __future__ import annotations

import socket
from dataclasses import dataclass
from typing import Dict


@dataclass
class ParsedResponse:
    status: int
    headers: Dict[str, str]
    body: bytes


class RawClient:
    def __init__(self, address, timeout: float = 3.0) -> None:
        self.sock = socket.create_connection(address, timeout=timeout)
        self._buffer = b""

    def send(self, data: bytes) -> None:
        self.sock.sendall(data)

    def get(self, target: str, extra_headers: str = "") -> ParsedResponse:
        self.send(f"GET {target} HTTP/1.1\r\nHost: localhost\r\n{extra_headers}\r\n".encode())
        return self.read_response()

    def read_response(self) -> ParsedResponse:
        response = self.read_response_head()
        response.body = self._read_exact(int(response.headers["content-length"]))
        return response

    def read_response_head(self) -> ParsedResponse:
        """Status and headers only; for HEAD responses, which have no body."""
        head = self._read_until(b"\r\n\r\n").decode("latin-1")
        status_line, *header_lines = head[:-4].split("\r\n")
        headers = {}
        for line in header_lines:
            name, _, value = line.partition(":")
            headers[name.strip().lower()] = value.strip()
        return ParsedResponse(int(status_line.split(" ")[1]), headers, b"")

    def is_closed_by_peer(self) -> bool:
        """True if the server has closed its side (recv returns EOF)."""
        try:
            return self.sock.recv(1) == b""
        except (ConnectionResetError, BrokenPipeError):
            return True

    def is_still_open(self, wait: float = 0.2) -> bool:
        """True if nothing arrives and no EOF within `wait` seconds."""
        self.sock.settimeout(wait)
        try:
            return self.sock.recv(1, socket.MSG_PEEK) != b""
        except socket.timeout:
            return True
        except OSError:
            return False

    def close(self) -> None:
        self.sock.close()

    def _read_until(self, delimiter: bytes) -> bytes:
        while delimiter not in self._buffer:
            self._recv_more()
        index = self._buffer.index(delimiter) + len(delimiter)
        chunk, self._buffer = self._buffer[:index], self._buffer[index:]
        return chunk

    def _read_exact(self, count: int) -> bytes:
        while len(self._buffer) < count:
            self._recv_more()
        chunk, self._buffer = self._buffer[:count], self._buffer[count:]
        return chunk

    def _recv_more(self) -> None:
        data = self.sock.recv(4096)
        if not data:
            raise ConnectionError("server closed the connection")
        self._buffer += data
