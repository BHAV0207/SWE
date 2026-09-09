# REST vs GraphQL — Interview Questions & Answers
---

# BASIC

## 1. What is REST?

### Answer

REST stands for **Representational State Transfer**.

It is an architectural style for designing APIs around **resources**, where HTTP methods are used to perform operations on those resources.

For example:

```http
GET    /users/123
POST   /users
PATCH  /users/123
DELETE /users/123
````

Here:

* `/users/123` represents a resource

### Example

```http
GET /users/123
```

Response:

```json
{
  "id": 123,
  "name": "Bhavya",
  "email": "bhavya@example.com"
}
```

### Interview point

REST is not a protocol or a library. It is an **architectural style** that uses HTTP very naturally.

### Remember

```text
REST = Resources + HTTP methods + HTTP semantics
```

---

# 2. What is GraphQL?

### Answer

GraphQL is a **query language for APIs and a runtime for executing those queries**.

Unlike REST, where the server exposes multiple endpoints with predefined response structures, GraphQL usually exposes a single endpoint and allows the client to specify exactly which fields it wants.

Example:

```graphql
query {
  user(id: 123) {
    name
    email
  }
}
```

Response:

```json
{
  "data": {
    "user": {
      "name": "Bhavya",
      "email": "bhavya@example.com"
    }
  }
}
```

### Key idea

The client controls the **shape of the response**.

### Interview point

GraphQL is not simply "REST with one endpoint."

It introduces:

* A schema
* Types
* Queries
* Mutations
* Resolvers
* A query execution model

---

# 3. How are REST and GraphQL different?

### Answer

The fundamental difference is **who controls the shape of the requested data**.

### REST

The server defines endpoints and generally determines the response shape.

```http
GET /users/123
```

```json
{
  "id": 123,
  "name": "Bhavya",
  "email": "...",
  "phone": "...",
  "address": "..."
}
```

### GraphQL

The client specifies the fields it needs.

```graphql
query {
  user(id: 123) {
    name
    email
  }
}
```

Response:

```json
{
  "data": {
    "user": {
      "name": "Bhavya",
      "email": "..."
    }
  }
}
```

### Comparison

| REST                          | GraphQL                                    |
| ----------------------------- | ------------------------------------------ |
| Resource-oriented             | Query-oriented                             |
| Multiple endpoints            | Usually one endpoint                       |
| Server defines response shape | Client selects response fields             |
| HTTP semantics are central    | GraphQL schema/query semantics are central |
| Easier HTTP caching           | Caching is more complicated                |
| Simpler                       | More flexible                              |

### Interview one-liner

> REST exposes resources through endpoints, while GraphQL exposes a schema that allows clients to request exactly the data they need.

---

# 4. What is over-fetching?

### Answer

**Over-fetching** happens when the server returns more data than the client actually needs.

Example:

The frontend only needs:

```text
name
profileImage
```

But REST returns:

```json
{
  "id": 123,
  "name": "Bhavya",
  "email": "...",
  "phone": "...",
  "address": "...",
  "age": 22,
  "profileImage": "..."
}
```

The client receives unnecessary data.

### GraphQL solution

The client can request:

```graphql
query {
  user(id: 123) {
    name
    profileImage
  }
}
```

Only those fields are returned.

### Why does it matter?

Over-fetching can:

* Increase bandwidth usage
* Increase response size
* Be especially problematic on mobile networks
* Increase serialization/deserialization work

### Remember

```text
Over-fetching = Getting MORE data than you need
```

---

# 5. What is under-fetching?

### Answer

**Under-fetching** happens when one API request doesn't provide enough data to build the required UI, so the client needs to make additional requests.

Suppose a page needs:

```text
User
+ Orders
+ Recommendations
```

REST might require:

```http
GET /users/123
GET /users/123/orders
GET /users/123/recommendations
```

That's multiple network requests.

### GraphQL

The client can potentially request everything together:

```graphql
query {
  user(id: 123) {
    name

    orders {
      id
      total
    }

    recommendations {
      id
      name
    }
  }
}
```

### Why does it matter?

Multiple requests can cause:

* Additional network round trips
* Higher latency
* More complicated frontend code
* More request orchestration

### Important

GraphQL doesn't magically make the backend do less work.

It can reduce **client-server round trips**, but the GraphQL server may perform many backend calls internally.

### Remember

```text
Under-fetching = Getting TOO LITTLE data → making more requests
```

---

# 6. What is a GraphQL schema?

### Answer

A GraphQL schema is the **strongly typed contract** that defines:

* What data exists
* What fields exist
* What types those fields have
* What queries are available
* What mutations are available

Example:

```graphql
type User {
  id: ID!
  name: String!
  email: String!
}

