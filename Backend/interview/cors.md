# CORS & Cookies

## 1. What is CORS?

**CORS = Cross-Origin Resource Sharing**

CORS is a **browser security mechanism** that controls whether JavaScript running on one origin is allowed to access a response from another origin.

Example:

```text
Frontend:
https://myapp.com

Backend:
https://api.myapp.com
```

These are different **origins**, so when frontend JavaScript calls the backend, the browser applies CORS rules.

### Simple definition

> CORS answers: **"Is this website allowed to access the response from that other website?"**

---

# 2. What is an Origin?

An origin consists of:

```text
scheme + host + port
```

Example:

```text
https://example.com:443
```

### Different origins

```text
https://example.com
http://example.com
```

Different scheme (`https` vs `http`).

```text
https://example.com
https://api.example.com
```

Different host.

```text
https://example.com:443
https://example.com:8080
```

Different port.

---

# 3. What is a Cookie?

A **cookie is a small piece of data that a server asks the browser to store**.

Cookies are commonly used for:

* Login sessions
* Authentication
* User preferences
* Tracking
* Remembering state

### Important mental model

> **Server creates the cookie → Browser stores it → Browser sends it back later.**

---

# 4. Basic Cookie Flow

Suppose you log into:

```text
https://myapp.com
```

You submit:

```text
email: bhavya@example.com
password: ******
```

The browser sends:

```http
POST /login

email=bhavya@example.com
password=******
```

The server verifies the credentials.

If they're valid, the server creates a session:

```text
session_id = abc123
```

The server sends:

```http
Set-Cookie: session_id=abc123
```

### Browser stores it

Conceptually:

```text
Browser
└── Cookies
    └── myapp.com
        └── session_id = abc123
```

---

# 5. How Does the Cookie Come Back?

Later, you request:

```text
GET /profile
```

The browser sees that it has a cookie for that website.

It automatically sends:

```http
GET /profile
Cookie: session_id=abc123
```

The server receives:

```text
session_id = abc123
```

and can look up:

```text
abc123 → user_id = 42
```

Therefore, the server knows which user is making the request.

---

# 6. The Most Important Cookie Distinction

### Server → Browser

```http
Set-Cookie: session_id=abc123
```

Means:

> **"Browser, store this cookie."**

### Browser → Server

```http
Cookie: session_id=abc123
```

Means:

> **"Here is the cookie you previously gave me."**

### Memory trick

```text
SET-Cookie
Server → Browser

Cookie
Browser → Server
```

---

# 7. Where is the Session Actually Stored?

There can be two pieces of information.

### Browser

```text
session_id = abc123
```

### Server

```text
abc123 → user_id = 42
```

The browser doesn't necessarily contain the user's entire account information.

Usually, it just stores an identifier.

The server uses that identifier to find the user's session.

---

# 8. Cookies and CORS

Now suppose the architecture is:

```text
Frontend:
https://myapp.com

Backend:
https://api.myapp.com
```

Your frontend JavaScript makes:

```javascript
fetch("https://api.myapp.com/profile");
```

The browser sees:

```text
myapp.com
      ↓
api.myapp.com
```

These are different origins.

Therefore, CORS rules apply.

---

# 9. What Does CORS Actually Control?

CORS does **not** create cookies.

CORS does **not** authenticate the user.

CORS mainly controls:

> **Whether browser JavaScript is allowed to access the cross-origin response.**

For example:

```text
Frontend JavaScript
        │
        │ Request
        ▼
Backend
        │
        │ Response
        ▼
Browser
        │
        │ CORS check
        ▼
Can JavaScript access the response?
```

---

# 10. What Are Credentials?

In browser requests, **credentials** can include things such as:

* Cookies
* HTTP authentication credentials
* Client certificates

For CORS discussions, cookies are the most common example.

Suppose the browser already has:

```text
api.myapp.com
└── session_id=abc123
```

Your frontend wants to make a cross-origin request.

JavaScript can say:

```javascript
fetch("https://api.myapp.com/profile", {
    credentials: "include"
});
```

This tells the browser:

> **"Include credentials such as cookies in this cross-origin request."**

---

# 11. `Access-Control-Allow-Credentials`

The server can respond with:

```http
Access-Control-Allow-Credentials: true
```

This means:

> **"I allow this CORS request to involve credentials."**

It does NOT mean:

> "The user is authenticated."

Authentication is still handled by your session/token system.

It simply means the server allows credentialed CORS.

---

# 12. Complete CORS + Cookie Flow

Let's put everything together.

Frontend:

```text
https://myapp.com
```

