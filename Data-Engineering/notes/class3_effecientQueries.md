
# ⚡ Optimizations While Writing Efficient SQL Queries

---

## 🔑 Join Optimization & Keys (VERY IMPORTANT)

### Always join tables using **Primary Key ↔ Foreign Key**

When joining two tables:
- The **JOIN condition should ideally involve a PRIMARY KEY**
- This ensures:
  - Faster lookups
  - Less data scanned
  - Better use of indexes

---

## 🔹 Primary Key (PK)

- Uniquely identifies each row
- **Cannot be NULL**
- **Cannot be duplicated**

Example:
```sql
customer.customer_id  -- PRIMARY KEY
````

---

## 🔹 Foreign Key (FK)

* Refers to a **primary key in another table**
* Can:

  * Repeat
  * Be NULL
* Enforces **referential integrity**

Example:

```sql
customer_purchases.customer_id  -- FOREIGN KEY
```

📌 Rule:

> Every **foreign key must reference a primary key**
> But **not every primary key becomes a foreign key**

---

### ❓ Why can foreign keys be NULL but primary keys cannot?

* A **foreign key column** may contain:

  * A value not yet linked
  * Or no value (NULL)
* But a **primary key must always identify a row**

This is why:

* PK → always defined
* FK → optional in many schemas

---

## 🚀 Query Optimization Example (Your Case)

### ❌ Inefficient Query

```sql
SELECT c.customer_first_name,
       COUNT(cp.customer_id) AS total
FROM customer_purchases cp
INNER JOIN customer c
  ON c.customer_id = cp.customer_id
GROUP BY 1
HAVING total > 3;
```

### Why this is inefficient ❌

* Join happens **before aggregation**
* Large tables → large intermediate join
* Behaves closer to **N × M** operations
* More memory & CPU usage

---

## ✅ Optimized Approach (Filter First, Then Join)

### Step 1: Aggregate first

```sql
SELECT customer_id,
       COUNT(customer_id) AS total
FROM customer_purchases
GROUP BY customer_id
HAVING total > 3;
```

This reduces rows **early**.

---

### Step 2: Join only required customers

```sql
SELECT c.customer_first_name, a.total
FROM (
    SELECT customer_id,
           COUNT(customer_id) AS total
    FROM customer_purchases
    GROUP BY customer_id
    HAVING total > 3
) a
INNER JOIN customer c
  ON c.customer_id = a.customer_id;
```

📌 Optimization principle:

> **Filter early, join later**

---

## 🧠 Key Optimization Rule (INTERVIEW GOLD)

> Always **reduce data size before JOINs**

---

# 🔁 Subqueries & Correlated Subqueries (Clarified)

---

## ❌ Common Misunderstanding (Fixed, not removed)

> ❌ *“Correlated subqueries were introduced because normal subqueries scan 1 billion rows”*

### ✅ Correct Understanding

| Subquery Type       | How many times it runs |
| ------------------- | ---------------------- |
| Normal subquery     | Once                   |
| Correlated subquery | Once per outer row     |

📌 Correlated subqueries are **NOT faster by default**
They exist because **some logic requires row-by-row evaluation**

---

## 🔹 Normal (Non-Correlated) Subquery

```sql
SELECT customer_first_name
FROM customer
WHERE customer_id IN (
    SELECT customer_id
    FROM customer_purchases
);
```

### Execution Flow

1. Inner query runs once
2. Result stored temporarily
3. Outer query uses the result

✔️ Inner query **does not depend on outer query**

---

## 🔹 Why Correlated Subqueries Are Needed

Example question:

> “Find customers who have NOT made any purchase”

This requires:

* Checking **each customer individually**
* Verifying if a related row exists

This is **row-by-row logic**.

---

## 🔹 Correlated Subquery Definition

> A correlated subquery **depends on the outer query**
> It references columns from the outer query.

---

## 🔹 Your Correlated Subquery Example (Explained)

```sql
SELECT customer_first_name
FROM customer c
WHERE NOT EXISTS (
    SELECT 1
    FROM customer_purchases cp
    WHERE cp.customer_id = c.customer_id
);
```

---

## 🔁 How the Database Executes This

### Pseudocode

```text
FOR each row in customer:
    check customer_purchases
    if no matching row exists:
        include customer
```

---

### Sample Data

#### customer

| customer_id | name  |
| ----------- | ----- |
| 1           | Rahul |
| 2           | Neha  |
| 3           | Aman  |

#### customer_purchases

| purchase_id | customer_id |
| ----------- | ----------- |
| 101         | 1           |
| 102         | 3           |

---

### Row-by-row Execution

* Rahul → purchase exists → excluded
* Neha → no purchase → included
* Aman → purchase exists → excluded

### Final Output

```
Neha
```

---

## 🔹 Why `SELECT 1`?

```sql
SELECT 1
```

* `EXISTS` checks **only presence**
* Column values don’t matter
* `SELECT 1` is:

  * Faster
  * Cleaner
  * Best practice

---

## 🔹 EXISTS vs IN (VERY IMPORTANT)

### ❌ Problem with `IN`

```sql
WHERE customer_id NOT IN (SELECT customer_id FROM customer_purchases)
```

If subquery returns **NULL**, logic breaks.

---

### ✅ Why `EXISTS` is better

* Stops scanning after first match
* Handles NULL safely
* Optimizer-friendly

---

## ⚠️ Performance Truth (MUST REMEMBER)

| Type                | Execution     |
| ------------------- | ------------- |
| Normal Subquery     | Once          |
| Correlated Subquery | Per outer row |

📌 Use correlated subqueries **only when logic requires it**

---

# 📦 Indexing (CRITICAL FOR PERFORMANCE)

---

## 🔹 What is an Index?

* Data structure for **fast lookups**
* Reduces full table scans

---

## 🔹 When to Create Indexes

Create indexes on:

* Primary keys (automatic)
* Foreign keys
* JOIN columns
* WHERE / GROUP BY / ORDER BY columns

Example:

```sql
CREATE INDEX idx_customer_purchases_customer
ON customer_purchases(customer_id);
```

---

## 🔹 Indexing Rule

> Index columns used **frequently** in filters and joins
> Avoid indexing columns with very low cardinality

---

# 🧩 Partitioning (Large Data Optimization)

---

## 🔹 What is Partitioning?

Partitioning splits a large table into **smaller logical pieces**.

Example:

* Partition sales table by date
* Query only required partitions

---

## 🔹 Example: Range Partition

```sql
PARTITION BY RANGE (YEAR(order_date))
```

Benefits:

* Faster queries
* Less data scanned
* Better scalability

---

## 🧠 Final Optimization Mental Model

| Problem        | Solution          |
| -------------- | ----------------- |
| Large joins    | Aggregate first   |
| Presence check | EXISTS            |
| Absence check  | NOT EXISTS        |
| Frequent joins | Index             |
| Huge tables    | Partition         |
| Cleaner SQL    | Subqueries / CTEs |

---

## ⭐ Golden Rules (INTERVIEW READY)

* **Filter early, join late**
* **Indexes beat brute force**
* **EXISTS > IN**
* **Correlated subqueries are logical tools, not speed hacks**
* **Partition when data grows, not before**

---