type Query {
  user(id: ID!): User
}
```

This tells the client:

```text
User
 ├── id
 ├── name
 └── email

Query
 └── user(id)
```

### Why is it useful?

The schema enables:

* Validation
* Autocomplete
* Documentation
* Type safety
* Better developer tooling

For example, if the client asks for:

```graphql
user {
  age
}
```

but `age` isn't in the schema, the query can be rejected during validation.

### Interview point

> The GraphQL schema is the contract between the client and the GraphQL server.

---

# 7. What are Queries, Mutations and Subscriptions?

GraphQL has three major operation types.

---

## Query

Used to **read data**.

```graphql
query {
  user(id: 123) {
    name
  }
}
```

Think:

```text
Query = READ
```

---

## Mutation

Used to **modify data**.

```graphql
mutation {
  createUser(name: "Bhavya") {
    id
    name
  }
}
```

Think:

```text
Mutation = WRITE
```

Examples:

```text
Create
Update
Delete
```

---

## Subscription

Used for **real-time updates**.

```graphql
subscription {
  messageCreated {
    id
    message
  }
}
```

The client can receive updates when an event occurs.

Example:

```text
User sends message
       ↓
Server event
       ↓
GraphQL subscription
       ↓
Connected clients receive update
```

### Remember

```text
Query        → Read
Mutation     → Write
Subscription → Real-time updates
```

---

# INTERMEDIATE

# 8. Why is GraphQL caching harder than REST?

### Answer

REST maps naturally to HTTP caching because resources usually have distinct URLs.

For example:

```http
GET /products/123
```

A cache can naturally use the URL as part of the cache key.

```text
/products/123
      ↓
Cache entry
```

GraphQL often uses:

```http
POST /graphql
```

But the request body can contain completely different queries.

For example:

```graphql
query {
  product(id: 123) {
    name
  }
}
```

and:

```graphql
query {
  product(id: 123) {
    name
    price
    reviews {
      rating
    }
  }
}
```

Both go to:

```text
POST /graphql
```

but they require different responses.

### Therefore

REST:

```text
URL → Resource → Cache
```

GraphQL:

```text
Endpoint
  +
Query
  +
Variables
  +
Context
  ↓
Cache key becomes more complicated
```

### Interview point

> REST's resource URLs and HTTP semantics make HTTP/CDN caching relatively straightforward, while GraphQL's flexible queries make cache keys and invalidation more complicated.

---

# 9. How does GraphQL solve over-fetching?

### Answer

GraphQL lets the client specify exactly which fields it wants.

REST:

```http
GET /users/123
```

might return:

```json
{
  "id": 123,
  "name": "Bhavya",
  "email": "...",
  "phone": "...",
  "address": "...",
  "age": 22
}
```

GraphQL:

```graphql
query {
  user(id: 123) {
    name
    email
  }
}
```

Response:

```json
{
  "data": {
    "user": {
      "name": "Bhavya",
      "email": "..."
    }
  }
}
```

Only requested fields are returned.

### Remember

```text
REST → Server decides response shape
GraphQL → Client selects fields
```

---

# 10. How does GraphQL solve under-fetching?

### Answer

GraphQL allows the client to request related data in a single logical query.

Suppose we need:

```text
User
 ├── Orders
 └── Recommendations