Backend:

```text
https://api.myapp.com
```

The user has already logged in.

Browser has:

```text
session_id=abc123
```

Frontend executes:

```javascript
fetch("https://api.myapp.com/profile", {
    credentials: "include"
});
```

The browser can send:

```http
Origin: https://myapp.com
Cookie: session_id=abc123
```

The server receives the request.

It sees:

```text
session_id = abc123
```

and identifies the user.

The server responds with something like:

```http
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Credentials: true
```

plus the actual response:

```json
{
    "name": "Bhavya",
    "orders": [...]
}
```

The browser checks the CORS headers.

It sees:

```http
Access-Control-Allow-Origin: https://myapp.com
```

and knows:

> "This origin is allowed."

It also sees:

```http
Access-Control-Allow-Credentials: true
```

and knows:

> "Credentialed CORS is allowed."

Therefore, the browser allows the frontend JavaScript to access the response.

---

# 13. Two Separate Questions

This is one of the most important concepts.

When cookies + CORS are involved, there are actually **two different questions**.

### Question 1: Should the browser send the cookie?

This involves:

```javascript
credentials: "include"
```

plus the cookie's own rules, such as:

```text
SameSite
Secure
Domain
Path
```

### Question 2: Can JavaScript access the response?

This is where CORS comes in:

```http
Access-Control-Allow-Origin
Access-Control-Allow-Credentials
```

So:

```text
Cookie rules / credentials
        ↓
Should credentials be sent?

CORS
        ↓
Can JavaScript access the response?
```

---

# 14. Why `Access-Control-Allow-Origin` Is Important

The server can say:

```http
Access-Control-Allow-Origin: https://myapp.com
```

Meaning:

> "JavaScript running on `myapp.com` is allowed to access this response."

It could also say:

```http
Access-Control-Allow-Origin: *
```

Meaning:

> "Any origin is allowed for this CORS resource."

But `*` cannot be used with credentialed CORS.

---

# 15. Why Can't `*` Be Used With Credentials?

Imagine the server says:

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
```

That would essentially mean:

> "Any website can access this resource while using credentials."

That would be unsafe for many authenticated resources.

Therefore, credentialed CORS requires an explicit origin.

Instead:

```http
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Credentials: true
```

Think:

```text
Without credentials:

"Anyone can access"
        ↓
*

With credentials:

"Only this trusted website"
        ↓
https://myapp.com
```

---

# 16. CORS Does NOT Mean Authentication

This is a common interview trap.

CORS is **not**:

* Authentication
* Authorization
* A firewall
* An API security mechanism by itself
* CSRF protection

For example, someone can still use:

```text
curl
Postman
another backend
```

to call your API.

CORS is primarily a **browser-enforced restriction**.

---

# 17. Why Does CORS Sometimes Show a 200 but JavaScript Gets an Error?

Suppose the backend successfully processes:

```http
GET /profile
```

and returns:

```http
200 OK
```

But it doesn't provide the correct CORS headers.

The browser may still prevent JavaScript from accessing the response.

So you might see:

```text
Network:
200 OK

JavaScript:
CORS error
```

This is because:

> The server successfully processed the request, but the browser refused to expose the response to JavaScript.

---

# 18. What is `Vary: Origin`?

Now we introduce caching.

Suppose the server dynamically changes the CORS response depending on the request's `Origin`.

For example:

Request from:

```http
Origin: https://myapp.com
```

Response:

```http
Access-Control-Allow-Origin: https://myapp.com
```

Another request:

```http
Origin: https://anotherapp.com
```

could receive a different CORS response.

Therefore, the cache needs to know:

> **"The response can change depending on Origin."**

That's what:

```http
Vary: Origin
```

tells the cache.

---

# 19. What Does `Vary: Origin` Actually Mean?

Without:

```http
Vary: Origin
```

a cache might think:

```text
/api/profile
```

always has one response.

But with:

```http
Vary: Origin
```

the cache knows that `Origin` matters when deciding which cached response to use.

Conceptually:

```text
/api/data + Origin=myapp.com
        ↓
Cached response A


/api/data + Origin=anotherapp.com
        ↓
Cached response B
```

### Simple definition

> **`Vary: Origin` tells caches that the response may be different depending on the request's `Origin`.**

---

# 20. Why Is `Vary: Origin` Needed?

Imagine:

```text
Browser
   ↓
CDN / Cache
   ↓
