"""Encoders and decoders checked against byte vectors written from the spec."""

import unittest

from bhp.cursor import Span
from bhp.errors import MalformedMessage
from bhp.frames import Frame, decode_frame_header
from bhp.messages import (
    GoAway,
    RequestHead,
    ResponseHead,
    decode_goaway,
    decode_request_head,
    decode_response_head,
    encode_goaway,
    encode_request_head,
    encode_response_head,
)
from bhp.protocol import END_STREAM, ErrorCode, FrameType, Method


class FrameHeaderTest(unittest.TestCase):
    def test_header_layout(self):
        encoded = Frame(FrameType.DATA, END_STREAM, 0x010203, b"hi").encode()
        self.assertEqual(encoded, bytes.fromhex("000002" "02" "01" "010203") + b"hi")

    def test_decode_header(self):
        header = decode_frame_header(bytes.fromhex("00403a" "7f" "80" "ffffff"))
        self.assertEqual((header.length, header.type, header.flags, header.stream_id),
                         (0x403A, 0x7F, 0x80, 0xFFFFFF))

    def test_spec_section_8_example(self):
        payload = encode_request_head(RequestHead(Method.GET, "/a", [("host", "h")]))
        encoded = Frame(FrameType.HEADERS, END_STREAM, 1, payload).encode()
        self.assertEqual(encoded, bytes.fromhex("000009 01 01 000001 01 0002 2f61 01 0001 68"))

    def test_payload_over_limit_cannot_be_encoded(self):
        with self.assertRaises(ValueError):
            Frame(FrameType.DATA, 0, 1, b"x" * (16 * 1024 + 1)).encode()


class RequestHeadTest(unittest.TestCase):
    def test_static_and_literal_names(self):
        request = RequestHead(Method.GET, "/a", [("host", "h"), ("x-trace", "7")])
        expected = (bytes.fromhex("01" "0002" "2f61")        # GET, path "/a"
                    + bytes.fromhex("01" "0001" "68")        # name #1 host = "h"
                    + bytes.fromhex("00" "07") + b"x-trace"  # literal name, 7 bytes
                    + bytes.fromhex("0001") + b"7")          # value "7"
        self.assertEqual(encode_request_head(request), expected)
        self.assertEqual(decode_request_head(expected), request)

    def test_unknown_method_code_still_decodes(self):
        # Well-formed but unsupported: the server answers 405, not 400.
        self.assertEqual(decode_request_head(bytes.fromhex("09" "0001" "2f")).method, 9)

    def test_malformed_requests(self):
        cases = {
            "truncated path": bytes.fromhex("01" "0005" "2f61"),
            "path without slash": bytes.fromhex("01" "0001" "61"),
            "reserved name index": bytes.fromhex("01" "0001" "2f" "0b" "0000"),
            "truncated value": bytes.fromhex("01" "0001" "2f" "01" "0005" "61"),
            "uppercase literal": bytes.fromhex("01" "0001" "2f" "00" "01" "41" "0000"),
            "invalid utf-8 path": bytes.fromhex("01" "0002" "2fff"),
            "empty payload": b"",
        }
        for name, payload in cases.items():
            with self.subTest(name), self.assertRaises(MalformedMessage):
                decode_request_head(payload)


class ResponseHeadTest(unittest.TestCase):
    def test_round_trip(self):
        response = ResponseHead(404, [("content-length", "0")])
        encoded = encode_response_head(response)
        self.assertEqual(encoded, bytes.fromhex("0194" "06" "0001" "30"))
        self.assertEqual(decode_response_head(encoded), response)

    def test_status_out_of_range(self):
        with self.assertRaises(MalformedMessage):
            decode_response_head(bytes.fromhex("0000"))


class GoAwayTest(unittest.TestCase):
    def test_round_trip(self):
        goaway = GoAway(5, ErrorCode.FRAME_TOO_LARGE, "big")
        encoded = encode_goaway(goaway)
        self.assertEqual(encoded, bytes.fromhex("000005" "02") + b"big")
        self.assertEqual(decode_goaway(encoded), goaway)


class AnnotationTest(unittest.TestCase):
    def test_recorder_covers_every_byte(self):
        payload = encode_request_head(RequestHead(Method.GET, "/x", [("host", "a"), ("x-y", "z")]))
        spans = []
        decode_request_head(payload, recorder=spans)
        covered = b"".join(span.data for span in spans)
        self.assertEqual(covered, payload)
        self.assertTrue(all(isinstance(span, Span) and span.meaning for span in spans))


if __name__ == "__main__":
    unittest.main()
