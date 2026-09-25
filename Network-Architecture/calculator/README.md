# A calculator that stays on the line

An HTTP/1.1 calculator written directly on a TCP socket in Python 3.9+. It uses the standard library only: no `http.server`, no framework. One connection serves any number of requests.

```
python3 -m calc_server --port 8080          # run the server
python3 scripts/mark.py --port 8080         # the marking run: one socket, six requests
python3 scripts/mark.py --pipeline          # same six, sent in a single write
python3 -m unittest discover -s tests -t .  # 36 tests
```

## Feature set

| Request                  | Response |
|--------------------------|----------|
| `GET /add?a=2&b=3`       | `200 5`  |
| `GET /sub?a=10&b=4`      | `200 6`  |
| `GET /mul?a=6&b=7`       | `200 42` |
| `GET /div?a=9&b=3`       | `200 3`  |
| `GET /div?a=1&b=0`       | `400`    |
| `GET /add?a=x&b=3`       | `400`    |
| `GET /pow?a=2&b=8`       | `404`    |
| `POST /add`              | `405` + `Allow: GET` |
| `GET /add` (no `Host`)   | `400`    |

## Layout: one job per module

| Module | Responsibility | Knows about sockets? | Knows about HTTP? |
|---|---|---|---|
| `arithmetic.py`     | parse numbers, compute, format | no  | no  |
| `app.py`            | route a `Request` to a `Response` | no  | semantics only |
| `request_parser.py` | bytes → `Request`, i.e. **where does this request end?** | via buffer | framing |
| `socket_buffer.py`  | read exactly N bytes / up to a delimiter, keep the rest | yes | no |
| `connection.py`     | the keep-alive loop, timeouts, close handling | yes | lifecycle |
| `server.py`         | accept loop, one thread per connection | yes | no |

## The hard part: where does a request end?

When the server hung up after every response, the answer was "at EOF". With keep-alive, `recv()` can return the end of one request together with the start of the next one. So `SocketBuffer` never hands the parser more than it asks for, and whatever is left over stays buffered for the next `read_request()`:

1. **Head**: read up to `\r\n\r\n`, and no further.
2. **Body**, per RFC 9112 §6.3:
   - `Transfer-Encoding: chunked`: read each chunk until the zero-size chunk, then skip the trailers.
   - `Content-Length: N`: read **exactly** N bytes. Byte N+1 belongs to the next request.
   - neither: the body is empty.

The calculator never uses a body, but the server still has to read it. `POST /add` with a 6-byte body gets a 405, and those 6 bytes still have to be consumed, or they would be parsed as the start of the next request. `tests/test_server.py::test_post_body_is_consumed_exactly` sends a body of `GET /x` to prove this.

### Two kinds of error

- **Semantic errors** (400 bad operand, 404, 405, 400 missing Host): we know exactly where the request ended, so we answer it and **keep the connection open**.
- **Framing errors** (`ProtocolError`): a malformed request line, conflicting or invalid `Content-Length`, both `Content-Length` *and* `Transfer-Encoding` (the classic request-smuggling setup), an unknown transfer coding, or oversize headers or body. We can no longer trust where the next request starts. So we reply once with `Connection: close` and hang up. Guessing here would mean misreading every request that follows.

## Stretch goals (all done)

- **`Connection: close`**: honoured. For HTTP/1.0, the connection closes unless the client sends `Connection: keep-alive`.
- **Idle timeout: 5 s**, which I can defend. It is long enough for a client that makes a request, thinks, and makes another. It is short enough that idle sockets can't use up threads and file descriptors. This is separate from a **10 s request deadline**, which covers the time from the first byte of a request to its last. The request timer is a *total* deadline, not a per-`recv()` timeout. A slowloris client sending one byte every 4 s would reset a per-read timer forever, but it runs out of time against a deadline and gets a `408`.
- **Chunked request bodies**: decoded, including chunk extensions and trailers.
- **Pipelining**: nothing special was needed. Requests are taken from the buffer in the order they arrived and answered one at a time, so responses go out in the same order.

## Other decisions worth defending

- **Response bodies are framed by `Content-Length`** and never by closing the connection, so the client always knows where each response ends.
- **Graceful close**: before `close()`, we `shutdown(SHUT_WR)` and briefly drain any input. If you close a socket that still has unread input, the kernel sends RST, and that can wipe out the final response before the client reads it.
- **Strict number parsing**: `float()` accepts `" 1"`, `1_000`, `nan` and `inf`, so we use a regex instead. Operands are capped at 64 characters because Python integers have no size limit, and one request shouldn't be able to trigger unbounded work.
- **Limits**: 8 KiB of headers (the same as nginx and Apache) gives `431`. A 64 KiB body cap gives `413`.
- **Integer results print as integers**: `9/3` gives `3`, not `3.0`.
