# Stored XSS into HTML Context with Nothing Encoded

## Description

The application is vulnerable to Stored Cross-Site Scripting (Stored XSS) in the blog comment functionality. User-supplied input submitted through the comment form is stored on the server and later rendered within the HTML page without any sanitization, validation, or output encoding.

Because malicious JavaScript is permanently stored by the application, every user who visits the affected page will execute the attacker's payload in their browser.

Unlike Reflected XSS, Stored XSS does not require victims to click a specially crafted link. The payload executes automatically whenever the vulnerable page is viewed.

---

## Steps to Exploit

1. Navigate to any blog post.
2. Scroll to the comment section.
3. Enter the following payload into the comment field:

```html
<script>alert(1)</script>
```

4. Provide valid values for the remaining fields:

```text
Name: Bhavya
Email: test@test.com
Website: https://test.com
```

5. Submit the comment.
6. The application stores the comment in its backend database.
7. Reload the blog page.
8. The stored comment is rendered without output encoding.
9. The browser executes the injected JavaScript.
10. The lab is successfully solved.

---

## Proof of Concept

### Payload

```html
<script>alert(1)</script>
```

### Vulnerable Workflow

```text
User Input
    ↓
Stored in Database
    ↓
Displayed in Blog Comment
    ↓
JavaScript Executed
```

### Stored Response Example

```html
<div class="comment">
<script>alert(1)</script>
</div>
```

### Execution Result

```javascript
alert(1)
```

The browser interprets the stored payload as executable JavaScript because the application does not perform output encoding before rendering user-supplied content.

---

## Screenshots

### Screenshot 1 – Malicious Payload Submission

**Description:**

The attacker submits a blog comment containing a malicious JavaScript payload. The payload is accepted by the application and stored on the server.

![Payload Submission](images/payload_submission.png)

---

### Screenshot 2 – Lab Successfully Solved

**Description:**

After the stored payload executes when the page is viewed, the PortSwigger lab confirms successful exploitation of the Stored XSS vulnerability.

![Lab Solved](images/lab_solved.png)

---

## Impact

* Persistent execution of attacker-controlled JavaScript.
* Session hijacking through cookie theft.
* Credential theft and phishing attacks.
* Defacement of web pages.
* Unauthorized actions performed on behalf of victims.
* Potential compromise of administrator accounts.
* Large-scale impact affecting every visitor to the vulnerable page.

---

## Mitigation / Remediation

1. Apply contextual output encoding to all user-generated content.
2. Sanitize HTML before storing or rendering user input.
3. Implement server-side input validation.
4. Deploy a strong Content Security Policy (CSP).
5. Use secure templating frameworks with automatic escaping.
6. Review all locations where user content is rendered.
7. Perform regular security testing for XSS vulnerabilities.

---

## CVSS Score

**CVSS v3.1 Score:** 8.2 (High)

### Vector

```text
CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:H/I:L/A:N
```

---

## CVSS Justification

### Attack Vector

Network (N) – Exploitable remotely through web requests.

### Attack Complexity

Low (L) – No special conditions are required.

### Privileges Required

None (N) – Any user can submit the payload.

### User Interaction

Required (R) – A victim must view the affected page.

### Scope

Changed (C) – The attack affects users visiting the page.

### Confidentiality Impact

High (H) – Sensitive user information may be exposed.

### Integrity Impact

Low (L) – Page content can be modified by injected scripts.

### Availability Impact

None (N) – The attack does not impact service availability.

---

## References

* OWASP Cross Site Scripting Prevention Cheat Sheet
* OWASP XSS Filter Evasion Cheat Sheet
* PortSwigger Web Security Academy – Stored XSS into HTML Context with Nothing Encoded
