# Application Security (AppSec) — Detailed Notes

---

# What is Application Security (AppSec)?

Application Security (AppSec) is a branch of security focused on protecting applications from vulnerabilities, attacks, and misuse.

These applications can be:

- Web applications
- APIs
- Mobile applications
- Desktop applications
- Cloud-native services

The goal of AppSec is:

- Prevent attackers from exploiting software
- Protect user data
- Ensure secure communication
- Detect and fix vulnerabilities early

---

# Information Security (InfoSec) vs AppSec

Information Security (InfoSec) is the broader umbrella.

It protects:

- Data
- Systems
- Networks
- Devices
- Infrastructure
- Applications
- Users
- Processes

AppSec is one specialized domain inside InfoSec.

---

# Security Landscape

## 1. Network Security

Focuses on protecting networks.

Examples:

- Firewalls
- IDS/IPS
- VPNs
- Traffic monitoring

### Example

Blocking malicious IPs using a firewall.

---

## 2. Cloud Security

Focuses on cloud environments.

Examples:

- AWS IAM permissions
- S3 bucket security
- Cloud misconfigurations
- CSPM tools

### Example

An S3 bucket accidentally made public exposing customer documents.

---

## 3. Endpoint Security

Protects devices.

Examples:

- Antivirus
- EDR
- Device hardening
- MDM

### Example

Stopping malware on employee laptops.

---

## 4. GRC (Governance, Risk, Compliance)

Focuses on:

- Policies
- Audits
- Compliance
- Risk management

### Example

Ensuring a company follows GDPR.

---

## 5. OT / ICS Security

Protects industrial systems.

Examples:

- SCADA
- Power grids
- Manufacturing systems

---

## 6. Application Security (AppSec)

Focuses on vulnerabilities in software logic.

Examples:

- SQL Injection
- XSS
- Authentication flaws
- Broken access control
- API vulnerabilities

This is where web pentesting mainly lives.

---

# Red Team vs Blue Team vs Purple Team

---

# 1. Red Team

The Red Team simulates attackers.

Their job is:

- Break into systems
- Find vulnerabilities
- Exploit weaknesses
- Think like hackers

Mindset:

> "How do I get in?"

---

## Red Team Activities

### Web Application Pentesting

Testing websites for vulnerabilities.

Examples:

- SQL Injection
- XSS
- CSRF
- IDOR

---

### Exploit Development

Creating payloads/exploits.

Example:

Crafting a malicious SQL payload:

```sql
' OR 1=1 --
```

---

### Bug Bounty Hunting

Finding vulnerabilities in real companies.

Platforms:

- HackerOne
- Bugcrowd

---

### Social Engineering

Manipulating humans.

Examples:

- Phishing emails
- Fake login pages

---

### Physical Security

Trying physical access attacks.

Example:

Tailgating into office buildings.

---

# 2. Blue Team

Blue Team defends systems.

Mindset:

> "How do I stop attackers?"

---

## Blue Team Activities

### Secure Code Review

Reviewing code for vulnerabilities.

Tools:

- Semgrep
- Bandit
- SonarQube

---

### WAF Configuration

Configuring Web Application Firewalls.

Example:

Blocking SQL Injection payloads.

---

### Threat Modeling

Predicting possible attacks before development.

Example:

Asking:
- What if attacker uploads malware?
- What if attacker modifies IDs?

---

### Security Monitoring

Watching logs and detecting attacks.

Tools:

- SIEM
- Splunk
- ELK

---

### Incident Response

Responding after attacks happen.

Example:

- Detect breach
- Contain attacker
- Recover systems

---

### DevSecOps

Adding security inside CI/CD pipelines.

Examples:

- SAST scanning
- Dependency scanning
- Secret scanning

---

# 3. Purple Team

Purple Team combines Red + Blue.

Mindset:

> "How do we improve defenses using attacks?"

---

## Purple Team Workflow

1. Red Team attacks
2. Blue Team observes
3. Weaknesses identified
4. Defenses improved

