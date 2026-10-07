"""Frames: an 8-byte header that says how long the payload is, then the payload.

    +-------------------------------+---------------+
    |          Length (24)          |   Type (8)    |
    +---------------+---------------+---------------+
    |   Flags (8)   |        Stream ID (24)         |
    +---------------+-------------------------------+
    |               Payload (Length bytes)          |

Because Length comes first and is always there, a receiver can find the end
of ANY frame -- including a type it has never heard of -- and skip it.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

from .cursor import Cursor, Span
from .errors import ConnectionClosed, IdleTimeout, ProtocolViolation
from .protocol import (
    END_STREAM,
    FRAME_HEADER_SIZE,
    MAX_PAYLOAD_SIZE,
    MAX_STREAM_ID,
    PREFACE,
    PREFACE_MAGIC,
    ErrorCode,
    FrameType,
    name_of,
)
from .transport import SocketReader, Trace


@dataclass(frozen=True)
class Frame:
    type: int
    flags: int
    stream_id: int
    payload: bytes = b""

    @property
    def end_stream(self) -> bool:
        return bool(self.flags & END_STREAM)

    def encode(self) -> bytes:
        if len(self.payload) > MAX_PAYLOAD_SIZE:
            raise ValueError(f"payload of {len(self.payload)} bytes exceeds {MAX_PAYLOAD_SIZE}")
        if not 0 <= self.stream_id <= MAX_STREAM_ID:
            raise ValueError(f"stream id {self.stream_id} out of range")
        return (
            len(self.payload).to_bytes(3, "big")
            + bytes([self.type, self.flags])
            + self.stream_id.to_bytes(3, "big")
            + self.payload
        )


@dataclass(frozen=True)
class FrameHeader:
    length: int
    type: int
    flags: int
    stream_id: int


def decode_frame_header(raw: bytes, recorder: Optional[List[Span]] = None) -> FrameHeader:
    cursor = Cursor(raw, recorder=recorder)
    return FrameHeader(
        length=cursor.take_uint(3, lambda v: f"length = {v}"),
        type=cursor.take_uint(1, lambda v: f"type = {name_of(FrameType, v)}"),
        flags=cursor.take_uint(1, describe_flags),
        stream_id=cursor.take_uint(3, lambda v: f"stream id = {v}"),
    )


def describe_flags(flags: int) -> str:
    names = ["END_STREAM"] if flags & END_STREAM else []
    unknown = flags & ~END_STREAM
    if unknown:
        names.append(f"unknown bits 0x{unknown:02x} (ignored)")
    return "flags = " + (" | ".join(names) if names else "none")


class FrameReader:
    def __init__(self, reader: SocketReader, frame_timeout: float, trace: Optional[Trace] = None) -> None:
        self._reader = reader
        self._frame_timeout = frame_timeout
        self._trace = trace

    def read_preface(self, wait_timeout: Optional[float]) -> None:
        raw = self._read_exact_after_wait(len(PREFACE), wait_timeout)
        if raw[: len(PREFACE_MAGIC)] != PREFACE_MAGIC:
            raise ProtocolViolation(ErrorCode.PROTOCOL_ERROR, "connection preface is not 'BHP'")
        if raw != PREFACE:
            raise ProtocolViolation(ErrorCode.PROTOCOL_ERROR, f"unsupported protocol version {raw[-1]}")

    def read_frame(self, wait_timeout: Optional[float]) -> Frame:
        """Wait up to `wait_timeout` for a frame to start (IdleTimeout), raise
        ConnectionClosed on a clean close, then read the whole frame within the
        frame deadline."""
        raw_header = self._read_exact_after_wait(FRAME_HEADER_SIZE, wait_timeout, trace=False)
        header = decode_frame_header(raw_header)
        if header.length > MAX_PAYLOAD_SIZE:
            if self._trace:
                self._trace("recv", raw_header)
            raise ProtocolViolation(
                ErrorCode.FRAME_TOO_LARGE, f"frame of {header.length} bytes exceeds {MAX_PAYLOAD_SIZE}")
        payload = self._read_exact(header.length)
        if self._trace:
            self._trace("recv", raw_header + payload)
        return Frame(header.type, header.flags, header.stream_id, payload)

    def _read_exact_after_wait(self, count: int, wait_timeout: Optional[float], trace: bool = True) -> bytes:
        try:
            has_data = self._reader.wait_for_data(wait_timeout)
        except TimeoutError:
            raise IdleTimeout(f"nothing received for {wait_timeout} s") from None
        if not has_data:
            raise ConnectionClosed()
        self._reader.set_deadline(self._frame_timeout)
        raw = self._read_exact(count)
        if trace and self._trace:
            self._trace("recv", raw)
        return raw

    def _read_exact(self, count: int) -> bytes:
        try:
            return self._reader.read_exact(count)
        except EOFError as error:
            raise ProtocolViolation(ErrorCode.PROTOCOL_ERROR, f"truncated frame: {error}") from None
        except TimeoutError:
            raise ProtocolViolation(ErrorCode.TIMEOUT, "frame not received in time") from None
