"""The three ways a read can fail, which a peer handles in three different ways."""

from __future__ import annotations

from .protocol import ErrorCode


class ConnectionClosed(Exception):
    """The peer closed the connection cleanly, between frames."""

    def __init__(self, detail: str = "peer closed the connection") -> None:
        super().__init__(detail)


class IdleTimeout(Exception):
    """Nothing arrived within the wait timeout, between frames.

    Its own type, not TimeoutError: since Python 3.10 socket.timeout IS
    TimeoutError, so a stuck send would otherwise look like an idle peer."""


class ProtocolViolation(Exception):
    """Connection-level error: send GOAWAY with this code, then close.

    The byte stream (or the peer) can no longer be trusted, e.g. a frame
    longer than the limit or a stream ID that goes backwards.
    """

    def __init__(self, code: ErrorCode, detail: str) -> None:
        super().__init__(detail)
        self.code = code
        self.detail = detail


class MalformedMessage(Exception):
    """Stream-level error: the frame was framed correctly but its payload is
    nonsense. Answer that one request with 400 and keep the connection."""
