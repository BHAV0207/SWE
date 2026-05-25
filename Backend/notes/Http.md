# HTTP Complete Notes

# Introduction to HTTP

HTTP (HyperText Transfer Protocol) is an application-layer protocol used for communication between clients and servers on the web.

It works on the **Application Layer (Layer 7)** of the OSI Model.

---

# Core Concepts of HTTP

## 1. Stateless Nature of HTTP

HTTP is a **stateless protocol**.

This means:

- The server does not remember previous requests.
- Every request is treated independently.
- Each request must contain all the information required to process it.

Example:

```http
GET /profile HTTP/1.1
Authorization: Bearer xyz
```

The token must be sent every time because the server does not automatically remember the user.

---

## Why Statelessness is Beneficial?

Statelessness makes systems:

- Highly scalable
- Easier to distribute across multiple servers
- Easier to cache
- Easier to maintain

Because the server does not need to store client session memory for every user.

---

## Maintaining State in Stateless HTTP

Although HTTP itself is stateless, applications often require persistence.

For this we use:

- Cookies
- Sessions
- JWT Tokens
- Local Storage
- Session Storage

These mechanisms help maintain user identity and session continuity.

---

# 2. Client-Server Architecture

HTTP follows a **Client-Server Model**.

## Flow

1. Client sends request
2. Server processes request
3. Server sends response

Example:

```text
Browser → HTTP Request → Server
Browser ← HTTP Response ← Server
```

Client examples:

- Browser
- Mobile App
- Frontend Application

Server examples:

- Node.js Server
- Nginx
- Apache
- Express Backend

---

# TCP vs UDP

## TCP (Transmission Control Protocol)

HTTP/1.1 and HTTP/2 use TCP.

TCP provides:

- Reliable communication
- Ordered packet delivery
- Error checking
- Retransmission of lost packets

This makes it slower but reliable.

---

## UDP (User Datagram Protocol)

UDP is:

- Faster
- Connectionless
- Less reliable

It does not guarantee:

- Packet order
- Delivery
- Retransmission

---

# HTTP vs HTTPS

## HTTP

- Data transferred in plain text
- Not secure
- Vulnerable to attacks

Example:

```text
http://example.com
```

---

## HTTPS

HTTPS = HTTP + TLS/SSL Encryption

Features:

- Encrypted communication
- Authentication using SSL/TLS certificates
- Prevents man-in-the-middle attacks
- Secure data transfer

Example:

```text
https://example.com
```

---

# OSI Layer

HTTP works on:

## Layer 7 — Application Layer

Other related layers:

- Layer 4 → TCP/UDP
- Layer 3 → IP
- Layer 2 → Data Link

---

# HTTP Versions

# HTTP/1.1

Most widely used version historically.

Features:

- Persistent connections (Keep-Alive)
- Request pipelining
- Text-based protocol

Problems:

- Head-of-line blocking
- Multiple TCP connections needed

---

# HTTP/2

Major improvements over HTTP/1.1.

Features:

- Binary protocol
- Multiplexing
- Header compression (HPACK)
- Single TCP connection for multiple requests
- Faster performance

Important Correction:

gRPC is NOT introduced by HTTP/2.

Instead:

- gRPC is a framework developed by Google
- It commonly uses HTTP/2 underneath

---

# HTTP/3

HTTP/3 uses QUIC protocol.

QUIC is built on top of UDP.

Features:

- Faster connection establishment
- Better performance
- Reduced latency
- Improved handling of packet loss

Important:

HTTP/3 itself is not "raw UDP".

It uses QUIC over UDP.

---

# HTTP Request vs Response

# HTTP Request Structure

A request contains:

1. Method
2. URL
3. HTTP Version
4. Headers
5. Blank Line
6. Optional Body

Example:

```http
POST /users HTTP/1.1
Host: example.com
Content-Type: application/json

{
  "name": "Bhavya"
}
```

---

# HTTP Response Structure

A response contains:

