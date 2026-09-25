"""Turn the byte stream into Request objects, one message at a time.

The only question that matters on a persistent connection: where does this
request end? RFC 9112 section 6.3 answers it, and so does this module:

  1. Transfer-Encoding: chunked  -> read chunks until the zero-size chunk.
  2. Content-Length: N           -> read exactly N bytes.
  3. neither                     -> the body is empty.

Anything that makes that answer ambiguous raises ProtocolError, because
guessing wrong means misreading every request after this one.
"""

from __future__ import annotations

import re
from typing import List, Tuple

from .config import ServerConfig
from .http_types import HTTP_1_0, HTTP_1_1, Headers, ProtocolError, Request
from .socket_buffer import SocketBuffer

CRLF = b"\r\n"
END_OF_HEAD = b"\r\n\r\n"

_TOKEN = r"[!#$%&'*+\-.^_`|~0-9A-Za-z]+"
_REQUEST_LINE = re.compile(rf"^({_TOKEN}) (\S+) (HTTP/\d\.\d)$")
_HEADER_NAME = re.compile(rf"^{_TOKEN}$")
_CHUNK_SIZE = re.compile(r"^([0-9A-Fa-f]+)(;.*)?$")
_SUPPORTED_VERSIONS = (HTTP_1_0, HTTP_1_1)


def read_request(buffer: SocketBuffer, config: ServerConfig) -> Request:
    head = _read_head(buffer, config.max_header_bytes)
    request_line, *header_lines = head.split("\r\n")

    method, target, version = _parse_request_line(request_line)
    headers = _parse_headers(header_lines)
    body = _read_body(buffer, headers, config.max_body_bytes)
    return Request(method=method, target=target, version=version, headers=headers, body=body)


def _read_head(buffer: SocketBuffer, max_bytes: int) -> str:
    # RFC 9112 2.2: ignore empty lines received before a request-line,
    # e.g. a stray CRLF some clients send after a body.
    while True:
        raw = buffer.read_until(END_OF_HEAD, max_bytes, too_long_status=431)
        head = raw[: -len(END_OF_HEAD)].lstrip(b"\r\n")
        if head:
            break
    try:
        return head.decode("ascii")
    except UnicodeDecodeError:
        raise ProtocolError(400, "request head is not ASCII") from None


def _parse_request_line(line: str) -> Tuple[str, str, str]:
    match = _REQUEST_LINE.match(line)
    if not match:
        raise ProtocolError(400, f"malformed request line: {line!r}")
    method, target, version = match.groups()
    if version not in _SUPPORTED_VERSIONS:
        raise ProtocolError(505, f"unsupported version {version}")
    return method, target, version


def _parse_headers(lines: List[str]) -> Headers:
    headers = Headers()
    for line in lines:
        if line[:1] in (" ", "\t"):
            raise ProtocolError(400, "obsolete line folding is not accepted")
        name, colon, value = line.partition(":")
        # No whitespace allowed between name and colon (RFC 9112 5.1):
        # the classic request-smuggling vector.
        if not colon or not _HEADER_NAME.match(name):
            raise ProtocolError(400, f"malformed header line: {line!r}")
        headers.add(name, value.strip(" \t"))
    return headers


def _read_body(buffer: SocketBuffer, headers: Headers, max_bytes: int) -> bytes:
    if "Transfer-Encoding" in headers:
        if "Content-Length" in headers:
            # Two framings disagreeing is how smuggling works. Refuse both.
            raise ProtocolError(400, "both Transfer-Encoding and Content-Length present")
        if headers.comma_tokens("Transfer-Encoding") != ["chunked"]:
            raise ProtocolError(501, "only 'Transfer-Encoding: chunked' is supported")
        return _read_chunked_body(buffer, max_bytes)

    if "Content-Length" in headers:
        length = _parse_content_length(headers.get_all("Content-Length"))
        if length > max_bytes:
            raise ProtocolError(413, f"body of {length} bytes exceeds limit")
        return buffer.read_exact(length)

    return b""


def _parse_content_length(values: List[str]) -> int:
    # "Content-Length: 5, 5" or repeated identical headers are legal.
    candidates = {token.strip() for value in values for token in value.split(",")}
    if len(candidates) != 1:
        raise ProtocolError(400, "conflicting Content-Length values")
    (text,) = candidates
    if not text.isdigit() or not text.isascii():
        raise ProtocolError(400, f"invalid Content-Length: {text!r}")
    return int(text)


def _read_chunked_body(buffer: SocketBuffer, max_bytes: int) -> bytes:
    body = bytearray()
    while True:
        size = _read_chunk_size(buffer)
        if size == 0:
            break
        if len(body) + size > max_bytes:
            raise ProtocolError(413, "chunked body exceeds limit")
        body += buffer.read_exact(size)
        if buffer.read_exact(len(CRLF)) != CRLF:
            raise ProtocolError(400, "chunk data not followed by CRLF")
    _discard_trailers(buffer, max_bytes)
    return bytes(body)


def _read_chunk_size(buffer: SocketBuffer) -> int:
    line = buffer.read_until(CRLF, max_bytes=1024)[: -len(CRLF)]
    match = _CHUNK_SIZE.match(line.decode("ascii", errors="replace"))
    if not match:
        raise ProtocolError(400, f"malformed chunk size line: {line!r}")
    return int(match.group(1), 16)


def _discard_trailers(buffer: SocketBuffer, max_bytes: int) -> None:
    # Trailer fields end with an empty line; we have no use for them.
    while buffer.read_until(CRLF, max_bytes) != CRLF:
        pass
