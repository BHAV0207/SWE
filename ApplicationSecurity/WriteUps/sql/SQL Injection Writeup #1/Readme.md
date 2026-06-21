# SQL Injection in Product Category Filter Allowing Retrieval of Hidden Data

## Description

The application is vulnerable to SQL Injection in the product category filter parameter. User-supplied input is incorporated directly into a backend SQL query without proper validation or parameterization.

The application executes a query similar to:

```sql
SELECT * FROM products WHERE category = 'Gifts' AND released = 1;
```

By injecting SQL syntax into the category parameter, an attacker can modify the logic of the query and retrieve products that are not intended to be visible to users, including hidden or unreleased products.

---

## Steps to Exploit

1. Navigate to the product listing page.
2. Select any product category.
3. Intercept the request using Burp Suite.
4. Send the request to Burp Repeater.
5. Locate the `category` parameter.
6. Modify the parameter value to:

```sql
' OR 1=1--
```

7. Send the modified request.
8. Observe that products from all categories are returned, including hidden products.

---

## Proof of Concept

### Payload

```sql
' OR 1=1--
```

### Original Query

```sql
SELECT * FROM products
WHERE category = 'Gifts'
AND released = 1;
```

### Modified Query

```sql
SELECT * FROM products
WHERE category = ''
OR 1=1--'
AND released = 1;
```

The injected condition evaluates to true for all rows, causing the application to return all products regardless of category or release status.

---

## Screenshots

### Screenshot 1 - Burp Suite Request and Response

**Purpose:** Demonstrates successful SQL Injection exploitation.

**Take Screenshot When:**

* The modified request containing `' OR 1=1--` is visible in Burp Repeater.
* The response shows products from multiple categories.

**Insert Screenshot Below**

![Burp Request Response](WriteUps/sql/SQL Injection Writeup #1/images/request_response.png)

---

### Screenshot 2 - Lab Solved Confirmation

**Purpose:** Demonstrates successful completion of the PortSwigger lab.

**Take Screenshot When:**

* The page displays:
  `Congratulations, you solved the lab!`

**Insert Screenshot Below**

![Lab Solved](WriteUps/sql/SQL Injection Writeup #1/images/lab_solved.png)

---

## Impact

* Unauthorized access to hidden products.
* Exposure of unreleased or restricted information.
* Disclosure of business-sensitive data.
* Increased attack surface for further SQL Injection exploitation.
* Loss of confidentiality within the application.

---

## Mitigation / Remediation

1. Use parameterized queries (prepared statements) for all database interactions.
2. Validate and sanitize user-supplied input.
3. Implement server-side input validation.
4. Apply the principle of least privilege to database accounts.
5. Conduct regular security testing and code reviews.

---

## CVSS Score

**CVSS v3.1 Score:** 5.3 (Medium)

**Vector:**

```text
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N
```

---

## CVSS Justification

### Attack Vector

Network (N) – Exploitable remotely through HTTP requests.

### Attack Complexity

Low (L) – No special conditions are required.

### Privileges Required

None (N) – No authentication is required.

### User Interaction

None (N) – The attack can be performed directly.

### Scope

Unchanged (U) – Impact remains within the vulnerable application.

### Confidentiality Impact

Low (L) – Hidden product information can be disclosed.

### Integrity Impact

None (N) – No modification of data is performed.

### Availability Impact

None (N) – No denial of service or disruption occurs.