```

REST might require:

```http
GET /users/123
GET /users/123/orders
GET /users/123/recommendations
```

GraphQL:

```graphql
query {
  user(id: 123) {
    name

    orders {
      id
    }

    recommendations {
      id
      name
    }
  }
}
```

One request can return the entire required structure.

### Important nuance

> GraphQL reduces client-side round trips, but the GraphQL server may still make multiple calls to databases or microservices.

This distinction is important in backend interviews.

---

# 11. What is the N+1 problem?

### Answer

The N+1 problem happens when fetching a list of N objects causes one additional database/service request for each object.

Example:

```graphql
query {
  users {
    name
    orders {
      id
    }
  }
}
```

Suppose there are 100 users.

A naive resolver might do:

```text
Query users
    ↓
100 users

For every user:
    Query orders
```

Total:

```text
1 user query
+
100 order queries
=
101 queries
```

Hence:

```text
N + 1
```

### Why is this bad?

It causes:

* Excessive database queries
* Higher latency
* Increased database load
* Poor scalability

### Important

N+1 is not uniquely a GraphQL problem.

GraphQL makes it particularly easy to encounter because nested fields naturally map to nested resolvers.

---

# 12. How does DataLoader help?

### Answer

DataLoader-style batching collects multiple requests for the same field and combines them into one batch request.

Without batching:

```text
User 1 → DB
User 2 → DB
User 3 → DB
User 4 → DB
```

With batching:

```text
Users: [1,2,3,4]

        ↓

SELECT *
FROM orders
WHERE user_id IN (1,2,3,4)
```

Instead of:

```text
4 database queries
```

we can potentially have:

```text
1 database query
```

### DataLoader usually provides two important features

```text
Batching
+
Per-request caching
```

### Example

Instead of:

```text
getOrders(1)
getOrders(2)
getOrders(3)
```

DataLoader can batch them:

```text
getOrders([1,2,3])
```

### Interview answer

> DataLoader solves the N+1 problem by batching individual resolver requests into a single backend operation and often caching repeated loads within a request.

---

# 13. How does REST use HTTP status codes?

### Answer

REST APIs naturally use HTTP status codes to communicate the result of an operation.

Examples:

```text
200 OK
201 Created
204 No Content

400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
429 Too Many Requests

500 Internal Server Error
503 Service Unavailable
```

Example:

```http
GET /users/123

HTTP/1.1 404 Not Found
```

This clearly communicates that the requested resource wasn't found.

### Why is this useful?

HTTP-aware infrastructure such as:

* Browsers
* Proxies
* CDNs
* Monitoring systems
* Load balancers

can understand these semantics.

### Interview point

REST is strongly aligned with HTTP's existing semantics.

---

# 14. How does GraphQL handle errors?

### Answer

GraphQL has its own error model.

A GraphQL response can contain:

```json
{
  "data": null,
  "errors": [
    {
      "message": "User not found"
    }
  ]
}
```

Importantly, GraphQL can also return **partial data** along with errors.

For example:

```json
{
  "data": {
    "user": {
      "name": "Bhavya",
      "orders": null
    }
  },
  "errors": [
    {
      "message": "Unable to fetch orders"
    }
  ]
}
```

The user information succeeded, but orders failed.

### Important distinction

REST often communicates operation-level errors using HTTP status codes:

```text
404
500
403
```

GraphQL commonly separates:

```text
HTTP transport result
+
GraphQL execution errors
```

A GraphQL request can therefore have an HTTP `200` response while the response body contains an `errors` array.

### Interview point

Don't say:

> "GraphQL doesn't use HTTP status codes."

It still uses HTTP, but GraphQL defines its own application-level error semantics.

---

# 15. How do REST and GraphQL handle versioning?

## REST

REST APIs commonly use explicit versions:

```text
/api/v1/users
/api/v2/users
```

Example:

```text
v1:
GET /api/v1/users

