"""Decide the response to a well-formed request. Knows nothing about frames."""

from __future__ import annotations

from dataclasses import dataclass, field
from email.utils import formatdate
from typing import Iterable

from .file_store import FileForbidden, FileNotFound, FileStore
from .messages import Fields, RequestHead
from .protocol import Method

ALLOWED_METHODS = (Method.GET, Method.HEAD)


@dataclass
class Response:
    status: int
    fields: Fields = field(default_factory=list)
    body: Iterable[bytes] = ()


def text_response(status: int, text: str) -> Response:
    body = text.encode("utf-8") + b"\n"
    return Response(status, [("content-type", "text/plain; charset=utf-8"),
                             ("content-length", str(len(body)))], [body])


class StaticFileHandler:
    def __init__(self, store: FileStore) -> None:
        self._store = store

    def __call__(self, request: RequestHead) -> Response:
        if request.method not in ALLOWED_METHODS:
            response = text_response(405, "only GET and HEAD are supported")
            # "allow" is not in the static table: it goes out as a literal name.
            response.fields.append(("allow", "GET, HEAD"))
            return response
        try:
            file = self._store.open(request.path)
        except FileNotFound:
            return text_response(404, f"not found: {request.path}")
        except FileForbidden:
            return text_response(403, f"forbidden: {request.path}")

        fields = [
            ("content-type", file.content_type),
            ("content-length", str(file.size)),
            ("last-modified", formatdate(file.modified, usegmt=True)),
            ("etag", file.etag),
        ]
        if request.method == Method.HEAD:
            file.close()
            return Response(200, fields)  # HEAD: same headers, no DATA (SPEC 5)
        return Response(200, fields, file)
