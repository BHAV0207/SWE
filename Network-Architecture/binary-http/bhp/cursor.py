"""A read position over a byte string that can record what each byte meant.

Decoders read through a Cursor. Given a recorder, every read is logged as a
Span (offset, bytes, meaning) -- which is exactly an annotated hexdump. So the
annotation is produced by the real decoder, not a second copy of the spec.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, List, Optional

from .errors import MalformedMessage


@dataclass(frozen=True)
class Span:
    offset: int
    data: bytes
    meaning: str


class Cursor:
    def __init__(self, data: bytes, base_offset: int = 0, recorder: Optional[List[Span]] = None) -> None:
        self._data = data
        self._position = 0
        self._base_offset = base_offset
        self._recorder = recorder

    @property
    def remaining(self) -> int:
        return len(self._data) - self._position

    def take(self, count: int, meaning: Callable[[bytes], str]) -> bytes:
        if count > self.remaining:
            raise MalformedMessage(f"needed {count} more bytes, only {self.remaining} left")
        chunk = self._data[self._position : self._position + count]
        self._record(chunk, meaning(chunk))
        self._position += count
        return chunk

    def take_uint(self, size: int, meaning: Callable[[int], str]) -> int:
        """Big-endian (network order) unsigned integer of `size` bytes."""
        raw = self.take(size, lambda chunk: meaning(int.from_bytes(chunk, "big")))
        return int.from_bytes(raw, "big")

    def take_text(self, count: int, label: str) -> str:
        raw = self.take(count, lambda chunk: f"{label} = {chunk.decode('utf-8', 'replace')!r}")
        try:
            return raw.decode("utf-8")
        except UnicodeDecodeError:
            raise MalformedMessage(f"{label} is not valid UTF-8") from None

    def note_rest(self, meaning: str) -> bytes:
        """Consume everything left under one label."""
        return self.take(self.remaining, lambda _: meaning)

    def _record(self, chunk: bytes, meaning: str) -> None:
        if self._recorder is not None:
            self._recorder.append(Span(self._base_offset + self._position, chunk, meaning))