---

# Why AppSec is Unique

AppSec engineers often work across:

- Red Team
- Blue Team
- Purple Team

Because AppSec requires BOTH:

- Offensive knowledge
- Defensive knowledge

---

# AppSec vs InfoSec vs ProdSec vs Pentesting

| Domain | Scope | Focus |
|---|---|---|
| InfoSec | Entire organization | Protect everything |
| ProdSec | Entire product | Security of shipped product |
| AppSec | Application layer | Vulnerabilities in apps/APIs |
| Pentesting | Time-boxed testing | Simulate attackers |

---

# Why AppSec is Different

---

# 1. You Must Think Like an Attacker

Normal developers think:

> "Will this feature work?"

AppSec thinks:

> "How can this feature be abused?"

---

# Example

Developer:

```js
GET /user?id=42
```

Attacker:

```js
GET /user?id=43
```

Question:

- Can I access another user's data?

If yes → IDOR vulnerability.

---

# 2. AppSec Works Across Entire SDLC

Security is involved everywhere:

| Stage | Security Activity |
|---|---|
| Design | Threat modeling |
| Development | Secure coding |
| Testing | DAST/SAST |
| Deployment | Pentesting |
| Production | Monitoring |

---

# 3. Attack to Understand, Defend to Fix

Workflow:

1. Exploit vulnerability
2. Understand root cause
3. Implement fix
4. Verify fix works

---

# PART 1 — How the Web Works

---

# Client-Server Model

The web works on a client-server architecture.

---

## Client

The browser/mobile app.

Examples:

- Chrome
- Firefox
- Mobile apps

Client sends requests.

---

## Server

Backend machine/service.

Examples:

- Node.js server
- Go server
- Django server

Server processes requests and returns responses.

---

# Full Request Flow

---

# Step 1 — Browser

You type:

```txt
https://example.com
```

Browser starts the process.

---

# Step 2 — DNS Lookup

DNS converts domain → IP.

Example:

```txt
google.com → 142.250.183.14
```

Because computers communicate using IP addresses.

---

## Why DNS Matters in Security

Attackers target DNS too.

Examples:

- DNS spoofing
- DNS hijacking
- Cache poisoning

---

# Step 3 — TCP Connection

Browser establishes TCP connection.

Uses:

## 3-Way Handshake

### Step 1

Client → SYN

### Step 2

Server → SYN-ACK

### Step 3

Client → ACK

Now connection established.

---

# Why TCP Matters

Reliable communication:

- Packet ordering
- Error checking
- Retransmission

---

# Step 4 — TLS Handshake (HTTPS Only)

HTTPS adds encryption.

TLS ensures:

- Confidentiality
- Integrity
- Authentication

Without HTTPS:

Anyone on network can sniff traffic.

Example:

Public WiFi attacker reading passwords.

---

# Step 5 — HTTP Request

Browser sends request.

Example:

```http
GET /profile HTTP/1.1
Host: example.com
```

---

# Step 6 — Server Processing

Backend:

- Validates request
- Queries DB
- Applies logic
- Generates response

---

# Step 7 — HTTP Response

Example:

```http
HTTP/1.1 200 OK
Content-Type: text/html
```

---

# Step 8 — Browser Rendering

Browser renders:

- HTML
- CSS
- JS

Page displayed.

---

# Important Web Concepts

---

# 1. Every URL is an Address

Example:

```txt
https://amazon.com/products/1
```

Contains:

| Part | Meaning |
|---|---|
| https | Protocol |
| amazon.com | Domain |
| /products/1 | Path |

---

# 2. HTTP is Stateless

This is VERY important.

HTTP does NOT remember previous requests.

Every request is independent.

---

# Example

You login:

```http
POST /login
```

Then request dashboard:

```http
GET /dashboard
```

Server does NOT automatically remember you.

That is why sessions/cookies exist.

---

# Cookies and Sessions

---

# Session

Stored on SERVER.

Contains:

- User identity
- Login state
- Permissions

---

