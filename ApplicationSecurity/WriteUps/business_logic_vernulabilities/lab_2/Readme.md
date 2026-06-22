# Lab: High-level Logic Vulnerability

## Overview

This lab demonstrates a **Business Logic Vulnerability** caused by improper validation of user-controlled input. The application allows users to modify product quantities in their shopping cart, including negative values. By exploiting this flaw, an attacker can manipulate the cart total and purchase expensive items for an unintended price.

## Objective

Purchase the **Lightweight l33t leather jacket** despite having insufficient store credit.

---

## Vulnerability

The application trusts the client-supplied `quantity` parameter and does not properly validate negative values.

An attacker can:

1. Add a cheap item to the cart.
2. Modify the quantity to a negative value.
3. Force the cart total into a negative amount.
4. Add an expensive item.
5. Offset its cost using the negative balance.
6. Complete the purchase using available credit.

---

## Steps to Reproduce

### 1. Login

Login using the provided credentials:

```text
Username: wiener
Password: peter
```

**Screenshot:** `images/login_success.png`

---

### 2. Add a Cheap Item

Add the cheapest available product to the cart.

**Screenshot:** `images/cheap_item_added.png`

---

### 3. Intercept the Quantity Request

Enable Burp Suite interception and add another unit of the cheap item.

Observe the request:

```http
POST /cart
```

Example parameter:

```http
productId=2&quantity=1
```

**Screenshot:** `images/original_quantity_request.png`

---

### 4. Modify Quantity to a Negative Value

Send the request to Repeater and change the quantity parameter:

```http
quantity=-10
```

or another suitable negative value.

The application accepts the negative quantity and updates the cart.

---

### 5. Force a Negative Cart Total

Repeat the process until the cart contains a negative quantity and a negative total price.

Example:

```text
Quantity: -99
Total: -$X.XX
```

This effectively creates store credit.

**Screenshot:** `images/negative_cart_total.png`

---

### 6. Add the Leather Jacket

Add the target product:

```text
Lightweight l33t leather jacket
```

The negative cart balance offsets the jacket price.

**Screenshot:** `images/jacket_added.png`

---

### 7. Complete the Purchase

Proceed to checkout and place the order.

The manipulated cart total allows the purchase to succeed.

**Screenshot:** `images/lab_solved.png`

---

## Impact

This vulnerability can allow attackers to:

- Purchase products below intended prices
- Generate unauthorized credit
- Bypass business rules
- Cause financial loss to the organization
- Manipulate transactional workflows

---

## Root Cause

The application fails to validate business constraints on user-supplied quantities.

Specifically:

- Negative quantities are accepted.
- Cart totals are calculated directly from manipulated values.
- No server-side enforcement ensures quantities remain positive.

---

## Remediation

1. Validate quantities on the server side.
2. Reject negative values.
3. Enforce minimum quantity constraints.
4. Recalculate pricing independently on the server.
5. Apply business-rule validation before checkout.
6. Perform integrity checks on cart contents.

---

## Key Learning

Business Logic Vulnerabilities often occur when applications trust user-controlled data and fail to enforce expected business rules. In this lab, accepting negative quantities allowed manipulation of pricing calculations and enabled unauthorized purchases.