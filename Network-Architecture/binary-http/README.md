# BHP/1: HTTP, in binary

A binary request/response protocol (in the style of HTTP/2's framing) with both programs: the server `bserve` (Track 1) and the client `bcurl` (Track 2). Python 3.9+ (tested on 3.9 and 3.12), standard library only.

## What to hand in

| Deliverable | File |
|---|---|
| 1. The spec (two pages) | [`SPEC.md`](SPEC.md), rendered as [`docs/SPEC.pdf`](docs/SPEC.pdf) (2 pages) |
| 2. The programs | `./bserve`, `./bcurl`, and the `bhp/` package |
| 3. Annotated hexdump of one request and response | [`docs/HEXDUMP.md`](docs/HEXDUMP.md) |

## Run it

```
./bserve ./www 9000                                    # terminal 1
./bcurl -v localhost:9000/index.html                   # terminal 2: body to stdout, frames to stderr (-vv: big frames in full)
./bcurl localhost:9000/index.html /missing /style.css  # 3 requests, 1 connection; exit 1 (one was 404)
./bcurl -I localhost:9000/big.bin                      # HEAD
python3 -m unittest discover -s tests -t .             # 47 tests
python3 tools/make_hexdump.py                          # regenerate docs/HEXDUMP.md from a live exchange
python3 tools/spec_to_pdf.py                           # regenerate docs/SPEC.pdf (needs Chrome)
```

`bcurl` exit codes: `0` success, `1` any 4xx/5xx, `2` bad usage (including a URL on a second server: it never opens a second connection), `3` connection or protocol failure.

## Layout

| Module | Job |
|---|---|
| `protocol.py` | Every constant in the spec: preface, widths, types, flags, codes, static table |
| `frames.py` | The 8-byte frame header; `FrameReader` reads exactly one frame at a time |
| `messages.py` | HEADERS (request/response) and GOAWAY payload encoders and decoders |
| `cursor.py` | The read position that decoders use. It can record what every byte meant |
| `annotate.py` | Hexdump and field breakdown, built from those recordings |
| `server_connection.py` | Preface → frames loop; stream errors (400) vs connection errors (GOAWAY) |
| `server.py`, `handler.py`, `file_store.py` | Listener; request → response; path → file, never outside the root |
| `client.py`, `curl_cli.py`, `serve_cli.py` | `bcurl` and `bserve` |

## Design points worth knowing for the viva

- **Why 24/8/8/24?** See SPEC §2. In short: Length is wide enough to grow in v2 but capped at 16 KiB in v1; Stream ID is 24 bits, not HTTP/2's 31, so the header is a round 8 bytes.
- **Unknown frame types are skipped** by both programs. Length is always at the same place, so skipping costs nothing. Tested on both sides.
- **The hexdump annotations come from the real decoders.** `cursor.py` records each field as it is parsed, so the hexdump cannot drift from what the code does.
- **"A client that only works against your own server is an implementation, not a protocol."** Since I'm solo, I couldn't test against a partner's code. Instead, the tests build their bytes by hand from the spec (`tests/wire.py`), never with `bhp`'s own encoders. `bserve` is tested with hand-written requests. `bcurl` is tested against a fake server replaying hand-written responses, including unknown frame types and unknown flag bits. The spec's §8 example is itself a test, which caught a wrong length in an early draft.
