"""Plain data types for HTTP/1.1 messages. No I/O happens here."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional, Tuple

HTTP_1_0 = "HTTP/1.0"
HTTP_1_1 = "HTTP/1.1"

REASON_PHRASES = {
    200: "OK",
    400: "Bad Request",
    404: "Not Found",
    405: "Method Not Allowed",
    408: "Request Timeout",
    413: "Content Too Large",
    431: "Request Header Fields Too Large",
    501: "Not Implemented",
    505: "HTTP Version Not Supported",
}


class Headers:
    """Ordered, case-insensitive header collection that keeps duplicates."""

    def __init__(self, fields: Optional[List[Tuple[str, str]]] = None) -> None:
        self._fields: List[Tuple[str, str]] = list(fields or [])

    def add(self, name: str, value: str) -> None:
        self._fields.append((name, value))

    def get_all(self, name: str) -> List[str]:
        wanted = name.lower()
        return [value for key, value in self._fields if key.lower() == wanted]

    def get(self, name: str) -> Optional[str]:
        values = self.get_all(name)
        return values[0] if values else None

    def __contains__(self, name: object) -> bool:
        return isinstance(name, str) and bool(self.get_all(name))

    def __iter__(self):
        return iter(self._fields)

    def comma_tokens(self, name: str) -> List[str]:
        """Lower-cased tokens across all occurrences, e.g. 'Connection: a, B'."""
        return [
            token.strip().lower()
            for value in self.get_all(name)
            for token in value.split(",")
            if token.strip()
        ]


@dataclass(frozen=True)
class Request:
    method: str
    target: str
    version: str
    headers: Headers
    body: bytes = b""


@dataclass
class Response:
    status: int
    body: bytes = b""
    headers: Headers = field(default_factory=Headers)

    @classmethod
    def text(cls, status: int, text: str) -> "Response":
        response = cls(status=status, body=text.encode("utf-8"))
        response.headers.add("Content-Type", "text/plain; charset=utf-8")
        return response

    def serialize(self) -> bytes:
        reason = REASON_PHRASES.get(self.status, "Unknown")
        lines = [f"{HTTP_1_1} {self.status} {reason}"]
        lines += [f"{name}: {value}" for name, value in self.headers]
        # Content-Length is always ours to set: it is what lets the client
        # find the end of this response without us hanging up.
        lines.append(f"Content-Length: {len(self.body)}")
        head = "\r\n".join(lines) + "\r\n\r\n"
        return head.encode("latin-1") + self.body


class ProtocolError(Exception):
    """The byte stream cannot be trusted any more: reply once, then close.

    Raised when we cannot tell where the current request ends, so reading a
    "next" request would mean parsing garbage.
    """

    def __init__(self, status: int, detail: str) -> None:
        super().__init__(detail)
        self.status = status
        self.detail = detail


class ConnectionClosed(Exception):
    """Peer closed the connection cleanly between requests."""