# Cookie

Stored on BROWSER.

Usually contains session ID.

Example:

```http
Cookie: session=abc123
```

---

# Login Flow Example

---

## Step 1 — User Logs In

```http
POST /login
username=alice
password=hunter2
```

---

## Step 2 — Server Creates Session

Server creates:

```txt
session_id = xyz789
```

Stores in DB/Redis.

---

## Step 3 — Server Sends Cookie

```http
Set-Cookie: session=xyz789
```

---

## Step 4 — Browser Auto-Sends Cookie

Every future request:

```http
Cookie: session=xyz789
```

Now server identifies user.

---

# VERY IMPORTANT SECURITY CONCEPT

## Session Hijacking

If attacker steals session cookie:

They become the user.

This is called:

- Session hijacking
- Session theft

---

# Cookie Security Flags

---

# 1. HttpOnly

JavaScript cannot read cookie.

Protects against:

- XSS stealing cookies

---

# 2. Secure

Cookie only sent over HTTPS.

Protects against:

- Network sniffing

---

# 3. SameSite

Protects against CSRF.

Values:

- Strict
- Lax
- None

---

# Why Headers Are EXTREMELY Important

This is one of the MOST important AppSec concepts.

Attackers heavily abuse:

- Headers
- Cookies
- Sessions
- Tokens

Because these control:

- Authentication
- Authorization
- Browser behavior
- Security policies

---

# HTTP Request Anatomy

Example:

```http
POST /login HTTP/1.1
Host: example.com
User-Agent: Chrome
Content-Type: application/json
Cookie: session=abc123
```

---

# Request Components

| Part | Purpose |
|---|---|
| Method | Action |
| Path | Resource |
| Headers | Metadata |
| Body | Actual data |

---

# IMPORTANT ATTACKER MINDSET

Every field is attacker-controlled.

NEVER trust:

- Headers
- Query params
- Body
- Cookies
- Filenames
- User-Agent

Everything can be modified.

---

# Example

Frontend sends:

```json
{
  "role": "user"
}
```

Attacker changes:

```json
{
  "role": "admin"
}
```

If backend trusts it blindly → privilege escalation.

---

# Common Dangerous Headers

---

# 1. Authorization Header

Example:

```http
Authorization: Bearer jwt_token
```

If stolen → account takeover.

---

# 2. Cookie Header

Contains sessions.

If stolen → session hijacking.

---

# 3. Host Header

Can cause:

- Host header injection
- Password reset poisoning

---

# 4. Origin / Referer

Used in CSRF protection.

---

# HTTP Response Anatomy

Example:

```http
HTTP/1.1 200 OK
Set-Cookie: session=abc
Content-Type: text/html
```

---

# Status Codes

---

# 2xx — Success

Examples:

- 200 OK
- 201 Created

---

# 3xx — Redirect

Examples:

- 301 Moved Permanently
- 302 Found

---

# 4xx — Client Error

Examples:

- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found

---

# 5xx — Server Error

Examples:

- 500 Internal Server Error
- 503 Service Unavailable

---

# Security Headers (VERY IMPORTANT)

These headers help protect applications.

---

# 1. Content-Security-Policy (CSP)

Protects against XSS.

Example:

```http
Content-Security-Policy: default-src 'self'
```

---

# 2. X-Frame-Options

Protects against clickjacking.

Example:

```http
X-Frame-Options: DENY
```

---

# 3. Strict-Transport-Security (HSTS)

Forces HTTPS.

---

# 4. X-Content-Type-Options

Prevents MIME confusion attacks.

---

# PART 2 — The Security Mindset

---

# Security Failures Are NOT Random

Most vulnerabilities happen because of bad assumptions.

---

# Common Wrong Assumptions

---

# 1. Trusting User Input

Wrong assumption:

> "Users only send what UI allows."

Reality:

Attackers use:
- Burp Suite
- Postman
- Curl

They bypass frontend completely.

---

# Example

Frontend:

```html
<input maxlength="10">
```

