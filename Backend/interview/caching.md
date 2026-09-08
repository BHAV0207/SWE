
# HTTP Caching

> HTTP caching allows browsers and intermediate caches (CDNs, proxies, reverse proxies) to reuse previously received HTTP responses instead of contacting the origin server for every request.

---

## 1. Why HTTP Caching?

Without caching:

```text
Client → Server → Database
       ← Server ←
````

Every request causes network transfer + server processing.

With caching:

```text
Client → Cache
       ← Cached Response
```

The origin server may never be contacted.

### Benefits

* Lower latency
* Reduced bandwidth usage
* Lower server load
* Fewer database/application requests
* Better scalability
* Better user experience

---

# 2. Where Can HTTP Caching Happen?

```text
Browser
   ↓
CDN
   ↓
Reverse Proxy
   ↓
Application
   ↓
Database
```

Common HTTP caches:

* Browser cache
* CDN cache (CloudFront, Cloudflare, Fastly, etc.)
* Proxy cache
* Reverse proxy cache (e.g. Nginx/Varnish)

> Redis/Memcached/database caching is also caching, but it is **not HTTP caching**.

---

# 3. Core Mental Model

Every cache essentially asks:

```text
1. Do I have a cached response?
        ↓
2. Am I allowed to use it?
        ↓
3. Is it still fresh?
        ↓
4. If stale, can I revalidate it?
        ↓
5. Did the resource change?
```

The lifecycle:

```text
             REQUEST
                ↓
              CACHE
                ↓
        ┌───────┴────────┐
        │                │
    No response      Response exists
        │                │
       MISS          Is it fresh?
                         │
                  ┌──────┴──────┐
                  │             │
                 YES            NO
                  │             │
               HIT         Revalidate
                                │
                         ┌──────┴──────┐
                         │             │
                        304            200
                         │             │
                   Reuse cache     New response
```

---

# 4. Fresh vs Stale

This is the most important caching concept.

### Fresh

A cached response is within its allowed freshness lifetime.

```text
Cached at: 10:00
max-age: 3600

10:30 → Fresh
10:59 → Fresh
11:01 → Stale
```

A fresh response can generally be served without contacting the origin.

### Stale

The freshness lifetime has expired.

> Stale does NOT necessarily mean the response is wrong or unusable. It means the cache can no longer blindly treat it as fresh.

A stale response may be revalidated or, under specific directives/conditions, served stale.

---

# 5. `Cache-Control`

The most important HTTP caching header.

Example:

```http
Cache-Control: max-age=3600
```

---

# 6. Important `Cache-Control` Directives

## `max-age`

```http
Cache-Control: max-age=3600
```

Response can be considered fresh for 3600 seconds.

```text
max-age = 3600 seconds = 1 hour
```

---

## `no-store`

```http
Cache-Control: no-store
```

Do not store the response in a cache.

Use for highly sensitive data when appropriate.

```text
no-store
   ↓
Do not cache/store
```

### Important

`no-store` ≠ `no-cache`

---

## `no-cache`

```http
Cache-Control: no-cache
```

Misleading name.

It does **not** mean "don't cache."

It means:

```text
Can store response
       ↓
Must validate before reusing it
```

So:

```text
no-store → don't store

no-cache → can store, but must revalidate before reuse
```

This distinction is frequently asked in interviews.

---

## `private`

```http
Cache-Control: private
```

Response is intended for a private cache such as the user's browser.

It should not be stored by shared caches.

Useful for personalized responses.

Example:

```http
Cache-Control: private, max-age=60
```

---

## `public`

```http
Cache-Control: public
```

Indicates the response may be stored by shared caches.

Useful for resources such as:

* Public images
* CSS
* JavaScript
* Public API responses
* Public pages

Example:

```http
Cache-Control: public, max-age=3600
```

---

## `must-revalidate`

```http
Cache-Control: max-age=60, must-revalidate
```

Once stale, the cache must revalidate before using the response under the directive's applicable conditions.

```text
Fresh
  ↓
max-age expires
  ↓
Stale
  ↓
MUST REVALIDATE
```

---

## `s-maxage`

```http
Cache-Control: max-age=60, s-maxage=3600
```

`s-maxage` controls freshness specifically for **shared caches**.

Conceptually:

```text
Browser/private cache → 60 seconds
CDN/shared cache      → 3600 seconds
```

Useful when browser and CDN caching should have different lifetimes.

---

## `immutable`

```http
Cache-Control: public, max-age=31536000, immutable
```

Indicates the representation is not expected to change while fresh.

Common with content-hashed assets:

```text
app.a81f92.js
styles.73ab21.css
```

If content changes, the filename changes.

---

## `stale-while-revalidate`

```http
Cache-Control: max-age=60, stale-while-revalidate=300
```

Allows a stale response to be served while the cache revalidates it in the background.

Conceptually:

```text
0–60 sec
    ↓