v2:
GET /api/v2/users
```

Another approach is header/media-type based versioning.

---

## GraphQL

GraphQL generally prefers **schema evolution** rather than creating entirely separate API versions.

For example:

```graphql
type User {
  id: ID!
  name: String!
  username: String @deprecated
  handle: String
}
```

You can introduce:

```text
handle
```

and deprecate:

```text
username
```

while allowing existing clients to continue working.

### Why?

GraphQL clients explicitly request fields.

Therefore new fields can often be added without breaking clients.

### Important

GraphQL does NOT mean:

> "Versioning is unnecessary."

Breaking schema changes still need careful migration and compatibility management.

---

# ADVANCED

# 16. Why can a GraphQL query be expensive?

### Answer

GraphQL allows clients to request deeply nested and potentially expensive data.

Example:

```graphql
query {
  user {
    friends {
      friends {
        friends {
          friends {
            name
          }
        }
      }
    }
  }
}
```

One HTTP request can represent a huge amount of backend work.

Another example:

```graphql
users {
  orders {
    products {
      reviews {
        author {
          ...
        }
      }
    }
  }
}
```

This could cause:

```text
1 GraphQL request
        ↓
Many resolver executions
        ↓
Many database/service calls
```

### Important idea

```text
Number of HTTP requests ≠ Amount of backend work
```

A single GraphQL request can be extremely expensive.

---

# 17. How do you protect a GraphQL API from expensive queries?

### Answer

Several techniques can be used.

## 1. Query depth limiting

Limit how deeply nested a query can be.

For example:

```text
Maximum depth = 5
```

Reject:

```text
user → friends → friends → friends → friends → friends → ...
```

---

## 2. Query complexity analysis

Assign costs to fields.

Example:

```text
name       = 1
orders     = 5
recommendations = 10
```

Then:

```text
Query cost = 120
```

Reject queries above a threshold.

---

## 3. Pagination

Don't allow:

```graphql
users {
  ...
}
```

to return millions of records.

Instead:

```graphql
users(first: 20) {
  ...
}
```

---

## 4. Timeouts

Set time limits on expensive backend operations.

---

## 5. Rate limiting

Limit how frequently clients can execute operations.

---

## 6. Persisted/allowlisted queries

For trusted clients, allow only known queries.

### Interview answer

> I'd combine depth limits, query complexity limits, pagination, rate limiting, timeouts, and potentially persisted queries depending on the threat model.

---

# 18. How would you implement GraphQL caching?

### Answer

There isn't one universal approach.

I would consider multiple layers.

### 1. Client-side normalized cache

Store entities by identity:

```text
User:123
Product:456
Order:789
```

---

### 2. Resolver/application caching

Cache expensive backend operations.

For example:

```text
Product 123
    ↓
Redis
```

---

### 3. DataLoader caching

Use request-scoped caching to avoid resolving the same entity repeatedly during one GraphQL operation.

---

### 4. Persisted queries

Give known queries stable identifiers.

```text
query hash
    ↓
cached response
```

---

### 5. HTTP/CDN caching

Possible for suitable GraphQL queries, especially when using GET and carefully defining cache keys and request context.

### Important

GraphQL caching is difficult because the response depends on:

```text
Query
+
Variables
+
User/authorization context
+
Underlying data
```

### Interview point

> I would not blindly cache GraphQL responses globally because authorization and query shape can make a response user-specific.

---

# 19. When would you choose REST over GraphQL?

### Answer

I'd choose REST when:

* The API is relatively simple
* Resources map naturally to URLs
* HTTP caching/CDN caching is important
* Clients don't require highly variable response shapes
* I want simple operational behavior
* Conventional HTTP semantics are valuable

Example:

```text
Payment API
File API
Simple CRUD service
Public resource API
```

For example:

```http
GET /products/123
POST /orders
DELETE /cart/items/123
```

REST is often the simpler and more predictable solution.

### Interview one-liner

> I'd prefer REST when the domain maps naturally to resources and I value simplicity, HTTP semantics, and straightforward caching.

---

# 20. When would you choose GraphQL over REST?

### Answer

I'd consider GraphQL when:

* Multiple clients need different data
* Frontend requirements change frequently
* There are many relationships between entities
* Over-fetching is a significant problem
* Under-fetching causes many client requests
* Multiple backend services need to be aggregated

Example:

```text
Web
Mobile
Tablet
        ↓
    GraphQL
        ↓
 ┌──────┼──────┐
 ↓      ↓      ↓
