"""Human-readable dumps of wire bytes: a classic hexdump plus a field-by-field
breakdown produced by the real decoders (see cursor.py)."""

from __future__ import annotations

from typing import List, Optional

from .cursor import Span
from .errors import MalformedMessage
from .frames import decode_frame_header
from .messages import decode_goaway, decode_request_head, decode_response_head
from .protocol import FRAME_HEADER_SIZE, PREFACE, PREFACE_MAGIC, FrameType, name_of

_BYTES_PER_LINE = 16
_HEXDUMP_LIMIT = 256   # longer frames (file bodies) are shortened unless full=True
_SPAN_BYTES_SHOWN = 8  # a field longer than this shows its first bytes + "..."


def describe(raw: bytes, sender: str, full: bool = False) -> List[str]:
    """Title, hexdump and field breakdown for one preface or frame.

    `sender` is "client" or "server": a HEADERS payload is a request or a
    response depending on who sent it. Frames longer than 256 bytes (file
    bodies) are shortened in the hexdump unless `full`."""
    arrow = ">" if sender == "client" else "<"
    if raw == PREFACE or (len(raw) == len(PREFACE) and raw.startswith(PREFACE_MAGIC)):
        title = f"{arrow} PREFACE ({len(raw)} bytes)"
        spans = [Span(0, raw[:3], f"magic {raw[:3].decode('ascii', 'replace')!r}"),
                 Span(3, raw[3:], f"version = {raw[3]}")]
    else:
        title, spans = _describe_frame(raw, sender, arrow)
    return [title] + hexdump(raw, None if full else _HEXDUMP_LIMIT) + [""] + format_spans(spans)


def _describe_frame(raw: bytes, sender: str, arrow: str):
    spans: List[Span] = []
    header = decode_frame_header(raw[:FRAME_HEADER_SIZE], spans)
    payload = raw[FRAME_HEADER_SIZE:]
    type_name = name_of(FrameType, header.type)
    flags = " END_STREAM" if header.flags & 1 else ""
    title = f"{arrow} {type_name} stream={header.stream_id}{flags} ({len(raw)} bytes)"

    try:
        if header.type == FrameType.HEADERS:
            decode = decode_request_head if sender == "client" else decode_response_head
            decode(payload, FRAME_HEADER_SIZE, spans)
        elif header.type == FrameType.GOAWAY:
            decode_goaway(payload, FRAME_HEADER_SIZE, spans)
        elif payload:
            meaning = "body" if header.type == FrameType.DATA else "unknown frame type: payload skipped"
            spans.append(Span(FRAME_HEADER_SIZE, payload, f"{meaning} ({len(payload)} bytes)"))
    except MalformedMessage as error:
        consumed = spans[-1].offset + len(spans[-1].data) if spans else FRAME_HEADER_SIZE
        spans.append(Span(consumed, raw[consumed:], f"MALFORMED: {error}"))
    return title, spans


def hexdump(data: bytes, limit: Optional[int] = _HEXDUMP_LIMIT) -> List[str]:
    shown = len(data) if limit is None else min(len(data), limit)
    lines = []
    for offset in range(0, shown, _BYTES_PER_LINE):
        row = data[offset : offset + _BYTES_PER_LINE]
        hex_part = " ".join(f"{b:02x}" for b in row)
        text = "".join(chr(b) if 32 <= b < 127 else "." for b in row)
        lines.append(f"  {offset:04x}  {hex_part:<{_BYTES_PER_LINE * 3}}  |{text}|")
    if shown < len(data):
        lines.append(f"  ....  ({len(data) - shown} more bytes not shown; use -vv for all)")
    return lines


def format_spans(spans: List[Span]) -> List[str]:
    lines = []
    for span in spans:
        shown = " ".join(f"{b:02x}" for b in span.data[:_SPAN_BYTES_SHOWN])
        if len(span.data) > _SPAN_BYTES_SHOWN:
            shown += " .."
        lines.append(f"  {span.offset:04x}  {shown:<26}  {span.meaning}")
    return lines
