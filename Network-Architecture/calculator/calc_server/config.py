"""Tunable limits for the server. Every number here is a defence, not a guess."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ServerConfig:
    # "localhost" resolves to both ::1 and 127.0.0.1; we listen on each.
    host: str = "localhost"
    port: int = 8080

    # How long a kept-alive connection may sit silent between requests.
    # Apache uses 5 s and nginx 75 s. We pick 60 s: a person typing requests
    # into a Python REPL on one socket must not be cut off mid-session, and
    # max_connections below bounds what idle sockets can cost us.
    idle_timeout_seconds: float = 60.0

    # Total time allowed to receive ONE request once its first byte arrives.
    # A deadline (not a per-recv timeout) so a slowloris client trickling one
    # byte every few seconds cannot hold a connection open forever.
    request_timeout_seconds: float = 30.0

    # How long one response may take to leave. Stops a client that never
    # reads from blocking a thread forever once its receive window fills.
    send_timeout_seconds: float = 30.0

    # One thread per connection, so this caps threads and file descriptors.
    # Connection number max_connections+1 gets a 503 and is closed.
    max_connections: int = 100

    # Request line + headers. 8 KiB matches common servers (nginx, Apache).
    max_header_bytes: int = 8 * 1024

    # A calculator needs no body at all; this only bounds what we are willing
    # to read (and discard) so we can stay in sync with the byte stream.
    max_body_bytes: int = 64 * 1024