Server
```

The first request comes from:

```text
https://myapp.com
```

The server responds:

```http
Access-Control-Allow-Origin: https://myapp.com
```

The CDN caches that response.

Then another website requests the same URL.

Without properly varying the cache by `Origin`, the cache could potentially reuse the previous response's CORS headers.

Therefore:

```http
Vary: Origin
```

tells the cache:

> "Origin affects this response, so take Origin into account when caching."

---

# 21. What is a Cache?

A cache stores a previous response so that it doesn't have to be generated again.

Without caching:

```text
User 1 ──→ Server
User 2 ──→ Server
User 3 ──→ Server
User 4 ──→ Server
```

With caching:

```text
User 1 ──→ Server
             ↓
           Cache

User 2 ──→ Cache
User 3 ──→ Cache
User 4 ──→ Cache
```

The cache can return an already-created response.

---

# 22. CORS + Cookies + Cache Together

Complete picture:

```text
                    LOGIN

Browser ─────────────────────► Server
        username + password

Browser ◄───────────────────── Server
        Set-Cookie: session_id=abc123

Browser stores:
session_id=abc123


                    LATER

Frontend JS
    │
    │ fetch(api.myapp.com/profile,
    │       credentials: "include")
    ▼
Browser
    │
    │ Origin: https://myapp.com
    │ Cookie: session_id=abc123
    ▼
CDN / Cache
    │
    ▼
Server
    │
    │ checks session_id
    │ identifies user
    │
    ▼
Response:
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Credentials: true
Vary: Origin
    │
    ▼
Browser
    │
    │ CORS check
    ▼
JavaScript receives response
```

---

# 23. Important CORS Headers

## `Access-Control-Allow-Origin`

Tells the browser which origin is allowed.

```http
Access-Control-Allow-Origin: https://myapp.com
```

Think:

> "Who is allowed?"

---

## `Access-Control-Allow-Credentials`

Tells the browser that credentialed cross-origin requests are allowed.

```http
Access-Control-Allow-Credentials: true
```

Think:

> "Can credentials be involved?"

---

## `Access-Control-Allow-Methods`

Specifies allowed HTTP methods.

```http
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
```

Think:

> "Which HTTP methods are allowed?"

---

## `Access-Control-Allow-Headers`

Specifies which request headers the browser is allowed to send in a CORS request, particularly relevant to preflighted requests.

```http
Access-Control-Allow-Headers: Content-Type, Authorization
```

Think:

> "Which request headers are allowed?"

---

## `Access-Control-Expose-Headers`

Controls which response headers JavaScript is allowed to read.

For example:

```http
Access-Control-Expose-Headers: X-Request-ID
```

Without exposure, JavaScript cannot necessarily read arbitrary response headers even though the response itself is accessible.

Think:

> "Which response headers can JavaScript see?"

---

## `Access-Control-Max-Age`

Tells the browser how long it can cache the result of a CORS preflight.

```http
Access-Control-Max-Age: 3600
```

Think:

> "How long can I remember the preflight permission?"

---

# 24. Preflight Request

Some cross-origin requests require the browser to ask permission **before** sending the actual request.

The browser sends:

```http
OPTIONS /profile
Origin: https://myapp.com
Access-Control-Request-Method: DELETE
Access-Control-Request-Headers: Authorization
```

The server responds:

```http
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Methods: DELETE
Access-Control-Allow-Headers: Authorization
```

The browser then knows:

> "Okay, this request is allowed."

and sends the actual request.

### Mental model

```text
Browser
   │
   │ "Can I send this?"
   ▼
Server
   │
   │ "Yes"
   ▼
Browser
   │
   │ Actual request
   ▼
Server
```

Not every cross-origin request requires preflight.

Common things that can trigger it include:

```text
PUT
PATCH
DELETE
Authorization header
Content-Type: application/json
```

---

# 25. CORS Mental Model

Remember these questions:

```text
Origin
↓
Who is asking?

Access-Control-Allow-Origin
↓
Who is allowed?

Preflight
↓
"Can I make this request?"

Access-Control-Allow-Methods
↓
Which methods?

Access-Control-Allow-Headers
↓
Which request headers?

Access-Control-Allow-Credentials
↓
Can credentials be involved?

Access-Control-Expose-Headers
↓
Which response headers can JS read?

Vary: Origin
↓
Cache, remember that responses may differ by Origin.
```

---

# 26. Cookie Mental Model

Remember this flow:

```text
                 SERVER
                   │
                   │ Set-Cookie
                   ▼
                BROWSER
                   │
                   │ stores cookie
                   │
                   ▼
            session_id=abc123
                   │
                   │ later request
                   │
                   │ Cookie: abc123
                   ▼
                 SERVER