Fresh

60–360 sec
    ↓
May serve stale
    +
Revalidate in background
```

Useful for reducing latency.

---

## `stale-if-error`

```http
Cache-Control: max-age=60, stale-if-error=600
```

Allows a stale cached response to be served when the origin encounters an error, subject to the applicable caching rules.

Useful for resilience.

---


# 8. Validators

When a cached response becomes stale, the cache can ask:

> "Has this resource changed?"

Two important validators:

```text
ETag
Last-Modified
```

---

# 9. ETag

Server sends:

```http
ETag: "abc123"
```

This is a validator identifying a particular representation.

Example:

```http
HTTP/1.1 200 OK
Cache-Control: max-age=60
ETag: "user-list-v8"

[
  ...
]
```

The cache stores:

```text
Body
ETag = "user-list-v8"
```

Later, after it becomes stale:

```http
GET /users
If-None-Match: "user-list-v8"
```

The server checks whether its current representation still matches that ETag.

---

# 10. `If-None-Match`

Request header used with ETags.

```http
If-None-Match: "abc123"
```

Think:

```text
Server:
ETag: "abc123"

Client later:
If-None-Match: "abc123"
```

If the representation hasn't changed:

```http
HTTP/1.1 304 Not Modified
```

If it changed:

```http
HTTP/1.1 200 OK
ETag: "new-value"

[new response body]
```

---

# 11. `304 Not Modified`

`304` is NOT an error.

It means:

> The cached representation can still be used.

Example:

```text
Cached response:
Body = OLD BODY
ETag = "abc123"

        ↓

GET /resource
If-None-Match: "abc123"

        ↓

Server

        ↓

304 Not Modified
```

The server does not need to resend the body.

The client/cache reuses the existing body.

---

# 12. Why ETag + 304?

Suppose a response is 5 MB.

Without validation:

```text
Download 5 MB again
```

With ETag:

```text
Request:
If-None-Match: "abc123"

Response:
304 Not Modified
```

Only a small validation exchange occurs and the cached 5 MB body is reused.

---

# 13. Last-Modified

Server can also provide:

```http
Last-Modified: Tue, 08 Sep 2026 10:00:00 GMT
```

This indicates when the representation was last modified.

Later the client sends:

```http
If-Modified-Since: Tue, 08 Sep 2026 10:00:00 GMT
```

If unchanged:

```http
304 Not Modified
```

If changed:

```http
200 OK
[new body]
```

---

# 14. ETag vs Last-Modified

| ETag                                   | Last-Modified               |
| -------------------------------------- | --------------------------- |
| Representation validator               | Modification timestamp      |
| `If-None-Match`                        | `If-Modified-Since`         |
| Generally more precise                 | Timestamp-based             |
| Can identify a specific representation | Indicates modification time |
| Usually preferred when available       | Useful fallback             |

### Memory trick

```text
ETag
  ↓
"If my version still matches?"

Last-Modified
  ↓
"Has it changed since this time?"
```

---

# 15. Strong vs Weak ETag

Strong:

```http
ETag: "abc123"
```

Weak:

```http
ETag: W/"abc123"
```

`W/` means the validator is weak.

Weak validators indicate semantic equivalence may be sufficient even when representations aren't necessarily byte-for-byte identical.

For most interviews:

```text
ETag = representation validator
```

is enough, but knowing weak ETags exist is useful.

---

# 17. `Age`

Often seen with shared caches/CDNs:

```http
Age: 120
```

Indicates approximately how long the response has been resident in a shared cache.

Example:

```http
Cache-Control: max-age=600
Age: 120
```

Roughly:

```text
Freshness lifetime = 600 sec
Age                 = 120 sec
Remaining           ≈ 480 sec
```

---

# 18. `Vary`

Very important for shared caches.

```http
Vary: Accept-Encoding
```

Means the response varies based on the `Accept-Encoding` request header.

For example:

```text
Request A:
Accept-Encoding: gzip

Response A:
gzip version
```

and:

```text
Request B:
Accept-Encoding: identity

Response B:
uncompressed version
```

The cache must distinguish these variants.

Other examples:

```http
Vary: Accept-Language
Vary: Accept-Encoding
```

Conceptually:

```text
Cache key
+
Varying request headers
        ↓
Different cached variants
```

---

# 19. Cache Keys

A cache must determine whether two requests refer to the same cacheable representation.

For example:

```text
GET /products?page=1
GET /products?page=2
```

These must normally be treated as different cache entries.

Conceptually:

```text
GET /products?page=1
        ↓