Users Orders Products
```

Each client can request a different subset of the same schema.

### Interview one-liner

> I'd choose GraphQL when flexible client-driven data fetching or aggregation across multiple backend services provides enough value to justify the additional complexity.

---

# 21. How would GraphQL work as an API gateway/aggregation layer?

### Answer

GraphQL can sit between clients and multiple backend services.

Architecture:

```text
                 Client
                   ↓
                GraphQL
                   ↓
        ┌──────────┼──────────┐
        ↓          ↓          ↓
      Users      Orders     Products
      Service    Service     Service
```

Suppose the client asks:

```graphql
query {
  user(id: 123) {
    name

    orders {
      id
      total
    }

    recommendations {
      id
      name
    }
  }
}
```

Resolvers can call:

```text
User resolver
    ↓
User Service

Orders resolver
    ↓
Order Service

Recommendations resolver
    ↓
Recommendation Service
```

The GraphQL layer combines the results into one response.

### Benefit

The client doesn't need to know:

```text
Which service?
Which endpoint?
How do I combine the responses?
```

### Trade-off

The GraphQL layer becomes responsible for:

* Orchestration
* Performance
* Error handling
* Authorization
* Batching
* Timeouts
* Observability

---

# 22. What happens if one resolver calls another microservice?

### Answer

The resolver becomes responsible for fetching data from that service.

Example:

```graphql
user {
  orders {
    id
  }
}
```

Potential execution:

```text
GraphQL
   ↓
User resolver
   ↓
User Service

Orders resolver
   ↓
Order Service
```

If there are many users, naive resolvers can create:

```text
100 users
   ↓
100 order-service calls
```

This creates the N+1 problem.

### Better architecture

Use:

```text
Resolver
   ↓
DataLoader
   ↓
Batch request
   ↓
Order Service
```

Also consider:

* Timeouts
* Retries where appropriate
* Circuit breakers
* Caching
* Batching
* Partial failure handling

### Important interview insight

A GraphQL resolver isn't just a simple function returning data.

In production it can become a **distributed systems boundary**.

---

# 23. How would you monitor GraphQL performance?

### Answer

I'd monitor both the GraphQL layer and the underlying services.

Important metrics include:

```text
Request latency
Error rate
Requests per operation
Resolver latency
Database latency
Downstream service latency
Query complexity
Query depth
Cache hit rate
N+1 behavior
```

I'd also use distributed tracing.

Example:

```text
GraphQL request
      ↓
User resolver       20ms
      ↓
User Service        15ms

Orders resolver     500ms
      ↓
Order Service       480ms
```

Now I can identify that the orders resolver is the bottleneck.

### Important

Don't only monitor:

```text
POST /graphql → 200
```

because all GraphQL operations may share the same endpoint.

You should identify the **operation/query** being executed.

---

# 24. How would you rate-limit GraphQL?

### Answer

Simple request-count rate limiting can be insufficient.

With REST:

```text
100 requests/minute
```

is relatively easy to reason about.

With GraphQL:

```text
1 request
```

could be:

```text
query {
  user {
    orders {
      products {
        reviews {
          ...
        }
      }
    }
  }
}
```

which may be far more expensive.

So I'd combine:

```text
Request rate limiting
+
Query complexity limits
+
Depth limits
+
Pagination
```

For example:

```text
100 requests/minute
AND
maximum query complexity = 1000
AND
maximum depth = 8
```

### Advanced approach

Rate-limit based on **query cost** rather than simply request count.

---

# 25. How would you prevent deeply nested GraphQL queries?

### Answer

Use **query depth limiting**.

For example:

```text
Maximum depth = 5
```

Allowed:

```graphql
user {
  orders {
    products {
      name
    }
  }
}
```

Rejected:

```graphql
user {
  friends {
    friends {
      friends {
        friends {
          friends {
            ...
          }
        }
      }
    }
  }
}
```

You can also combine depth limiting with:

```text
Query complexity analysis
Pagination
Maximum result sizes
Timeouts
Rate limiting
```

### Why?

Because GraphQL lets clients control the query structure, so the server must protect itself from pathological queries.

---

# RAPID-FIRE REVISION

## REST

```text
What?
→ Architectural style for resource-oriented APIs

