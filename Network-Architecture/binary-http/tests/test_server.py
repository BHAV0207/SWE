"""bserve driven by hand-built bytes over a real socket (see wire.py)."""

import os
import shutil
import socket
import tempfile
import threading
import time
import unittest

from bhp.file_store import FileStore
from bhp.handler import StaticFileHandler
from bhp.server import BhpServer
from bhp.server_connection import ConnectionLimits
from tests import wire

LIMITS = ConnectionLimits(idle_timeout=0.5, frame_timeout=0.5, send_timeout=2.0)
BIG_FILE_SIZE = 40_000  # 16384 + 16384 + 7232: three DATA frames


class ServerTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root = tempfile.mkdtemp()
        with open(os.path.join(cls.root, "index.html"), "wb") as file:
            file.write(b"<h1>hi</h1>")
        with open(os.path.join(cls.root, "big.bin"), "wb") as file:
            file.write(bytes(range(256)) * (BIG_FILE_SIZE // 256) + b"x" * (BIG_FILE_SIZE % 256))
        open(os.path.join(cls.root, "empty.txt"), "wb").close()
        os.mkdir(os.path.join(cls.root, "sub"))
        with open(os.path.join(cls.root, "sub", "index.html"), "wb") as file:
            file.write(b"sub index")

        cls.server = BhpServer("127.0.0.1", 0, StaticFileHandler(FileStore(cls.root)), LIMITS)
        cls.server.bind()
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.stop()
        cls.thread.join(timeout=2)
        shutil.rmtree(cls.root)

    def setUp(self):
        self.sock = socket.create_connection(self.server.address, timeout=3)

    def tearDown(self):
        self.sock.close()

    def open_session(self):
        self.sock.sendall(wire.PREFACE)

    def get(self, stream_id, path, method=wire.GET):
        self.sock.sendall(wire.request(stream_id, path, method))
        return wire.read_response(self.sock)

    def assert_goaway(self, code):
        type_, _, stream_id, payload = wire.read_frame(self.sock)
        self.assertEqual((type_, stream_id, wire.goaway_code(payload)), (wire.GOAWAY, 0, code))
        self.assertEqual(self.sock.recv(1), b"", "server should close after GOAWAY")


class ServingTest(ServerTestCase):
    def test_file_is_served(self):
        self.open_session()
        status, body, frames = self.get(1, "/index.html")
        self.assertEqual((status, body), (200, b"<h1>hi</h1>"))
        self.assertTrue(all(stream == 1 for _, _, stream, _ in frames))

    def test_many_requests_one_connection(self):
        self.open_session()
        results = [self.get(n, path)[0] for n, path in enumerate(["/index.html", "/nope", "/sub/", "/big.bin"], 1)]
        self.assertEqual(results, [200, 404, 200, 200])

    def test_pipelined_requests_answered_in_order(self):
        self.sock.sendall(wire.PREFACE + wire.request(1, "/index.html") + wire.request(2, "/nope"))
        first, second = wire.read_response(self.sock), wire.read_response(self.sock)
        self.assertEqual((first[2][0][2], first[0]), (1, 200))
        self.assertEqual((second[2][0][2], second[0]), (2, 404))

    def test_large_file_split_into_frames_end_stream_on_last(self):
        self.open_session()
        status, body, frames = self.get(1, "/big.bin")
        data_frames = [f for f in frames if f[0] == wire.DATA]
        self.assertEqual(status, 200)
        self.assertEqual(len(body), BIG_FILE_SIZE)
        self.assertEqual([len(f[3]) for f in data_frames], [16384, 16384, 7232])
        self.assertEqual([f[1] & wire.END_STREAM for f in data_frames], [0, 0, 1])

    def test_empty_file_ends_on_headers(self):
        self.open_session()
        status, body, frames = self.get(1, "/empty.txt")
        self.assertEqual((status, body, len(frames)), (200, b"", 1))
        self.assertTrue(frames[0][1] & wire.END_STREAM)

    def test_head_has_no_data_frames(self):
        self.open_session()
        status, body, frames = self.get(1, "/big.bin", method=wire.HEAD)
        self.assertEqual((status, body, len(frames)), (200, b"", 1))
        self.assertIn(b"40000", frames[0][3])  # content-length still reported

    def test_unsupported_method_is_405(self):
        self.open_session()
        self.assertEqual(self.get(1, "/index.html", method=0x09)[0], 405)

    def test_path_traversal_is_404(self):
        self.open_session()
        for stream_id, path in enumerate(["/../../../etc/passwd", "/sub/../../etc/hosts"], 1):
            with self.subTest(path=path):
                self.assertEqual(self.get(stream_id, path)[0], 404)


class MalformedTest(ServerTestCase):
    def test_malformed_headers_is_400_and_connection_survives(self):
        self.open_session()
        self.sock.sendall(wire.frame(wire.HEADERS, wire.END_STREAM, 1, b"\x01\x00\x09/short"))
        self.assertEqual(wire.read_response(self.sock)[0], 400)
        self.assertEqual(self.get(2, "/index.html")[0], 200)

    def test_unknown_frame_type_is_skipped(self):
        self.open_session()
        self.sock.sendall(wire.frame(0x7F, 0xFF, 1, b"from version 2") + wire.request(1, "/index.html"))
        self.assertEqual(wire.read_response(self.sock)[0], 200)

    def test_client_data_frames_are_discarded(self):
        self.open_session()
        self.sock.sendall(wire.frame(wire.DATA, wire.END_STREAM, 1, b"ignored body") + wire.request(1, "/index.html"))
        self.assertEqual(wire.read_response(self.sock)[0], 200)

    def test_bad_preface(self):
        self.sock.sendall(b"GET / HTTP/1.1\r\n\r\n")
        self.assert_goaway(0x01)

    def test_unsupported_version(self):
        self.sock.sendall(b"BHP\x02")
        self.assert_goaway(0x01)

    def test_oversized_frame(self):
        self.open_session()
        self.sock.sendall((16 * 1024 + 1).to_bytes(3, "big") + b"\x02\x00\x00\x00\x01")
        self.assert_goaway(0x02)

    def test_stream_id_must_increase(self):
        self.open_session()
        self.get(2, "/index.html")
        self.sock.sendall(wire.request(1, "/index.html"))
        self.assert_goaway(0x01)

    def test_client_goaway_closes_the_connection(self):
        self.open_session()
        self.get(1, "/index.html")
        self.sock.sendall(wire.frame(wire.GOAWAY, 0, 0, b"\x00\x00\x01\x00"))
        self.assertEqual(self.sock.recv(1), b"")

    def test_stream_zero_is_not_a_request(self):
        self.open_session()
        self.sock.sendall(wire.request(0, "/index.html"))
        self.assert_goaway(0x01)


class TimeoutTest(ServerTestCase):
    def test_idle_connection_gets_goaway_no_error(self):
        self.open_session()
        self.get(1, "/index.html")
        time.sleep(LIMITS.idle_timeout + 0.2)
        type_, _, _, payload = wire.read_frame(self.sock)
        self.assertEqual((type_, wire.goaway_code(payload), payload[:3]), (wire.GOAWAY, 0x00, b"\x00\x00\x01"))

    def test_half_sent_frame_times_out(self):
        self.open_session()
        self.sock.sendall(b"\x00\x00\x10\x01")  # half a header, then silence
        self.assert_goaway(0x03)


if __name__ == "__main__":
    unittest.main()
