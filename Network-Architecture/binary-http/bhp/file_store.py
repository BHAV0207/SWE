"""Map a request path to a file under the document root, and never outside it."""

from __future__ import annotations

import mimetypes
import os
from typing import BinaryIO, Iterator

_READ_CHUNK = 64 * 1024
_INDEX_FILE = "index.html"


class FileNotFound(Exception):
    pass


class FileForbidden(Exception):
    pass


class OpenFile:
    """An opened file and the metadata its response headers need.

    Size comes from fstat() on the same open handle that is later read, so
    the headers describe exactly the bytes we send. Iterating yields exactly
    `size` bytes, so content-length always matches the DATA frames (SPEC 5).
    """

    def __init__(self, path: str, file: BinaryIO) -> None:
        self.path = path
        self._file = file
        stat = os.fstat(file.fileno())
        self.size = stat.st_size
        self.modified = stat.st_mtime
        self.etag = f'"{stat.st_size:x}-{stat.st_mtime_ns:x}"'

    @property
    def content_type(self) -> str:
        guessed, _ = mimetypes.guess_type(self.path)
        if guessed is None:
            return "application/octet-stream"
        return f"{guessed}; charset=utf-8" if guessed.startswith("text/") else guessed

    def __iter__(self) -> Iterator[bytes]:
        remaining = self.size
        try:
            while remaining:
                chunk = self._file.read(min(_READ_CHUNK, remaining))
                if not chunk:
                    raise OSError(f"{self.path} shrank while it was being sent")
                remaining -= len(chunk)
                yield chunk
        finally:
            self.close()

    def close(self) -> None:
        self._file.close()


class FileStore:
    def __init__(self, root: str) -> None:
        self._root = os.path.realpath(root)
        if not os.path.isdir(self._root):
            raise NotADirectoryError(f"document root {root!r} is not a directory")

    def open(self, request_path: str) -> OpenFile:
        relative = request_path.split("?", 1)[0].lstrip("/")
        # realpath resolves "..", "." and symlinks, so the containment check
        # below sees where the path really points.
        candidate = os.path.realpath(os.path.join(self._root, relative))
        if not self._is_inside_root(candidate):
            raise FileNotFound(request_path)  # don't reveal what exists outside
        if os.path.isdir(candidate):
            candidate = os.path.join(candidate, _INDEX_FILE)
        if not os.path.isfile(candidate):  # also rejects FIFOs and devices
            raise FileNotFound(request_path)
        try:
            return OpenFile(candidate, open(candidate, "rb"))
        except PermissionError:
            raise FileForbidden(request_path) from None
        except FileNotFoundError:  # deleted since the isfile() check
            raise FileNotFound(request_path) from None

    def _is_inside_root(self, path: str) -> bool:
        return path == self._root or path.startswith(self._root + os.sep)