How?
→ URLs + HTTP methods + HTTP semantics

Strength?
→ Simplicity + HTTP caching + predictable operations

Weakness?
→ Over-fetching + under-fetching
```

---

## GraphQL

```text
What?
→ Query language + runtime for APIs

How?
→ Schema + queries + mutations + resolvers

Strength?
→ Client-controlled data selection

Weakness?
→ Complexity + caching + N+1 + expensive queries
```

---

# The 10 Things I Would Memorize

## 1.

```text
REST = Resource-oriented
GraphQL = Query-oriented
```

## 2.

```text
REST → Server generally defines response shape
GraphQL → Client defines requested fields
```

## 3.

```text
Over-fetching
= Too much data
```

## 4.

```text
Under-fetching
= Too little data → multiple requests
```

## 5.

```text
GraphQL schema
= Strongly typed API contract
```

## 6.

```text
Query → Read
Mutation → Write
Subscription → Real-time
```

## 7.

```text
N+1
= 1 query for parent list
+ N queries for children
```

## 8.

```text
DataLoader
= Batching + request-scoped caching
```

## 9.

```text
REST
→ Easier HTTP/CDN caching

GraphQL
→ More complicated caching
```

## 10.

```text
GraphQL security/performance
→ Depth limits
→ Complexity limits
→ Pagination
→ Rate limiting
→ Timeouts
```

---

# The Ultimate Interview Comparison

| Question       | REST                               | GraphQL                                        |
| -------------- | ---------------------------------- | ---------------------------------------------- |
| Basic model    | Resources                          | Schema + queries                               |
| Endpoints      | Multiple                           | Usually one                                    |
| Response shape | Server-defined                     | Client-selected                                |
| Over-fetching  | More likely                        | Less likely                                    |
| Under-fetching | More likely                        | Less likely                                    |
| HTTP semantics | Strong                             | Still used, but GraphQL adds its own semantics |
| Caching        | Easier                             | Harder                                         |
| Schema         | Usually external/API documentation | Built into GraphQL                             |
| Versioning     | Often `/v1`, `/v2` etc.            | Schema evolution/deprecation                   |
| Real-time      | Usually separate mechanisms        | Subscriptions                                  |
| Complexity     | Lower                              | Higher                                         |
| N+1 risk       | Exists                             | Especially important with nested resolvers     |
| Query control  | Server controls endpoint shape     | Client controls query shape                    |
| Best for       | Simple/resource-oriented APIs      | Complex/flexible data requirements             |

---

# Final Interview Framework

Whenever the interviewer asks:

> "Why would you choose REST or GraphQL?"

Don't immediately say one is better.

Think:

```text
                    API DESIGN
                       |
             What does the client need?
                       |
          ┌────────────┴────────────┐
          ↓                         ↓
   Predictable resources       Highly variable data
          ↓                         ↓
        REST                    GraphQL
          |                         |
          ↓                         ↓
    Simple + HTTP              Flexible queries
    + caching                  + aggregation
          |                         |
          ↓                         ↓
       Trade-off                 Trade-off
          |                         |
          ↓                         ↓
   Less flexibility             More complexity
                               + caching
                               + N+1
                               + query abuse
```

### The answer that sounds experienced

> "I wouldn't choose GraphQL simply because it reduces the number of HTTP requests, because one GraphQL request can still fan out into many backend calls. I'd choose based on the data access pattern. If resources map naturally to endpoints and HTTP caching and simplicity are important, REST is usually a great choice. If clients have significantly different data requirements or I need to aggregate data from multiple services, GraphQL can be valuable, provided I address query complexity, N+1 problems, authorization, caching, and observability."

That distinction is what separates a **memorized REST-vs-GraphQL answer** from an actual backend understanding.

```

**How I’d use these notes:** don't try to memorize all 25 answers word-for-word. Read each question, **hide the answer, answer it yourself out loud**, then compare your answer against the notes. The questions around **N+1, DataLoader, caching, query complexity, and GraphQL as an aggregation layer** are especially worth being able to explain on a whiteboard.
```
