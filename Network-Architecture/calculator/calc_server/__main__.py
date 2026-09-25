"""python -m calc_server [--host HOST] [--port PORT] [--idle-timeout SECONDS]"""

from __future__ import annotations

import argparse
import logging

from .config import ServerConfig
from .server import CalculatorServer


def main() -> None:
    defaults = ServerConfig()
    parser = argparse.ArgumentParser(description="HTTP/1.1 keep-alive calculator on a raw socket")
    parser.add_argument("--host", default=defaults.host)
    parser.add_argument("--port", type=int, default=defaults.port)
    parser.add_argument("--idle-timeout", type=float, default=defaults.idle_timeout_seconds)
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    config = ServerConfig(host=args.host, port=args.port, idle_timeout_seconds=args.idle_timeout)
    server = CalculatorServer(config)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logging.info("shutting down")


if __name__ == "__main__":
    main()
