"""Reproduce the marking run: one socket, six requests, report whether it survived.

    python3 scripts/mark.py [--port 8080] [--pipeline]
"""

from __future__ import annotations

import argparse
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from tests.http_client import RawClient  # noqa: E402

REQUESTS = [
    ("GET", "/add?a=2&b=3"),
    ("GET", "/sub?a=10&b=4"),
    ("GET", "/mul?a=6&b=7"),
    ("GET", "/div?a=1&b=0"),
    ("GET", "/pow?a=2&b=8"),
    ("POST", "/add"),
]


def encode(method: str, target: str) -> bytes:
    return f"{method} {target} HTTP/1.1\r\nHost: localhost\r\n\r\n".encode()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8080)
    parser.add_argument("--pipeline", action="store_true", help="send all six requests in one write")
    args = parser.parse_args()

    client = RawClient(("localhost", args.port))
    if args.pipeline:
        client.send(b"".join(encode(m, t) for m, t in REQUESTS))

    for method, target in REQUESTS:
        if not args.pipeline:
            client.send(encode(method, target))
        response = client.read_response()
        body = response.body.decode() if response.status == 200 else ""
        print(f"  {method + ' ' + target:<22} -> {response.status}   {body}")

    print()
    print(f"  socket still open: {client.is_still_open()}")
    print(f"  1 TCP handshake, {len(REQUESTS)} responses")
    client.close()


if __name__ == "__main__":
    main()