Attacker sends:

```txt
10000 characters
```

Backend must validate too.

---

# 2. Implicit Trust Between Services

Wrong assumption:

> "Internal services are safe."

Reality:

If attacker compromises one service:
- Lateral movement becomes possible.

---

# Example

Compromised microservice calling internal admin APIs.

---

# 3. Security by Obscurity

Wrong assumption:

> "Attackers won't find hidden routes."

Reality:

Attackers enumerate everything.

Tools:

- Burp Suite
- ffuf
- dirsearch

---

# Example

Hidden route:

```txt
/admin-secret-panel
```

Attackers WILL discover it.

---

# 4. Correct Code, Wrong Context

Code may be correct but deployment insecure.

Example:

- Debug mode enabled
- Public S3 bucket
- Missing HTTPS

---

# 5. Weak Defaults

Examples:

- admin/admin
- Default passwords
- Open permissions

---

# 6. One Layer of Defense

Never rely on one defense.

Because every defense can fail.

---

# Defense in Depth

Use multiple layers.

Example:

| Layer | Protection |
|---|---|
| WAF | Blocks obvious attacks |
| Input validation | Sanitizes data |
| Parameterized queries | Prevents SQLi |
| Least privilege DB | Limits damage |

---

# Thinking Like an Attacker

Core AppSec question:

> "What can an attacker do with this?"

---

# Example 1 — Login Form

Questions attacker asks:

- What if I use SQL payloads?
- What if I brute force passwords?
- What if I send huge payloads?

Possible vulnerabilities:

- SQL Injection
- Brute force

---

# Example 2 — URL Parameters

```txt
/user?id=42
```

Attacker changes:

```txt
/user?id=43
```

Possible issue:

- IDOR

---

# Example 3 — File Upload

Questions:

- Can I upload `.php`?
- Can filename contain `../../`?
- Can I upload malware?

Possible vulnerabilities:

- Remote Code Execution
- Path Traversal

---

# Example 4 — API Responses

Questions:

- Is hidden data still present?
- Does response leak other users' data?

Possible vulnerabilities:

- Information disclosure
- BOLA

---

# Core Security Principles

---

# 1. Least Privilege

Give minimum access needed.

---

## Bad

DB user has admin rights.

---

## Good

DB user only has:

```sql
SELECT users
```

---

# 2. Defense in Depth

Multiple independent layers.

Never trust one protection.

---

# 3. Fail-Safe Defaults

Default should be:

> DENY

NOT allow.

---

# Example

New API route should return:

```http
403 Forbidden
```

Until permissions explicitly added.

---

# 4. Attack Surface Minimization

Reduce exposed components.

Examples:

- Disable debug endpoints
- Remove unused APIs
- Close unused ports

---

# 5. Economy of Mechanism

Simple systems are safer.

Complexity creates bugs.

---

# Example

A 50-line auth system is easier to audit than a 5000-line one.

---

# Trust Boundaries

One of the MOST IMPORTANT concepts.

---

# What is a Trust Boundary?

A place where data moves from:

- Less trusted zone
→ More trusted zone

---

# Rule

ANY data crossing trust boundaries must be:

- Validated
- Sanitized
- Authorized
- Parameterized

---

# Zones

---

# 1. Untrusted Zone

Examples:

- Browser input
- Cookies
- URLs
- File uploads
- Third-party webhooks

Treat ALL as malicious.

---

# 2. Semi-Trusted Zone

Application layer.

Examples:

- Validated requests
- Authenticated users
- Internal services

Still NOT fully trusted.

---

# 3. Trusted Zone

Examples:

- Database
- Secret managers
- Internal admin systems

Must NEVER directly trust external data.

---

# VERY IMPORTANT REAL-WORLD RULE

Never trust:

- Client-side validation
- Hidden fields
- Cookies
- JWT claims blindly
- Frontend restrictions

Because attackers fully control the client.

---

# Golden Rule of AppSec

> Never trust input.
> Always validate.
> Always think like an attacker.
