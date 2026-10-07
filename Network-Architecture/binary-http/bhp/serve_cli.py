"""bserve ROOT PORT -- serve the files under ROOT over BHP/1."""

from __future__ import annotations

import argparse
import logging
import sys

from .file_store import FileStore
from .handler import StaticFileHandler
from .server import BhpServer


def main() -> None:
    parser = argparse.ArgumentParser(prog="bserve", description="BHP/1 static file server")
    parser.add_argument("root", help="directory to serve")
    parser.add_argument("port", type=int)
    parser.add_argument("--host", default="localhost")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    try:
        handler = StaticFileHandler(FileStore(args.root))
        server = BhpServer(args.host, args.port, handler)
        server.bind()
    except OSError as error:
        sys.exit(f"bserve: {error}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logging.info("shutting down")
