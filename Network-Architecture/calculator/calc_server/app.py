"""Map a well-framed Request to a Response.

Errors here are about *meaning* (unknown path, bad operand), not framing, so
the connection stays open afterwards: we already know where the request ended.
"""

from __future__ import annotations

from typing import Dict, List, Tuple
from urllib.parse import parse_qs, urlsplit

from .arithmetic import (
    OPERATIONS,
    CalculationError,
    InvalidOperand,
    Number,
    calculate,
    format_number,
    parse_number,
)
from .http_types import HTTP_1_1, Request, Response

# HEAD is GET without the body; RFC 9110 9.1 requires servers to support both.
ALLOWED_METHODS = ("GET", "HEAD")
OPERAND_NAMES = ("a", "b")


def handle_request(request: Request) -> Response:
    # Checked first: without a Host, an HTTP/1.1 request is invalid no matter
    # what it asks for (RFC 9112 3.2).
    if request.version == HTTP_1_1 and len(request.headers.get_all("Host")) != 1:
        return Response.text(400, "exactly one Host header is required")

    url = urlsplit(request.target)
    operation = url.path[1:] if url.path.startswith("/") else None
    if operation not in OPERATIONS:
        return Response.text(404, f"no such operation: {url.path}")

    if request.method not in ALLOWED_METHODS:
        response = Response.text(405, f"{request.method} not allowed on {url.path}")
        response.headers.add("Allow", ", ".join(ALLOWED_METHODS))
        return response

    try:
        a, b = _parse_operands(url.query)
        result = calculate(operation, a, b)
    except (InvalidOperand, CalculationError) as error:
        return Response.text(400, str(error))

    return Response.text(200, format_number(result))


def _parse_operands(query: str) -> Tuple[Number, Number]:
    params: Dict[str, List[str]] = parse_qs(query, keep_blank_values=True)
    a, b = (_single_param(params, name) for name in OPERAND_NAMES)
    return parse_number(a), parse_number(b)


def _single_param(params: Dict[str, List[str]], name: str) -> str:
    values = params.get(name, [])
    if len(values) != 1:
        raise InvalidOperand(f"expected exactly one '{name}' parameter")
    return values[0]
