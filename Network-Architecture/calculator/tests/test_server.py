"""End-to-end tests against a real server on an ephemeral port."""

import threading
import time
import unittest

from calc_server.config import ServerConfig
from calc_server.server import CalculatorServer
from tests.http_client import RawClient

TEST_CONFIG = ServerConfig(host="127.0.0.1", port=0, idle_timeout_seconds=0.5, request_timeout_seconds=0.5)

# The six requests from "How I will mark it", with expected status and body.
MARKING_SCRIPT = [
    ("GET", "/add?a=2&b=3", 200, b"5"),
    ("GET", "/sub?a=10&b=4", 200, b"6"),
    ("GET", "/mul?a=6&b=7", 200, b"42"),
    ("GET", "/div?a=1&b=0", 400, None),
    ("GET", "/pow?a=2&b=8", 404, None),
    ("POST", "/add", 405, None),
]


def _request_bytes(method: str, target: str) -> bytes:
    return f"{method} {target} HTTP/1.1\r\nHost: localhost\r\n\r\n".encode()


class ServerTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = CalculatorServer(TEST_CONFIG)
        cls.server.bind()
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.stop()
        cls.thread.join(timeout=2)

    def setUp(self):
        self.client = RawClient(self.server.address)

    def tearDown(self):
        self.client.close()


class MarkingScriptTest(ServerTestCase):
    def test_six_requests_one_connection(self):
        for method, target, status, body in MARKING_SCRIPT:
            with self.subTest(request=f"{method} {target}"):
                self.client.send(_request_bytes(method, target))
                response = self.client.read_response()
                self.assertEqual(response.status, status)
                if body is not None:
                    self.assertEqual(response.body, body)
        self.assertTrue(self.client.is_still_open())

    def test_pipelined_all_six_at_once(self):
        self.client.send(b"".join(_request_bytes(m, t) for m, t, _, _ in MARKING_SCRIPT))
        statuses = [self.client.read_response().status for _ in MARKING_SCRIPT]
        self.assertEqual(statuses, [status for _, _, status, _ in MARKING_SCRIPT])
        self.assertTrue(self.client.is_still_open())


class FeatureSetTest(ServerTestCase):
    def test_success_cases(self):
        cases = {"/add?a=2&b=3": b"5", "/sub?a=10&b=4": b"6", "/mul?a=6&b=7": b"42",
                 "/div?a=9&b=3": b"3", "/div?a=1&b=4": b"0.25", "/add?a=-1.5&b=2": b"0.5"}
        for target, body in cases.items():
            with self.subTest(target=target):
                response = self.client.get(target)
                self.assertEqual((response.status, response.body), (200, body))

    def test_bad_operands(self):
        for target in ["/add?a=x&b=3", "/add?a=1", "/add", "/add?a=1&a=2&b=3", "/div?a=1&b=0"]:
            with self.subTest(target=target):
                self.assertEqual(self.client.get(target).status, 400)

    def test_missing_host_is_400_and_connection_survives(self):
        self.client.send(b"GET /add?a=1&b=2 HTTP/1.1\r\n\r\n")
        self.assertEqual(self.client.read_response().status, 400)
        self.assertEqual(self.client.get("/add?a=1&b=2").body, b"3")

    def test_405_advertises_allowed_methods(self):
        self.client.send(_request_bytes("POST", "/add"))
        self.assertEqual(self.client.read_response().headers["allow"], "GET")


class FramingTest(ServerTestCase):
    def test_post_body_is_consumed_exactly(self):
        # Body is "GET /x" on purpose: if we read one byte short or long,
        # the next parse sees garbage.
        self.client.send(b"POST /add HTTP/1.1\r\nHost: localhost\r\nContent-Length: 6\r\n\r\nGET /x"
                         + _request_bytes("GET", "/mul?a=6&b=7"))
        self.assertEqual(self.client.read_response().status, 405)
        self.assertEqual(self.client.read_response().body, b"42")

    def test_chunked_post_body_is_consumed(self):
        self.client.send(b"POST /add HTTP/1.1\r\nHost: localhost\r\nTransfer-Encoding: chunked\r\n\r\n"
                         b"3\r\nabc\r\n0\r\n\r\n" + _request_bytes("GET", "/add?a=2&b=3"))
        self.assertEqual(self.client.read_response().status, 405)
        self.assertEqual(self.client.read_response().body, b"5")

    def test_malformed_request_gets_400_then_close(self):
        self.client.send(b"THIS IS NOT HTTP\r\n\r\n")
        response = self.client.read_response()
        self.assertEqual(response.status, 400)
        self.assertEqual(response.headers["connection"], "close")
        self.assertTrue(self.client.is_closed_by_peer())


class ConnectionLifecycleTest(ServerTestCase):
    def test_connection_close_is_honoured(self):
        response = self.client.get("/add?a=1&b=1", "Connection: close\r\n")
        self.assertEqual(response.headers["connection"], "close")
        self.assertTrue(self.client.is_closed_by_peer())

    def test_http_1_0_closes_by_default(self):
        self.client.send(b"GET /add?a=1&b=1 HTTP/1.0\r\n\r\n")
        self.assertEqual(self.client.read_response().body, b"2")
        self.assertTrue(self.client.is_closed_by_peer())

    def test_http_1_0_keep_alive_opt_in(self):
        self.client.send(b"GET /add?a=1&b=1 HTTP/1.0\r\nConnection: keep-alive\r\n\r\n")
        self.assertEqual(self.client.read_response().headers["connection"], "keep-alive")
        self.assertTrue(self.client.is_still_open())

    def test_idle_connection_is_closed_after_timeout(self):
        self.client.get("/add?a=1&b=1")
        time.sleep(TEST_CONFIG.idle_timeout_seconds + 0.3)
        self.assertTrue(self.client.is_closed_by_peer())

    def test_slow_request_gets_408(self):
        self.client.send(b"GET /add?a=1&b=1 HTTP/1.1\r\n")  # never finish the head
        response = self.client.read_response()
        self.assertEqual(response.status, 408)
        self.assertTrue(self.client.is_closed_by_peer())


if __name__ == "__main__":
    unittest.main()