1. HTTP Version
2. Status Code
3. Status Message
4. Headers
5. Blank Line
6. Optional Body

Example:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true
}
```

---

# HTTP Headers

Headers provide metadata about requests and responses.

Examples:

- Content-Type
- Authorization
- Cache-Control
- ETag
- Cookie
- Accept
- User-Agent

---

# Types of Headers

## Request Headers

Sent by client.

Example:

```http
Authorization: Bearer token
```

---

## Response Headers

Sent by server.

Example:

```http
Content-Type: application/json
```

---

## Security Headers

Examples:

- Content-Security-Policy
- Strict-Transport-Security
- X-Frame-Options

---

## Caching Headers

Examples:

- Cache-Control
- ETag
- Last-Modified

---

# Custom Headers

We can create custom headers.

Example:

```http
X-App-Version: 1.0
```

Headers are highly extensible.

---

# Content Negotiation

Content negotiation means the client and server decide the response format using headers.

Example:

```http
Accept: application/json
```

Possible formats:

- JSON
- XML
- HTML
- Plain Text

---

# HTTP Methods

# GET

- Fetch data
- No body usually
- Idempotent

---

# POST

- Create resource
- Non-idempotent

Example:

Creating a new user every time.

---

# PUT

- Replace/update resource
- Idempotent

Calling multiple times produces same final state.

---

# PATCH

- Partial update
- Usually non-idempotent

---

# DELETE

- Delete resource
- Generally idempotent

Deleting same resource multiple times keeps final state same.

---

# OPTIONS

Used mainly in CORS preflight requests.

Returns supported methods and headers.

---

# Idempotent Methods

Methods where repeated execution gives same final result.

## Idempotent

- GET
- PUT
- DELETE
- HEAD
- OPTIONS

## Non-Idempotent

- POST
- PATCH (usually)

---

# CORS (Cross-Origin Resource Sharing)

CORS is a browser security mechanism.

It controls whether frontend from one origin can access backend from another origin.

Example:

```text
Frontend → localhost:5173
Backend → localhost:3000
```

Different ports = different origins.

---

# Simple Requests

Simple requests do NOT trigger preflight.

Conditions:

- Method is GET, POST, or HEAD
- Only simple headers used
- Simple content types

Example:

```http
GET /users
```

---

# Access-Control-Allow-Origin

Backend sends:

```http
Access-Control-Allow-Origin: http://localhost:5173
```

If this header is absent or mismatched:

- Browser blocks frontend access
- Even if backend actually sent response

Important:

CORS is enforced by browsers, not servers.

---

# Preflight Requests

Browser sends OPTIONS request before actual request.

Purpose:

To check whether actual request is allowed.

---

# Preflight Trigger Conditions

Preflight happens if ANY of these are true:

## 1. Non-simple Methods

Example:

- PUT
- DELETE
- PATCH

---

## 2. Non-simple Headers

Example:

```http
Authorization
X-Custom-Header
```

---

## 3. Non-simple Content-Type

Example:

```http
Content-Type: application/json
```

Simple content types are:

- text/plain
- multipart/form-data
- application/x-www-form-urlencoded

---

# OPTIONS Request Example

```http
OPTIONS /users HTTP/1.1
Origin: http://localhost:5173
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: Authorization
```

---

# Preflight Response

Example:

```http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: PUT
Access-Control-Allow-Headers: Authorization
```

After approval:

Browser sends actual request.

---

# HTTP Status Codes

# 1xx Informational

Used for informational responses.

Example:

- 100 Continue

---

# 2xx Success

## 200 OK

Successful request.

Usually GET.

---

## 201 Created

Resource successfully created.

Usually POST.

---

## 204 No Content

Success but no response body.

Common in:

- DELETE
- OPTIONS

---

# 3xx Redirection

## 301 Moved Permanently

Permanent redirect.

---

## 302 Found

Temporary redirect.

---

## 304 Not Modified

Used in caching.

Means cached resource is still valid.

---

# 4xx Client Errors

## 400 Bad Request

Invalid request data.

---

## 401 Unauthorized

Authentication required or invalid token.

---

## 403 Forbidden

Authenticated but not allowed.

---

## 404 Not Found

Resource not found.

---

## 405 Method Not Allowed

HTTP method not supported.

---

## 429 Too Many Requests

Rate limit exceeded.

---

# 5xx Server Errors

## 500 Internal Server Error

Generic server failure.

---

## 501 Not Implemented

Functionality not supported.

---

## 503 Service Unavailable

Server temporarily unavailable.

---

## 504 Gateway Timeout

Upstream server timeout.

---

# HTTP Caching

Caching stores responses temporarily to reduce server load and improve speed.

Benefits:

- Faster responses
- Reduced bandwidth
- Reduced server load

---

# Important Caching Headers

# Cache-Control

Controls caching behavior.

Example:

```http
Cache-Control: max-age=60
```

Meaning:

Cache valid for 60 seconds.

---

# ETag

Unique identifier/version for resource.

Example:

```http
ETag: "abc123"
```

If ETag changes:

→ Resource changed.

---

# Last-Modified

Timestamp of last update.

Example:

```http
Last-Modified: Mon, 25 May 2026 10:00:00 GMT
```

---

# Conditional Requests

Browser sends:

```http
If-None-Match
If-Modified-Since
```

Server checks resource status.

---

# 304 Not Modified Flow

If resource unchanged:

```http
HTTP/1.1 304 Not Modified
```

Browser uses cached data.

No full response body sent.

---

# Compression

Compression reduces response size.

Benefits:

- Faster transfer
- Lower bandwidth usage
- Better performance

Common compression algorithms:

- Gzip
- Brotli

Example:

```http
Content-Encoding: gzip
```

---

# Persistent Connections / Keep-Alive

HTTP/1.1 introduced persistent connections.

Instead of creating new TCP connection for every request:

- Same connection reused

Benefits:

- Faster communication
- Reduced latency
- Lower overhead

Header:

```http
Connection: keep-alive
```

---

# Handling Large Requests and Responses

# Multipart Requests

Used for:

- File uploads
- Form uploads

Example:

```http
Content-Type: multipart/form-data
```

Data sent in chunks/parts.

---

# Streaming Responses

Server sends data gradually in chunks instead of entire response at once.

Useful for:

- Video streaming
- AI streaming responses
- Large downloads
- Real-time updates

Examples:

- Server-Sent Events (SSE)
- Chunked Transfer Encoding

---

# Important Interview Notes

## Important Corrections

### Incorrect:
"Stateless and client-server are two types of HTTP"

### Correct:
They are architectural principles/properties of HTTP.

---

### Incorrect:
"HTTP/2 introduced gRPC"

### Correct:
gRPC uses HTTP/2 but was not introduced by it.

---

### Incorrect:
"HTTP/3 is based directly on UDP"

### Correct:
HTTP/3 uses QUIC, which itself runs over UDP.

---

### Incorrect:
"If CORS fails, backend does not send response"

### Correct:
Backend may still send response, but browser blocks frontend access.

---

# Quick Revision Summary

| Topic | Key Point |
|---|---|
| Stateless | Server does not remember previous requests |
| Client-Server | Client sends request, server responds |
| HTTP Layer | Application Layer (Layer 7) |
| HTTP/1.1 | Text-based, keep-alive |
| HTTP/2 | Multiplexing, binary |
| HTTP/3 | QUIC over UDP |
| HTTPS | HTTP + TLS/SSL |
| Idempotent | GET, PUT, DELETE |
| Non-idempotent | POST |
| 304 | Resource not modified |
| 204 | Success with no body |
| OPTIONS | Used in CORS preflight |
| ETag | Resource version identifier |
| Keep-Alive | Reuse TCP connection |
| Compression | Gzip/Brotli |
| Streaming | Send response in chunks |

