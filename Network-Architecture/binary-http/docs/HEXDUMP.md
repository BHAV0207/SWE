# Annotated hexdump: one complete request and response

Captured from the real programs (`bcurl` -> `bserve ./www`) by
`tools/make_hexdump.py`. Each block shows the raw bytes, then every field:
offset, the bytes, and what they mean. The field breakdown is produced by the
same decoders the programs use, so it is proof the bytes match SPEC.md.

`>` = client to server, `<` = server to client. All integers big-endian.

```
> PREFACE (4 bytes)
  0000  42 48 50 01                                       |BHP.|

  0000  42 48 50                    magic 'BHP'
  0003  01                          version = 1
```

```
> HEADERS stream=1 END_STREAM (66 bytes)
  0000  00 00 3a 01 01 00 00 01 01 00 0b 2f 69 6e 64 65   |..:......../inde|
  0010  78 2e 68 74 6d 6c 01 00 0e 6c 6f 63 61 6c 68 6f   |x.html...localho|
  0020  73 74 3a 39 30 30 30 02 00 07 62 63 75 72 6c 2f   |st:9000...bcurl/|
  0030  31 03 00 03 2a 2f 2a 04 00 08 69 64 65 6e 74 69   |1...*/*...identi|
  0040  74 79                                             |ty|

  0000  00 00 3a                    length = 58
  0003  01                          type = HEADERS
  0004  01                          flags = END_STREAM
  0005  00 00 01                    stream id = 1
  0008  01                          method = GET
  0009  00 0b                       path length = 11
  000b  2f 69 6e 64 65 78 2e 68 ..  path = '/index.html'
  0016  01                          field: name #1 = host
  0017  00 0e                         value length = 14
  0019  6c 6f 63 61 6c 68 6f 73 ..    value = 'localhost:9000'
  0027  02                          field: name #2 = user-agent
  0028  00 07                         value length = 7
  002a  62 63 75 72 6c 2f 31          value = 'bcurl/1'
  0031  03                          field: name #3 = accept
  0032  00 03                         value length = 3
  0034  2a 2f 2a                      value = '*/*'
  0037  04                          field: name #4 = accept-encoding
  0038  00 08                         value length = 8
  003a  69 64 65 6e 74 69 74 79       value = 'identity'
```

```
< HEADERS stream=1 (141 bytes)
  0000  00 00 85 01 00 00 00 01 00 c8 05 00 18 74 65 78   |.............tex|
  0010  74 2f 68 74 6d 6c 3b 20 63 68 61 72 73 65 74 3d   |t/html; charset=|
  0020  75 74 66 2d 38 06 00 02 36 31 07 00 1d 57 65 64   |utf-8...61...Wed|
  0030  2c 20 30 37 20 4f 63 74 20 32 30 32 36 20 31 30   |, 07 Oct 2026 10|
  0040  3a 34 34 3a 33 33 20 47 4d 54 08 00 15 22 33 64   |:44:33 GMT..."3d|
  0050  2d 31 38 64 63 33 39 36 38 61 36 63 65 62 63 62   |-18dc3968a6cebcb|
  0060  38 22 09 00 08 62 73 65 72 76 65 2f 31 0a 00 1d   |8"...bserve/1...|
  0070  57 65 64 2c 20 30 37 20 4f 63 74 20 32 30 32 36   |Wed, 07 Oct 2026|
  0080  20 31 31 3a 30 33 3a 31 32 20 47 4d 54            | 11:03:12 GMT|

  0000  00 00 85                    length = 133
  0003  01                          type = HEADERS
  0004  00                          flags = none
  0005  00 00 01                    stream id = 1
  0008  00 c8                       status = 200
  000a  05                          field: name #5 = content-type
  000b  00 18                         value length = 24
  000d  74 65 78 74 2f 68 74 6d ..    value = 'text/html; charset=utf-8'
  0025  06                          field: name #6 = content-length
  0026  00 02                         value length = 2
  0028  36 31                         value = '61'
  002a  07                          field: name #7 = last-modified
  002b  00 1d                         value length = 29
  002d  57 65 64 2c 20 30 37 20 ..    value = 'Wed, 07 Oct 2026 10:44:33 GMT'
  004a  08                          field: name #8 = etag
  004b  00 15                         value length = 21
  004d  22 33 64 2d 31 38 64 63 ..    value = '"3d-18dc3968a6cebcb8"'
  0062  09                          field: name #9 = server
  0063  00 08                         value length = 8
  0065  62 73 65 72 76 65 2f 31       value = 'bserve/1'
  006d  0a                          field: name #10 = date
  006e  00 1d                         value length = 29
  0070  57 65 64 2c 20 30 37 20 ..    value = 'Wed, 07 Oct 2026 11:03:12 GMT'
```

```
< DATA stream=1 END_STREAM (69 bytes)
  0000  00 00 3d 02 01 00 00 01 3c 21 64 6f 63 74 79 70   |..=.....<!doctyp|
  0010  65 20 68 74 6d 6c 3e 0a 3c 74 69 74 6c 65 3e 42   |e html>.<title>B|
  0020  48 50 3c 2f 74 69 74 6c 65 3e 0a 3c 68 31 3e 48   |HP</title>.<h1>H|
  0030  65 6c 6c 6f 20 6f 76 65 72 20 42 48 50 2f 31 3c   |ello over BHP/1<|
  0040  2f 68 31 3e 0a                                    |/h1>.|

  0000  00 00 3d                    length = 61
  0003  02                          type = DATA
  0004  01                          flags = END_STREAM
  0005  00 00 01                    stream id = 1
  0008  3c 21 64 6f 63 74 79 70 ..  body (61 bytes)
```

Body delivered to stdout (61 bytes):

```html
<!doctype html>
<title>BHP</title>
<h1>Hello over BHP/1</h1>
```
