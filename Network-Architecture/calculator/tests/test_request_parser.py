"""Parser tests over a real socketpair, so byte-boundary behaviour is real."""

import socket
import threading
import unittest

from calc_server.config import ServerConfig
from calc_server.http_types import ProtocolError
from calc_server.request_parser import read_request
from calc_server.socket_buffer import SocketBuffer

CONFIG = ServerConfig(max_header_bytes=256, max_body_bytes=16)


class RequestParserTest(unittest.TestCase):
    def setUp(self):
        self.server_side, self.client_side = socket.socketpair()
        self.buffer = SocketBuffer(self.server_side)
        self.buffer.set_deadline(2.0)

    def tearDown(self):
        self.server_side.close()
        self.client_side.close()

    def feed(self, data: bytes):
        self.client_side.sendall(data)

    def test_simple_get(self):
        self.feed(b"GET /add?a=2&b=3 HTTP/1.1\r\nHost: x\r\n\r\n")
        request = read_request(self.buffer, CONFIG)
        self.assertEqual((request.method, request.target, request.version), ("GET", "/add?a=2&b=3", "HTTP/1.1"))
        self.assertEqual(request.headers.get("host"), "x")
        self.assertEqual(request.body, b"")

    def test_content_length_body_does_not_eat_next_request(self):
        self.feed(b"POST /add HTTP/1.1\r\nHost: x\r\nContent-Length: 5\r\n\r\nhello"
                  b"GET /sub HTTP/1.1\r\nHost: x\r\n\r\n")
        first = read_request(self.buffer, CONFIG)
        second = read_request(self.buffer, CONFIG)
        self.assertEqual(first.body, b"hello")
        self.assertEqual((second.method, second.target), ("GET", "/sub"))

    def test_chunked_body_with_trailer(self):
        self.feed(b"POST /add HTTP/1.1\r\nHost: x\r\nTransfer-Encoding: chunked\r\n\r\n"
                  b"4\r\nWiki\r\n5;ext=1\r\npedia\r\n0\r\nX-Trailer: y\r\n\r\n"
                  b"GET /mul HTTP/1.1\r\nHost: x\r\n\r\n")
        self.assertEqual(read_request(self.buffer, CONFIG).body, b"Wikipedia")
        self.assertEqual(read_request(self.buffer, CONFIG).target, "/mul")

    def test_request_split_across_many_packets(self):
        data = b"GET /div?a=9&b=3 HTTP/1.1\r\nHost: x\r\n\r\n"

        def trickle():
            for byte in data:
                self.client_side.send(bytes([byte]))

        sender = threading.Thread(target=trickle)
        sender.start()
        self.assertEqual(read_request(self.buffer, CONFIG).target, "/div?a=9&b=3")
        sender.join()

    def test_leading_empty_lines_are_ignored(self):
        self.feed(b"\r\n\r\nGET /add HTTP/1.1\r\nHost: x\r\n\r\n")
        self.assertEqual(read_request(self.buffer, CONFIG).target, "/add")

    def test_bare_lf_line_endings_are_accepted(self):
        self.feed(b"GET /add HTTP/1.1\nHost: x\n\nGET /sub HTTP/1.1\r\nHost: x\r\n\r\n")
        self.assertEqual(read_request(self.buffer, CONFIG).headers.get("Host"), "x")
        self.assertEqual(read_request(self.buffer, CONFIG).target, "/sub")

    def test_chunked_body_with_bare_lf(self):
        self.feed(b"POST / HTTP/1.1\nTransfer-Encoding: chunked\n\n3\nabc\n0\n\n")
        self.assertEqual(read_request(self.buffer, CONFIG).body, b"abc")

    def test_higher_minor_version_is_treated_as_1_1(self):
        self.feed(b"GET / HTTP/1.2\r\nHost: x\r\n\r\n")
        self.assertEqual(read_request(self.buffer, CONFIG).version, "HTTP/1.1")

    def assert_protocol_error(self, data: bytes, status: int):
        self.feed(data)
        with self.assertRaises(ProtocolError) as caught:
            read_request(self.buffer, CONFIG)
        self.assertEqual(caught.exception.status, status)

    def test_malformed_request_line(self):
        self.assert_protocol_error(b"GET /add\r\n\r\n", 400)

    def test_unsupported_version(self):
        self.assert_protocol_error(b"GET / HTTP/2.0\r\nHost: x\r\n\r\n", 505)

    def test_bare_cr_is_rejected(self):
        self.assert_protocol_error(b"GET / HTTP/1.1\r\nHost: x\rX-Evil: y\r\n\r\n", 400)

    def test_space_before_colon_is_rejected(self):
        self.assert_protocol_error(b"GET / HTTP/1.1\r\nHost : x\r\n\r\n", 400)

    def test_both_framings_is_rejected(self):
        self.assert_protocol_error(
            b"POST / HTTP/1.1\r\nHost: x\r\nContent-Length: 3\r\nTransfer-Encoding: chunked\r\n\r\n", 400)

    def test_conflicting_content_lengths(self):
        self.assert_protocol_error(b"POST / HTTP/1.1\r\nContent-Length: 3\r\nContent-Length: 4\r\n\r\n", 400)

    def test_non_numeric_content_length(self):
        self.assert_protocol_error(b"POST / HTTP/1.1\r\nContent-Length: -1\r\n\r\n", 400)

    def test_body_too_large(self):
        self.assert_protocol_error(b"POST / HTTP/1.1\r\nContent-Length: 17\r\n\r\n", 413)

    def test_headers_too_large(self):
        self.assert_protocol_error(b"GET / HTTP/1.1\r\nX: " + b"a" * 300 + b"\r\n\r\n", 431)

    def test_unknown_transfer_encoding(self):
        self.assert_protocol_error(b"POST / HTTP/1.1\r\nTransfer-Encoding: gzip\r\n\r\n", 501)

    def test_eof_mid_body(self):
        self.feed(b"POST / HTTP/1.1\r\nContent-Length: 10\r\n\r\nabc")
        self.client_side.shutdown(socket.SHUT_WR)
        with self.assertRaises(ProtocolError):
            read_request(self.buffer, CONFIG)


if __name__ == "__main__":
    unittest.main()