Cache Key A

GET /products?page=2
        ↓
Cache Key B
```

Cache keys can involve:

* HTTP method
* URL
* Query parameters
* Relevant request headers
* `Vary`
* CDN-specific configuration

This is especially important for CDN configuration and cache security.

---

# 20. Browser Cache vs CDN Cache

### Browser cache

Private to one user:

```text
User
 ↓
Browser Cache
```

### CDN cache

Shared among users:

```text
User A ──┐
User B ──┼──→ CDN Cache
User C ──┘
```

Therefore:

```text
private
```

is important for personalized responses.

And:

```text
public
s-maxage
```

are commonly relevant to shared caches.

---

# 21. Personalized Responses

Consider:

```http
GET /api/me
```

Response:

```json
{
  "name": "Bhavya",
  "balance": 500000
}
```

This is user-specific.

You must not accidentally allow a shared cache to do:

```text
User A
  ↓
CDN
  ↓
cached /api/me
  ↓
User B
```

Potentially exposing User A's data.

For personalized/sensitive data, carefully consider:

```text
Cache-Control: private
```

or:

```text
Cache-Control: no-store
```

depending on the requirements.

> Never assume that "GET = safe to cache." Always consider whether the response is personalized and who can access the cache.

---

# 22. Cache Invalidation

A major caching problem:

```text
Cache contains OLD data
        ↓
Origin contains NEW data
```

Common strategies:

### 1. Short TTL

```http
Cache-Control: max-age=60
```

New data becomes visible relatively quickly.

### 2. CDN purge

Explicitly remove the cached resource.

### 3. Versioned URLs

```text
app.v1.js
app.v2.js
```

### 4. Content hashing

```text
app.a81c92.js
app.b72d11.js
```

When content changes, the URL changes.

This is one of the best strategies for static assets.

---

# 23. Static Asset Caching

For content-hashed assets:

```text
app.a81c92.js
styles.71f2aa.css
logo.83ac91.png
```

You can use very long caching:

```http
Cache-Control: public, max-age=31536000, immutable
```

Why is this safe?

Because changing the content creates a new URL:

```text
Old:
app.a81c92.js

New:
app.b92d11.js
```

Therefore:

```text
Old URL → old content
New URL → new content
```

No need to invalidate the old URL immediately.

---

# 25. HTTP Cache vs Application Cache

### HTTP cache

```text
Browser/CDN
     ↓
HTTP response
```

Controlled by:

```text
Cache-Control
ETag
Last-Modified
Expires
Vary
```

### Application cache

```text
Application
     ↓
Redis
     ↓
Database
```

Controlled by application code.

A production architecture can use both:

```text
Browser
   ↓
CDN
   ↓
Reverse Proxy
   ↓
Application
   ↓
Redis
   ↓
Database
```

---

# 26. Important Request/Response Headers

| Header              | Direction          | Purpose                                            |
| ------------------- | ------------------ | -------------------------------------------------- |
| `Cache-Control`     | Request + Response | Main caching directives                            |
| `ETag`              | Response           | Representation validator                           |
| `If-None-Match`     | Request            | Sends ETag validator                               |
| `Last-Modified`     | Response           | Modification timestamp                             |
| `If-Modified-Since` | Request            | Sends modification timestamp                       |
| `Expires`           | Response           | Absolute expiration                                |
| `Age`               | Response           | Approximate cache age                              |
| `Vary`              | Response           | Defines request headers that affect representation |

---

# 27. Most Important `Cache-Control` Cheat Sheet

| Directive                    | Meaning                                   |
| ---------------------------- | ----------------------------------------- |
| `max-age=3600`               | Fresh for 3600 seconds                    |
| `no-store`                   | Do not store                              |
| `no-cache`                   | Can store, but must validate before reuse |
| `private`                    | Private cache only                        |
| `public`                     | Shared caching permitted                  |
| `must-revalidate`            | Must revalidate when stale                |
| `s-maxage=3600`              | Freshness lifetime for shared caches      |
| `immutable`                  | Representation isn't expected to change   |
| `stale-while-revalidate=300` | May serve stale while revalidating        |
| `stale-if-error=600`         | May serve stale when origin errors        |

---

# 28. Complete Example

Server:

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: public, max-age=60
ETag: "users-v8"

[
  {"id": 1, "name": "A"},
  {"id": 2, "name": "B"}
]
```

### First request

```text
Cache MISS
   ↓
Origin
   ↓
200 OK + body
   ↓
Cache stores response
```

### Request 30 seconds later

