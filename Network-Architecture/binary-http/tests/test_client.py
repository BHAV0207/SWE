"""bcurl against a scripted fake server that speaks hand-written bytes."""

import contextlib
import io
import os
import socket
import sys
import threading
import unittest
from unittest import mock

from bhp import curl_cli
from bhp.client import BhpClient, ServerWentAway
from bhp.errors import IdleTimeout
from tests import wire

OK_HEADERS = wire.frame(wire.HEADERS, 0, 1, b"\x00\xc8")             # status 200, no fields
NOT_FOUND = wire.frame(wire.HEADERS, wire.END_STREAM, 1, b"\x01\x94")  # status 404, no body


class FakeServer:
    """Accepts connections, records what clients send, replies from a script.

    `script` maps a stream id to the bytes to send back when that stream's
    request arrives."""

    def __init__(self, script):
        self.script = script
        self.connections = 0
        self.received_preface = None
        self.listener = socket.create_server(("127.0.0.1", 0))
        self.port = self.listener.getsockname()[1]
        self.thread = threading.Thread(target=self._run, daemon=True)
        self.thread.start()

    def _run(self):
        self.listener.settimeout(3)
        try:
            while True:
                sock, _ = self.listener.accept()
                self.connections += 1
                threading.Thread(target=self._serve, args=(sock,), daemon=True).start()
        except OSError:
            pass

    def _serve(self, sock):
        with sock:
            self.received_preface = wire.read_exact(sock, 4)
            try:
                while True:
                    _, _, stream_id, _ = wire.read_frame(sock)
                    sock.sendall(self.script[stream_id])
            except (EOFError, OSError):
                pass

    def close(self):
        self.listener.close()


class ClientTest(unittest.TestCase):
    def serve(self, script):
        server = FakeServer(script)
        self.addCleanup(server.close)
        return server

    def test_sends_preface_and_reads_body(self):
        server = self.serve({1: OK_HEADERS + wire.frame(wire.DATA, wire.END_STREAM, 1, b"hello")})
        received = []
        with BhpClient("127.0.0.1", server.port, timeout=3) as client:
            head = client.fetch("/", on_data=received.append)
        self.assertEqual((head.status, b"".join(received)), (200, b"hello"))
        self.assertEqual(server.received_preface, b"BHP\x01")

    def test_unknown_frames_and_flags_are_skipped(self):
        reply = (wire.frame(0x7F, 0, 1, b"future stuff")       # unknown type on our stream
                 + wire.frame(0x42, 0, 0, b"")                  # unknown type, connection stream
                 + wire.frame(wire.HEADERS, 0x80, 1, b"\x00\xc8")  # unknown flag bit set
                 + wire.frame(wire.DATA, wire.END_STREAM | 0x40, 1, b"ok"))
        server = self.serve({1: reply})
        received = []
        with BhpClient("127.0.0.1", server.port, timeout=3) as client:
            self.assertEqual(client.fetch("/", on_data=received.append).status, 200)
        self.assertEqual(b"".join(received), b"ok")

    def test_goaway_is_reported(self):
        server = self.serve({1: wire.frame(wire.GOAWAY, 0, 0, b"\x00\x00\x00\x01bad")})
        with BhpClient("127.0.0.1", server.port, timeout=3) as client:
            with self.assertRaises(ServerWentAway) as caught:
                client.fetch("/")
        self.assertEqual((caught.exception.goaway.code, caught.exception.goaway.debug), (1, "bad"))

    def test_silent_server_is_an_idle_timeout(self):
        server = self.serve({1: b""})  # reads the request, never answers
        with BhpClient("127.0.0.1", server.port, timeout=0.3) as client:
            with self.assertRaises(IdleTimeout):
                client.fetch("/")


class CliTest(unittest.TestCase):
    def run_cli(self, args):
        stdout = io.TextIOWrapper(io.BytesIO())
        stderr = io.StringIO()
        with mock.patch.object(sys, "stdout", stdout), contextlib.redirect_stderr(stderr):
            code = curl_cli.main(args)
            stdout.flush()
            body = stdout.buffer.getvalue()
        return code, body, stderr.getvalue()

    def test_exit_codes_and_single_connection(self):
        script = {1: OK_HEADERS + wire.frame(wire.DATA, wire.END_STREAM, 1, b"one"),
                  2: wire.frame(wire.HEADERS, wire.END_STREAM, 2, b"\x01\x94")}
        server = FakeServer(script)
        self.addCleanup(server.close)

        code, body, _ = self.run_cli([f"127.0.0.1:{server.port}/a", "/b"])
        self.assertEqual(code, curl_cli.EXIT_HTTP_ERROR)  # second request was a 404
        self.assertEqual(body, b"one")
        self.assertEqual(server.connections, 1)

    def test_success_exit_code(self):
        server = FakeServer({1: OK_HEADERS + wire.frame(wire.DATA, wire.END_STREAM, 1, b"x")})
        self.addCleanup(server.close)
        self.assertEqual(self.run_cli([f"127.0.0.1:{server.port}/"])[0], curl_cli.EXIT_OK)

    def test_verbose_dumps_every_frame(self):
        server = FakeServer({1: NOT_FOUND})
        self.addCleanup(server.close)
        _, _, stderr = self.run_cli(["-v", f"127.0.0.1:{server.port}/x"])
        self.assertIn("> PREFACE", stderr)
        self.assertIn("> HEADERS stream=1 END_STREAM", stderr)
        self.assertIn("< HEADERS stream=1 END_STREAM", stderr)
        self.assertIn("status = 404", stderr)

    def test_path_too_long_for_one_frame_is_a_usage_error(self):
        server = FakeServer({})
        self.addCleanup(server.close)
        code, _, stderr = self.run_cli([f"127.0.0.1:{server.port}/" + "a" * 20000])
        self.assertEqual(code, curl_cli.EXIT_USAGE)
        self.assertIn("does not fit", stderr)

    def test_vv_dumps_large_frames_in_full(self):
        body = b"z" * 1000
        server = FakeServer({1: OK_HEADERS + wire.frame(wire.DATA, wire.END_STREAM, 1, body)})
        self.addCleanup(server.close)
        _, _, short = self.run_cli(["-v", f"127.0.0.1:{server.port}/"])
        server2 = FakeServer({1: OK_HEADERS + wire.frame(wire.DATA, wire.END_STREAM, 1, body)})
        self.addCleanup(server2.close)
        _, _, full = self.run_cli(["-vv", f"127.0.0.1:{server2.port}/"])
        self.assertIn("more bytes not shown", short)
        self.assertNotIn("more bytes not shown", full)
        self.assertIn("  03e0  ", full)  # last row of a 1008-byte frame starts at 992

    def test_second_server_is_refused(self):
        self.assertEqual(self.run_cli(["localhost:1/a", "otherhost:2/b"])[0], curl_cli.EXIT_USAGE)

    def test_connection_failure(self):
        unused = socket.create_server(("127.0.0.1", 0))
        port = unused.getsockname()[1]
        unused.close()
        self.assertEqual(self.run_cli([f"127.0.0.1:{port}/"])[0], curl_cli.EXIT_FAILURE)


if __name__ == "__main__":
    unittest.main()