```

### One-line version

> **The server creates the cookie, the browser stores it, and the browser sends it back on matching requests.**

---

# 27. Interview Questions

### Q: What is a cookie?

**Answer:**

> A cookie is a small piece of data that a server asks the browser to store. The browser can then automatically send the cookie with matching requests. Cookies are commonly used for session management and authentication.

---

### Q: Who creates a cookie?

**Answer:**

> Usually the server creates the cookie and sends it to the browser using the `Set-Cookie` response header.

---

### Q: Who sends the cookie back?

**Answer:**

> The browser sends the stored cookie back to the server using the `Cookie` request header when the cookie's rules allow it.

---

### Q: What does `credentials: "include"` do?

**Answer:**

> It tells the browser to include credentials such as cookies in a cross-origin request, subject to the browser's cookie and security rules.

---

### Q: What does `Access-Control-Allow-Credentials: true` mean?

**Answer:**

> It tells the browser that the server permits credentialed CORS requests. It does not authenticate the user by itself.

---

### Q: Why can't `Access-Control-Allow-Origin: *` be used with credentials?

**Answer:**

> Because allowing every origin to access credentialed responses would be unsafe. Credentialed CORS therefore requires an explicit allowed origin.

---

### Q: What is `Vary: Origin`?

**Answer:**

> `Vary: Origin` tells caches that the response can vary depending on the request's `Origin`, so the cache should take Origin into account when selecting a cached response.

---

### Q: Is CORS authentication?

**Answer:**

> No. CORS is a browser security mechanism controlling whether JavaScript can access cross-origin responses. Authentication is handled separately using mechanisms such as sessions, cookies, or tokens.

---

# 28. Common Interview Traps

### ❌ "Cookies are created by the browser."

Not usually.

### ✅ Correct:

```text
Server creates
       ↓
Browser stores
       ↓
Browser sends back
```

---

### ❌ "`no-cors` means CORS is disabled."

No.

It changes how the browser performs the request and generally gives JavaScript an opaque response; it does not turn off browser security.

---

### ❌ "CORS blocks the server from receiving the request."

Not necessarily.

For some simple requests, the browser can send the request but prevent JavaScript from reading the response.

---

### ❌ "`Access-Control-Allow-Credentials` means the user is authenticated."

No.

It only allows credentialed CORS.

Authentication is a separate mechanism.

---

### ❌ "`Vary: Origin` is a CORS permission."

No.

It is primarily a **caching instruction**.

It tells caches that the response varies based on `Origin`.

---

# 29. Final Cheat Sheet

```text
COOKIE
→ Small piece of data stored by browser.

Set-Cookie
→ Server → Browser
→ "Store this cookie."

Cookie
→ Browser → Server
→ "Here is my stored cookie."

credentials: "include"
→ Browser, please include credentials such as cookies
  in this cross-origin request.

Access-Control-Allow-Origin
→ Which origin is allowed to access the response?

Access-Control-Allow-Credentials
→ Is credentialed CORS allowed?

Access-Control-Allow-Methods
→ Which HTTP methods are allowed?

Access-Control-Allow-Headers
→ Which request headers are allowed?

Access-Control-Expose-Headers
→ Which response headers can JavaScript read?

Access-Control-Max-Age
→ How long can the browser cache preflight permission?

Vary: Origin
→ Cache, remember that the response may differ
  depending on Origin.

CORS
→ Controls browser JavaScript's access to
  cross-origin responses.

Authentication
→ Determines who the user is.

Authorization
→ Determines what the user is allowed to do.
```

## ⭐ The Big Picture

```text
                 SERVER
                   │
             creates cookie
                   │
              Set-Cookie
                   │
                   ▼
                BROWSER
                   │
              stores cookie
                   │
                   │
        ┌──────────┴──────────┐
        │                     │
        │ credentials:include │
        │                     │
        ▼                     ▼
     Cookie                Origin
        │                     │
        │                     │
        └──────────┬──────────┘
                   ▼
                REQUEST
                   │
                   ▼
                SERVER
                   │
          checks session/cookie
                   │
                   ▼
                RESPONSE
                   │
        ┌──────────┴──────────┐
        │                     │
    CORS headers          Vary: Origin
        │                     │
        ▼                     ▼
    Browser checks         Cache knows
    permission             Origin matters
        │
        ▼
 JavaScript can/cannot
 access the response
```

### 🧠 One sentence to remember

> **The server creates the cookie, the browser stores and sends it, credentials control whether the browser includes it in a cross-origin request, CORS controls whether JavaScript can access the response, and `Vary: Origin` tells caches that the response may differ for different origins.**
