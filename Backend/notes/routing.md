# Routing in HTTP APIs

Routing determines **where** a request should go on the server.

HTTP methods tell us **what action** we want to perform, while routes/endpoints tell us **on which resource** we want to perform that action.

Example:

```http
GET /api/books
```

Here:

- `GET` → action/method
- `/api/books` → route/endpoint/resource

Meaning:

→ Fetch books from the server.

---

# Understanding Routes

A route is basically a URL path mapped to a backend handler/controller/function.

Example in Express.js:

```js
app.get("/api/books", (req, res) => {
  res.send("Books fetched");
});
```

---

# Dynamic Routing with Path Parameters

Path parameters are dynamic values passed inside the route itself.

Example:

```http
GET /api/books/123
```

Here:

- `123` is the path parameter
- Usually represents an ID or unique identifier

Meaning:

→ Fetch the book whose ID is `123`.

---

# Common Use Cases of Path Parameters

Examples:

```http
GET /users/45
GET /products/999
GET /orders/abc123
```

Used for:

- User IDs
- Product IDs
- Order IDs
- Resource identifiers

---

# Accessing Path Parameters

Example in Express.js:

```js
app.get("/api/books/:id", (req, res) => {
  console.log(req.params.id);
});
```

For request:

```http
GET /api/books/123
```

Value:

```js
req.params.id === "123"
```

---

# Query Parameters

Query parameters are optional key-value pairs appended to the URL.

Example:

```http
GET /api/search?query=harry+potter
```

Here:

- `query` is the parameter name
- `harry potter` is the value

---

# Structure of Query Parameters

Format:

```text
?key=value
```

Multiple query parameters:

```http
GET /products?category=electronics&sort=price
```

---

# Use Cases of Query Parameters

Used for:

- Searching
- Filtering
- Sorting
- Pagination

Examples:

```http
GET /products?page=2
GET /users?role=admin
GET /books?author=rowling
```

---

# Accessing Query Parameters

Example in Express.js:

```js
app.get("/search", (req, res) => {
  console.log(req.query.query);
});
```

For request:

```http
GET /search?query=nodejs
```

Value:

```js
req.query.query === "nodejs"
```

---

# Difference Between Path Params and Query Params

| Path Parameter | Query Parameter |
|---|---|
| Required usually | Optional usually |
| Identifies specific resource | Used for filtering/searching |
| Part of route path | Appended after `?` |
| Example: `/users/12` | Example: `/users?page=2` |

---

# Nested Routes

Nested routes represent relationships between resources.

Example:

```http
GET /api/users/123/books/425
```

Meaning:

→ Fetch book `425` belonging to user `123`.

---

# Why Nested Routes are Used

They help represent hierarchy and ownership.

Examples:

```http
/users/10/orders/55
/companies/1/employees/200
/posts/45/comments/9
```

---

# Route Versioning

Route versioning helps maintain backward compatibility when APIs evolve.

Instead of breaking old clients, we create newer API versions.

---

# Example

## Version 1

```http
GET /api/v1/users
```

## Version 2

```http
GET /api/v2/users
```

---

# Why Route Versioning is Important

Suppose:

- Mobile app is using old API
- Backend changes response structure

Without versioning:

→ Old app may break.

With versioning:

- Old clients continue using `v1`
- New clients use `v2`

---

# Common API Versioning Strategies

## 1. URL Versioning (Most Common)

```http
/api/v1/users
```

---

## 2. Header Versioning

```http
Accept: application/vnd.myapi.v2+json
```

---

## 3. Query Parameter Versioning

```http
/api/users?version=2
```

Less commonly used.

---

# RESTful Routing Best Practices

# Use Nouns, Not Verbs

✅ Good:

```http
GET /users
POST /orders
```

❌ Bad:

```http
/getUsers
/createOrder
```

HTTP methods already describe the action.

---

# Use Proper Resource Naming

✅ Good:

```http
/users
/products
/orders
```

Prefer plural nouns.

---

# Use Hierarchical Routes Carefully

Good:

```http
/users/1/orders
```

Avoid excessive nesting:

```http
/users/1/orders/2/items/3/details/4
```

Too much nesting reduces readability.

---

# Quick Revision Summary

| Concept | Example | Purpose |
|---|---|---|
| Basic Route | `/api/books` | Resource access |
| Path Parameter | `/books/123` | Identify specific resource |
| Query Parameter | `?page=2` | Filtering/searching |
| Nested Route | `/users/1/books/2` | Resource relationship |
| Versioning | `/api/v1/users` | Backward compatibility |
