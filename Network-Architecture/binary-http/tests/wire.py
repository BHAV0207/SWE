"""Hand-built BHP/1 bytes for tests, written straight from SPEC.md.

Deliberately does NOT use bhp's encoders: if the implementation and the spec
drift apart, these tests catch it.
"""

from __future__ import annotations

import socket
from typing import List, Tuple

PREFACE = b"BHP\x01"
HEADERS, DATA, GOAWAY = 0x01, 0x02, 0x03
END_STREAM = 0x01
GET, HEAD = 0x01, 0x02


def frame(type_: int, flags: int, stream_id: int, payload: bytes = b"") -> bytes:
    return len(payload).to_bytes(3, "big") + bytes([type_, flags]) + stream_id.to_bytes(3, "big") + payload


def request_payload(path: str, method: int = GET, fields: bytes = b"") -> bytes:
    raw = path.encode()
    return bytes([method]) + len(raw).to_bytes(2, "big") + raw + fields


def request(stream_id: int, path: str, method: int = GET) -> bytes:
    host = b"\x01\x00\x0elocalhost:9000"  # name #1 (host), length 14, value
    return frame(HEADERS, END_STREAM, stream_id, request_payload(path, method, host))


def read_exact(sock: socket.socket, count: int) -> bytes:
    data = b""
    while len(data) < count:
        chunk = sock.recv(count - len(data))
        if not chunk:
            raise EOFError(f"closed after {len(data)} of {count} bytes")
        data += chunk
    return data


def read_frame(sock: socket.socket) -> Tuple[int, int, int, bytes]:
    header = read_exact(sock, 8)
    length = int.from_bytes(header[0:3], "big")
    return header[3], header[4], int.from_bytes(header[5:8], "big"), read_exact(sock, length)


def read_response(sock: socket.socket) -> Tuple[int, bytes, List[Tuple[int, int, int, bytes]]]:
    """(status, body, frames) for one response stream."""
    frames = []
    status, body = None, b""
    while True:
        type_, flags, stream_id, payload = read_frame(sock)
        frames.append((type_, flags, stream_id, payload))
        if type_ == HEADERS:
            status = int.from_bytes(payload[:2], "big")
        elif type_ == DATA:
            body += payload
        if flags & END_STREAM:
            return status, body, frames


def goaway_code(payload: bytes) -> int:
    return payload[3]
