"""Capture one real request/response and write docs/HEXDUMP.md.

    python3 tools/make_hexdump.py

The annotations come from bhp's own decoders (see bhp/cursor.py), so if this
file reads correctly, the decoders agree with SPEC.md byte for byte.
"""

from __future__ import annotations

import os
import sys
import threading

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

from bhp import annotate  # noqa: E402
from bhp.client import BhpClient  # noqa: E402
from bhp.file_store import FileStore  # noqa: E402
from bhp.handler import StaticFileHandler  # noqa: E402
from bhp.server import BhpServer  # noqa: E402

PATH = "/index.html"
OUTPUT = os.path.join(ROOT, "docs", "HEXDUMP.md")

INTRO = """# Annotated hexdump: one complete request and response

Captured from the real programs (`bcurl` -> `bserve ./www`) by
`tools/make_hexdump.py`. Each block shows the raw bytes, then every field:
offset, the bytes, and what they mean. The field breakdown is produced by the
same decoders the programs use, so it is proof the bytes match SPEC.md.

`>` = client to server, `<` = server to client. All integers big-endian.
"""


def main() -> None:
    handler = StaticFileHandler(FileStore(os.path.join(ROOT, "www")))
    # Same address as the assignment's example; any free port if 9000 is busy.
    try:
        server = BhpServer("localhost", 9000, handler)
        server.bind()
    except OSError:
        server = BhpServer("localhost", 0, handler)
        server.bind()
    threading.Thread(target=server.serve_forever, daemon=True).start()

    blocks = []

    def trace(direction: str, raw: bytes) -> None:
        sender = "client" if direction == "send" else "server"
        blocks.append("\n".join(annotate.describe(raw, sender)))

    body = []
    with BhpClient("localhost", server.address[1], trace=trace) as client:
        client.fetch(PATH, on_data=body.append)
    server.stop()

    total = sum(len(block.encode()) for block in blocks)
    with open(OUTPUT, "w") as out:
        out.write(INTRO + "\n")
        for block in blocks:
            out.write("```\n" + block + "\n```\n\n")
        out.write(f"Body delivered to stdout ({len(b''.join(body))} bytes):\n\n```html\n"
                  + b"".join(body).decode() + "```\n")
    print(f"wrote {OUTPUT} ({len(blocks)} wire units, {total} chars)")


if __name__ == "__main__":
    main()
