"""bcurl [-v] [-I] HOST:PORT/PATH [/PATH ...] -- fetch over ONE BHP/1 connection.

Exit status: 0 all responses 1xx-3xx, 1 any 4xx/5xx, 2 bad usage,
3 connection or protocol failure.
"""

from __future__ import annotations

import argparse
import sys
from typing import List, Optional, Tuple
from urllib.parse import unquote, urlsplit

from . import annotate
from .client import BhpClient, RequestTooLarge, ServerWentAway
from .errors import ConnectionClosed, IdleTimeout, ProtocolViolation
from .protocol import Method

DEFAULT_PORT = 9000
EXIT_OK, EXIT_HTTP_ERROR, EXIT_USAGE, EXIT_FAILURE = 0, 1, 2, 3


class UsageError(Exception):
    pass


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(prog="bcurl", description="BHP/1 client")
    parser.add_argument("-v", "--verbose", action="count", default=0,
                        help="hexdump every frame to stderr (-vv: do not shorten large frames)")
    parser.add_argument("-I", "--head", action="store_true", help="send HEAD instead of GET")
    parser.add_argument("urls", nargs="+", metavar="URL",
                        help="host:port/path; extra URLs may be bare /paths on the same connection")
    args = parser.parse_args(argv)

    try:
        host, port, paths = parse_targets(args.urls)
    except UsageError as error:
        print(f"bcurl: {error}", file=sys.stderr)
        return EXIT_USAGE

    method = Method.HEAD if args.head else Method.GET
    trace = _frame_printer(full=args.verbose >= 2) if args.verbose else None
    try:
        with BhpClient(host, port, trace=trace) as client:
            statuses = [_fetch(client, path, method, args.verbose) for path in paths]
    except RequestTooLarge as error:
        print(f"bcurl: {error}", file=sys.stderr)
        return EXIT_USAGE
    except (OSError, ProtocolViolation, ConnectionClosed, IdleTimeout, ServerWentAway) as error:
        print(f"bcurl: {error or type(error).__name__}", file=sys.stderr)
        return EXIT_FAILURE
    return EXIT_HTTP_ERROR if any(status >= 400 for status in statuses) else EXIT_OK


def parse_targets(urls: List[str]) -> Tuple[str, int, List[str]]:
    """First URL fixes host:port; later ones must match it (one connection)."""
    host, port, first_path = _parse_url(urls[0])
    if host is None:
        raise UsageError(f"first URL needs a host: {urls[0]!r}")
    paths = [first_path]
    for url in urls[1:]:
        other_host, other_port, path = _parse_url(url)
        if other_host is not None and (other_host, other_port) != (host, port):
            raise UsageError(f"{url!r} is on a different server; bcurl never opens a second connection")
        paths.append(path)
    return host, port, paths


def _parse_url(url: str):
    if url.startswith("/"):
        return None, None, url
    parts = urlsplit(url if "://" in url else "bhp://" + url)
    path = unquote(parts.path or "/") + (f"?{parts.query}" if parts.query else "")
    try:
        port = parts.port or DEFAULT_PORT
    except ValueError:
        raise UsageError(f"bad port in {url!r}") from None
    return parts.hostname, port, path


def _fetch(client: BhpClient, path: str, method: Method, verbose: int) -> int:
    response = client.fetch(path, method, on_data=sys.stdout.buffer.write)
    sys.stdout.buffer.flush()
    if verbose:
        print(f"* {path} -> {response.status}", file=sys.stderr)
    return response.status


def _frame_printer(full: bool):
    def print_frame(direction: str, raw: bytes) -> None:
        sender = "client" if direction == "send" else "server"
        print("\n".join(annotate.describe(raw, sender, full)) + "\n", file=sys.stderr)
    return print_frame
