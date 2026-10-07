"""Payload formats for HEADERS and GOAWAY frames.

Request HEADERS:   method (1) | path length (2) | path | fields...
Response HEADERS:  status (2) | fields...
Field:             name index (1) [| name length (1) | name] | value length (2) | value
GOAWAY:            last stream id (3) | error code (1) | debug text...

Fields run to the end of the payload: the frame Length already says where
that is, so a field count would only be a second number that could disagree.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import List, Optional, Tuple

from .cursor import Cursor, Span
from .errors import MalformedMessage
from .protocol import (
    LITERAL_NAME_INDEX,
    NAME_LENGTH_SIZE,
    PATH_LENGTH_SIZE,
    STATIC_INDEX,
    STATIC_TABLE,
    VALUE_LENGTH_SIZE,
    ErrorCode,
    Method,
    name_of,
)

Fields = List[Tuple[str, str]]

_NAME = re.compile(r"^[a-z0-9!#$%&'*+\-.^_`|~]+$")  # lowercase HTTP token
_MAX_UINT = {size: (1 << (8 * size)) - 1 for size in (1, 2, 3)}


@dataclass(frozen=True)
class RequestHead:
    method: int
    path: str
    fields: Fields = field(default_factory=list)


@dataclass(frozen=True)
class ResponseHead:
    status: int
    fields: Fields = field(default_factory=list)

    def get(self, name: str) -> Optional[str]:
        return next((value for key, value in self.fields if key == name), None)


@dataclass(frozen=True)
class GoAway:
    last_stream_id: int
    code: int
    debug: str = ""


# ---- encoding ---------------------------------------------------------------

def encode_request_head(request: RequestHead) -> bytes:
    path = request.path.encode("utf-8")
    return _uint(request.method, 1) + _uint(len(path), PATH_LENGTH_SIZE) + path + _encode_fields(request.fields)


def encode_response_head(response: ResponseHead) -> bytes:
    return _uint(response.status, 2) + _encode_fields(response.fields)


def encode_goaway(goaway: GoAway) -> bytes:
    return _uint(goaway.last_stream_id, 3) + _uint(goaway.code, 1) + goaway.debug.encode("utf-8")


def _encode_fields(fields: Fields) -> bytes:
    return b"".join(_encode_field(name, value) for name, value in fields)


def _encode_field(name: str, value: str) -> bytes:
    name = name.lower()
    index = STATIC_INDEX.get(name)
    if index is not None:
        encoded_name = _uint(index, 1)
    else:
        raw_name = name.encode("ascii")
        encoded_name = _uint(LITERAL_NAME_INDEX, 1) + _uint(len(raw_name), NAME_LENGTH_SIZE) + raw_name
    raw_value = value.encode("utf-8")
    return encoded_name + _uint(len(raw_value), VALUE_LENGTH_SIZE) + raw_value


def _uint(value: int, size: int) -> bytes:
    if not 0 <= value <= _MAX_UINT[size]:
        raise ValueError(f"{value} does not fit in {size} byte(s)")
    return value.to_bytes(size, "big")


# ---- decoding ---------------------------------------------------------------
# Each decoder takes an optional recorder; see cursor.py.

def decode_request_head(payload: bytes, base_offset: int = 0, recorder: Optional[List[Span]] = None) -> RequestHead:
    cursor = Cursor(payload, base_offset, recorder)
    method = cursor.take_uint(1, lambda v: f"method = {name_of(Method, v)}")
    path_length = cursor.take_uint(PATH_LENGTH_SIZE, lambda v: f"path length = {v}")
    path = cursor.take_text(path_length, "path")
    if not path.startswith("/") or "\0" in path:
        raise MalformedMessage(f"path must start with '/' and contain no NUL: {path!r}")
    return RequestHead(method, path, _decode_fields(cursor))


def decode_response_head(payload: bytes, base_offset: int = 0, recorder: Optional[List[Span]] = None) -> ResponseHead:
    cursor = Cursor(payload, base_offset, recorder)
    status = cursor.take_uint(2, lambda v: f"status = {v}")
    if not 100 <= status <= 599:
        raise MalformedMessage(f"status {status} is not in 100..599")
    return ResponseHead(status, _decode_fields(cursor))


def decode_goaway(payload: bytes, base_offset: int = 0, recorder: Optional[List[Span]] = None) -> GoAway:
    cursor = Cursor(payload, base_offset, recorder)
    last_stream_id = cursor.take_uint(3, lambda v: f"last stream id = {v}")
    code = cursor.take_uint(1, lambda v: f"error code = {name_of(ErrorCode, v)}")
    debug = cursor.take_text(cursor.remaining, "debug text") if cursor.remaining else ""
    return GoAway(last_stream_id, code, debug)


def _decode_fields(cursor: Cursor) -> Fields:
    fields: Fields = []
    while cursor.remaining:
        name = _decode_name(cursor)
        value_length = cursor.take_uint(VALUE_LENGTH_SIZE, lambda v: f"  value length = {v}")
        fields.append((name, cursor.take_text(value_length, "  value")))
    return fields


def _decode_name(cursor: Cursor) -> str:
    index = cursor.take_uint(1, _describe_name_index)
    if index == LITERAL_NAME_INDEX:
        length = cursor.take_uint(NAME_LENGTH_SIZE, lambda v: f"  name length = {v}")
        name = cursor.take_text(length, "  name")
        if not _NAME.match(name):
            raise MalformedMessage(f"literal name {name!r} is not a lowercase token")
        return name
    if index < len(STATIC_TABLE):
        return STATIC_TABLE[index]
    raise MalformedMessage(f"name index {index} is reserved")


def _describe_name_index(index: int) -> str:
    if index == LITERAL_NAME_INDEX:
        return "field: literal name follows"
    if index < len(STATIC_TABLE):
        return f"field: name #{index} = {STATIC_TABLE[index]}"
    return f"field: name #{index} (reserved!)"
