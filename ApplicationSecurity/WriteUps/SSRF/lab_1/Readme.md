# Basic SSRF Against the Local Server

## Lab Information

* **Category:** Server-Side Request Forgery (SSRF)
* **Lab Name:** Basic SSRF Against the Local Server
* **Difficulty:** Apprentice
* **Status:** Solved

---

## Objective

The application contains a stock-check functionality that fetches data from an internal system using a user-controlled URL.

The goal is to exploit the SSRF vulnerability to access the internal administration panel and delete the user **carlos**.

---

## Vulnerability Overview

Server-Side Request Forgery (SSRF) occurs when an application fetches a remote resource based on user-supplied input without proper validation.

An attacker can abuse SSRF to:

* Access internal services
* Reach localhost-only applications
* Interact with cloud metadata endpoints
* Bypass network restrictions
* Perform lateral movement inside internal networks

In this lab, the stock-check functionality allows arbitrary URLs to be supplied through the `stockApi` parameter.

---

## Exploitation Steps

### Step 1 - Intercept Stock Check Request

1. Open any product page.
2. Click **Check Stock**.
3. Intercept the request in Burp Suite.
4. Send the request to Repeater.

Example vulnerable parameter:

```http
stockApi=http://stock.weliketoshop.net:8080/product/stock/check?productId=1&storeId=1
```

### Screenshot

![Original Stock Request](images/original_stock_request.png)

---

### Step 2 - Access Internal Admin Panel

Modify the `stockApi` parameter to point to the localhost administration interface:

```http
stockApi=http://localhost/admin
```

Send the request.

The response reveals the internal administration panel and contains a link used to delete users.

Example:

```html
/admin/delete?username=carlos
```

### Screenshot

![Admin Panel Access](images/admin_panel_discovered.png)

---

### Step 3 - Delete User Carlos

Modify the request again:

```http
stockApi=http://localhost/admin/delete?username=carlos
```

Send the request.

The application performs the request on behalf of the server and deletes the target user.

### Screenshot

![Delete Carlos Request](images/delete_user_request.png)

---

### Step 4 - Lab Solved

After deleting the target user, the lab is automatically marked as solved.

### Screenshot

![Lab Solved](images/lab_solved.png)

---

## Impact

Successful exploitation of SSRF vulnerabilities can allow attackers to:

* Access internal administration interfaces
* Interact with services running on localhost
* Bypass firewall restrictions
* Access cloud metadata services
* Extract sensitive information
* Perform privilege escalation

In real-world environments, SSRF vulnerabilities frequently lead to full infrastructure compromise.

---

## Remediation

To prevent SSRF vulnerabilities:

1. Implement strict allowlists for outbound requests.
2. Block access to localhost and private IP ranges.
3. Restrict access to internal services.
4. Validate and sanitize user-supplied URLs.
5. Use network segmentation.
6. Disable unnecessary outbound connections.

---

## Conclusion

The stock-check functionality trusted user-controlled URLs without validation. By modifying the `stockApi` parameter, it was possible to force the application to access an internal administration panel and execute privileged actions, resulting in successful exploitation of the SSRF vulnerability.
