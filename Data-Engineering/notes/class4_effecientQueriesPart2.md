# 🔁 Subqueries vs CTE (Common Table Expressions)

---

## ❓ Can we use Subqueries in the SELECT clause?

✅ **YES**, subqueries **can be used in the SELECT clause**.

### Your use case:
You want to calculate **revenue contribution per product**, but:
- Total revenue is **not directly available**
- So you must compute it separately

---

### Step 1: Base aggregation (per product)

```sql
SELECT
  product_id,
  SUM(cost_to_customer_per_qty * quantity) AS product_revenue
FROM customer_purchases
GROUP BY 1;
````

---

### Step 2: Total revenue (separate query)

```sql
SELECT
  SUM(cost_to_customer_per_qty * quantity)
FROM customer_purchases;
```

---

### Step 3: Subquery inside SELECT (FINAL QUERY)

```sql
SELECT
  product_id,
  100 * (
    SUM(cost_to_customer_per_qty * quantity)
    /
    (SELECT SUM(cost_to_customer_per_qty * quantity)
     FROM customer_purchases)
  ) AS revenue_percentage
FROM customer_purchases
GROUP BY 1;
```

### ✅ What this proves

* Subqueries **can be used in SELECT**
* Useful when you need:

  * Row-level aggregation
  * Plus a global aggregate

📌 **This is a classic analytics use case**

---

## ❓ Can we use Subqueries in the WHERE clause?

✅ **YES**, subqueries are very common in `WHERE`.

---

### Example:

> Find all transactions where revenue exceeds the **overall average revenue**

---

### Step 1: Overall average revenue

```sql
SELECT AVG(revenue)
FROM customer_table;
```

---

### Step 2: Use it inside WHERE

```sql
SELECT transaction
FROM customer_table
WHERE revenue > (
  SELECT AVG(revenue)
  FROM customer_table
);
```

📌 Inner query runs first → outer query filters using the result.

---

## 🧠 Key Rule for Subqueries

| Location | Allowed? |
| -------- | -------- |
| SELECT   | ✅        |
| WHERE    | ✅        |
| FROM     | ✅        |
| HAVING   | ✅        |

---

# 📌 CTE (Common Table Expression)

---

## ❓ What is a CTE?

A **CTE** is a **temporary named result set** that exists **only for one query**.

👉 Think of it as:

> “A temporary table created just for readability & logic”

---

## Basic Syntax

```sql
WITH cte_name AS (
    SELECT ...
)
SELECT *
FROM cte_name;
```

---

## ❓ Why do we use CTE? (VERY IMPORTANT)

### Problems WITHOUT CTE ❌

* Long nested subqueries
* Poor readability
* Hard to debug
* Repeated logic

### Benefits of CTE ✅

* Cleaner SQL
* Step-by-step logic
* Easy debugging
* Reusability in the same query
* Required for **recursive queries**

---

## Subquery vs CTE (Mental Model)

| Feature           | Subquery | CTE |
| ----------------- | -------- | --- |
| Readability       | ❌        | ✅   |
| Debugging         | ❌        | ✅   |
| Reuse             | ❌        | ✅   |
| Recursive queries | ❌        | ✅   |

---

## Example: Employees earning more than company average

### ❌ Subquery version

```sql
SELECT name
FROM employees
WHERE salary > (
    SELECT AVG(salary)
    FROM employees
);
```

---

### ✅ CTE version (Cleaner)

```sql
WITH avg_salary AS (
    SELECT AVG(salary) AS avg_sal
    FROM employees
)
SELECT name
FROM employees
WHERE salary > (SELECT avg_sal FROM avg_salary);
```

📌 Logic becomes **explicit and readable**

---

## Example: Customers with total order value > 1000

```sql
WITH customer_total AS (
    SELECT customer_id, SUM(amount) AS total
    FROM orders
    GROUP BY customer_id
)
SELECT c.name, ct.total
FROM customers c
JOIN customer_total ct
ON c.customer_id = ct.customer_id
WHERE ct.total > 1000;
```

---

## Multiple CTEs in one query

```sql
WITH order_total AS (
    SELECT customer_id, SUM(amount) AS total
    FROM orders
    GROUP BY customer_id
),
high_value_customers AS (
    SELECT customer_id
    FROM order_total
    WHERE total > 1000
)
SELECT *
FROM customers
WHERE customer_id IN (
    SELECT customer_id FROM high_value_customers
);
```

---

## Recursive CTE (POWERFUL FEATURE)

Used for:

* Employee hierarchy
* Tree structures
* Graph traversal

```sql
WITH RECURSIVE emp_tree AS (
    SELECT emp_id, manager_id, name
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    SELECT e.emp_id, e.manager_id, e.name
    FROM employees e
    JOIN emp_tree et
    ON e.manager_id = et.emp_id
)
SELECT * FROM emp_tree;
```

---

## CTE vs Temporary Table

| CTE                  | Temporary Table    |
| -------------------- | ------------------ |
| Exists for one query | Exists for session |
| No storage           | Stored physically  |
| Best for logic       | Best for reuse     |

---

## Performance Truth ⚠️

* CTE ≠ always faster
* Mostly for **clarity**
* Some DBs materialize CTEs
* Always check execution plans

---

## 🎯 Interview One-Liner

> A CTE is a temporary named result set that improves query readability and enables recursive queries.

---

# 👁️ Views in SQL

---

## ❓ What is a View?

A **View** is a **stored SQL query** that behaves like a virtual table.

👉 Think of it as:

> “Saved SQL logic”

---

## Syntax

```sql
CREATE VIEW view_name AS
SELECT ...
```

---

## Why use Views?

* Reuse frequent queries
* Hide complex logic
* Improve consistency
* Security (limit column access)

---

## Example

```sql
CREATE VIEW high_value_customers AS
SELECT customer_id, SUM(amount) AS total
FROM orders
GROUP BY customer_id
HAVING total > 1000;
```

Usage:

```sql
SELECT * FROM high_value_customers;
```

---

## View vs CTE

| View                    | CTE               |
| ----------------------- | ----------------- |
| Stored permanently      | Temporary         |
| Reusable across queries | Single query      |
| Used by multiple users  | Used by one query |

---

# 🔀 Row-to-Row Operations in SQL

---

## ❓ Problem in SQL

SQL works **column-wise**, not row-wise.

So operations like:

* Compare current row with previous row
* Difference between rows

❌ Not possible directly.

---

## ✅ Solution: Window Functions (`LAG`, `LEAD`)

---

## 🔹 LAG()

Shifts values **downwards**.

Example column:

```
100, 110, 120
```

Using `LAG()`:

```
NULL, 100, 110
```

---

### Example: Previous quarter revenue

```sql
SELECT *,
       LAG(total, 1) OVER (ORDER BY qtr_no) AS prev_qtr_revenue
FROM table;
```

---

## 🔹 LEAD()

Shifts values **upwards**.

Example:

```
100, 110, 120
```

Using `LEAD()`:

```
110, 120, NULL
```

---

### Example: Next quarter revenue

```sql
SELECT *,
       LEAD(total, 1) OVER (ORDER BY qtr_no) AS next_qtr_revenue
FROM table;
```

---

## 🧠 Final Mental Models (MUST REMEMBER)

### Subquery

> One-off calculation inside another query

### CTE

> Named, readable, step-by-step logic

### View

> Saved SQL logic for reuse

### LAG / LEAD

> Enables row-to-row comparison

---

## ⭐ Golden Rules

* Use **subqueries** for small logic
* Use **CTEs** for clarity & recursion
* Use **views** for reuse
* Use **LAG / LEAD** for time-based analysis

---
