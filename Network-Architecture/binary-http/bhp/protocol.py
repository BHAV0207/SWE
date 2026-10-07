"""BHP/1 wire constants. This module is SPEC.md written as code: if a number
changes here, the spec changes with it."""

from __future__ import annotations

from enum import IntEnum
from typing import Dict, Optional, Tuple

# Sent once by the client when the connection opens: "BHP" + version byte.
PREFACE_MAGIC = b"BHP"
PROTOCOL_VERSION = 1
PREFACE = PREFACE_MAGIC + bytes([PROTOCOL_VERSION])

# Frame header: Length (24) | Type (8) | Flags (8) | Stream ID (24) = 8 bytes.
FRAME_HEADER_SIZE = 8
LENGTH_BITS = 24
STREAM_ID_BITS = 24
MAX_STREAM_ID = (1 << STREAM_ID_BITS) - 1

# The Length field can express 16 MiB; version 1 caps payloads at 16 KiB.
# The spare range is deliberate headroom for a version 2 (see SPEC.md).
MAX_PAYLOAD_SIZE = 16 * 1024

# Stream 0 is the connection itself; requests use 1, 2, 3, ...
CONNECTION_STREAM_ID = 0


class FrameType(IntEnum):
    HEADERS = 0x01
    DATA = 0x02
    GOAWAY = 0x03


# Flag bits. Unknown bits MUST be ignored by receivers.
END_STREAM = 0x01


class Method(IntEnum):
    GET = 0x01
    HEAD = 0x02


class ErrorCode(IntEnum):
    NO_ERROR = 0x00
    PROTOCOL_ERROR = 0x01
    FRAME_TOO_LARGE = 0x02
    TIMEOUT = 0x03


# Header field names. Index 0 means "literal name follows"; 1..10 are the
# names BHP/1 peers actually send; 11..255 are reserved.
LITERAL_NAME_INDEX = 0x00
STATIC_TABLE: Tuple[Optional[str], ...] = (
    None,               # 0: literal
    "host",             # 1
    "user-agent",       # 2
    "accept",           # 3
    "accept-encoding",  # 4
    "content-type",     # 5
    "content-length",   # 6
    "last-modified",    # 7
    "etag",             # 8
    "server",           # 9
    "date",             # 10
)
STATIC_INDEX: Dict[str, int] = {name: index for index, name in enumerate(STATIC_TABLE) if name}

# Widths of the length prefixes inside a HEADERS payload.
PATH_LENGTH_SIZE = 2
NAME_LENGTH_SIZE = 1
VALUE_LENGTH_SIZE = 2


def name_of(enum_type, value: int) -> str:
    """'GET' for a known code, '0x7f (unknown)' otherwise."""
    try:
        return enum_type(value).name
    except ValueError:
        return f"0x{value:02x} (unknown)"