```text
Age < max-age
   ↓
Fresh
   ↓
CACHE HIT
   ↓
Return cached body
```

No origin request.

### Request 2 minutes later

```text
Cached response is stale
   ↓
Revalidate
```

Request:

```http
GET /users
If-None-Match: "users-v8"
```

If unchanged:

```http
304 Not Modified
```

Reuse cached body.

If changed:

```http
200 OK
ETag: "users-v9"

[new body]
```

Replace/update cached representation.

---

# 29. `max-age=0` vs `no-cache` vs `no-store`

Very common interview trap.

```text
max-age=0
    ↓
Immediately stale for freshness purposes

no-cache
    ↓
May store
Must validate before reuse

no-store
    ↓
Don't store
```

They are NOT equivalent.

---

# 30. Conditional Request Flow

```text
                Cached Response
                      |
                      ↓
                   STALE
                      |
                      ↓
              Conditional Request
                      |
            ┌─────────┴─────────┐
            │                   │
        Resource same       Resource changed
            │                   │
            ↓                   ↓
          304                  200
            │                   │
            ↓                   ↓
    Reuse cached body       New response
```

Typical conditional headers:

```http
If-None-Match
If-Modified-Since
```

---

# 31. Interview-Level Reasoning

When debugging a caching problem, ask:

### 1. What resource is being cached?

```text
GET /api/products
GET /app.js
GET /profile
```

### 2. Which cache is involved?

```text
Browser?
CDN?
Reverse proxy?
Multiple layers?
```

### 3. What is the cache key?

```text
URL?
Query parameters?
Vary headers?
Other CDN configuration?
```

### 4. Can the response be stored?

Check:

```text
Cache-Control
```

Especially:

```text
no-store
private
public
```

### 5. Is it fresh?

Check:

```text
max-age
s-maxage
Expires
Age
```

### 6. If stale, can it be revalidated?

Check:

```text
ETag
Last-Modified
```

### 7. What happened during revalidation?

```text
304 → reuse existing body

200 → new representation
```

### 8. Can stale data be served?

Check:

```text
stale-while-revalidate
stale-if-error
```

### 9. Does the response vary?

Check:

```text
Vary
```

### 10. Is the data personalized?

If yes, be extremely careful with shared caching.

---

# 32. The 30-Second Interview Answer

> HTTP caching allows browsers and intermediate shared caches such as CDNs to reuse previously received responses instead of contacting the origin for every request. `Cache-Control` primarily controls whether and how a response can be cached and how long it remains fresh, with directives such as `max-age`, `no-store`, `no-cache`, `private`, `public`, and `s-maxage`.
>
> If a cached response is fresh, it can generally be served directly. Once it becomes stale, the cache can revalidate it using validators such as `ETag` or `Last-Modified`. The client sends `If-None-Match` or `If-Modified-Since`, and if the resource hasn't changed the server returns `304 Not Modified`, allowing the cached body to be reused. If it has changed, the server returns a new `200` response.
>
> `Vary` tells caches which request headers affect the representation, while `Expires` is an older expiration mechanism. For personalized data, shared caching must be handled carefully to avoid exposing one user's response to another.

---

# 33. Must-Know vs Advanced

## Must Know

For backend interviews, know these extremely well:

```text
Cache-Control
  ├── max-age
  ├── no-store
  ├── no-cache
  ├── private
  ├── public
  └── must-revalidate

ETag
If-None-Match
304 Not Modified

Last-Modified
If-Modified-Since

Expires
Vary

Fresh vs Stale
Cache Hit vs Miss vs Revalidation
Browser Cache vs CDN Cache
Cache Invalidation
```

## Advanced

Know the concepts behind:

```text
s-maxage
Age
immutable
stale-while-revalidate
stale-if-error
weak ETags
cache keys
cache poisoning
CDN cache behavior
personalized response caching
```

---


And remember what each major header answers:

```text
Cache-Control → "How should this response be cached?"

max-age       → "How long is it fresh?"

no-store      → "Don't store it."

no-cache      → "Store it if you want, but validate before reuse."

private       → "Don't put this in a shared cache."

public        → "Shared caches may store this."

s-maxage      → "How long should shared caches consider it fresh?"

ETag          → "What version/representation do I have?"

If-None-Match → "Is this ETag still valid?"

Last-Modified → "When was it last modified?"

If-Modified-Since
              → "Has it changed since this time?"

304           → "Your cached representation is still valid."

Vary          → "The response depends on these request headers."

Expires       → "When does this response expire?"
```

> **Core idea:** HTTP caching is fundamentally about **storing a response, determining whether it is fresh, and efficiently validating it when it becomes stale.**

