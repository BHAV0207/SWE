"""Tunable limits for the server. Every number here is a defence, not a guess."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ServerConfig:
    host: str = "localhost"
    port: int = 8080

    # How long a kept-alive connection may sit silent between requests.
    # Long enough for a client doing request -> think -> request, short enough
    # that idle sockets do not pile up and exhaust threads/file descriptors.
    idle_timeout_seconds: float = 5.0

    # Total time allowed to receive ONE request once its first byte arrives.
    # A deadline (not a per-recv timeout) so a slowloris client trickling one
    # byte every few seconds cannot hold a connection open forever.
    request_timeout_seconds: float = 10.0

    # Request line + headers. 8 KiB matches common servers (nginx, Apache).
    max_header_bytes: int = 8 * 1024

    # A calculator needs no body at all; this only bounds what we are willing
    # to read (and discard) so we can stay in sync with the byte stream.
    max_body_bytes: int = 64 * 1024
