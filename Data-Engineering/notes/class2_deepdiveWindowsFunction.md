
````md
# 🪟 Window Functions in SQL (Complete & Enhanced Notes)

---

## ❓ Why do we even use Window Functions?

Window Functions are used when:
- We need to **perform calculations**
- **AND** we also need to **retain the original table rows**

👉 This is **not possible with normal aggregate functions**.

### ❌ Problem with Aggregate Functions

Example:
```sql
SELECT SUM(quantity) FROM customer_purchase;
````

* This gives **only one row**
* You **lose the original table**
* You cannot see row-level details anymore

---

## ✅ Why Window Functions Help

Window functions:

* Perform **aggregations**
* While **keeping all original rows**
* Add results as **new columns**

📌 **Rule to remember**

> Whenever you need **calculation + full table**, it’s a **window function use case**

---

## 🧩 Window Function Syntax

```sql
function() OVER (
  PARTITION BY ...
  ORDER BY ...
)
```

### 👉 FOPO (easy to remember)

* **F** → Function
* **O** → Over
* **P** → Partition By
* **O** → Order By

---

## 🔹 Basic Window Function Example (FO)

### Case: Total aggregate + complete table

```sql
SELECT *,
       SUM(quantity) OVER() AS total_quantity
FROM customer_purchase;
```

### Explanation

Suppose:

* 3 customers
* Customer 1 & 2 bought **2 products each**
* Customer 3 bought **1 product with quantity = 5**

Total quantity = **25**

📌 Output:

* Entire table remains
* New column `total_quantity`
* Value **25 appears in every row**

---

## 🔹 Aggregate Per Group + Complete Table (FOP)

### Case: Total per customer + full table

```sql
SELECT *,
       SUM(quantity) OVER(PARTITION BY customer_id) AS customer_total
FROM customer_purchase;
```

### Explanation

* Customer 1 → total = 10
* Customer 2 → total = 10
* Customer 3 → total = 5

📌 Output:

* Full table preserved
* Each row shows **customer-wise total**

---

## ❗ Important Rule: No GROUP BY Needed

When using window functions:

* ❌ `GROUP BY` is **not required**
* Window functions already handle grouping internally

---

## 🔹 Running Totals (FOO)

### Case: Running Total by Date

```sql
SELECT *,
       SUM(total) OVER(ORDER BY market_date) AS running_total
FROM sales;
```

### Explanation

* `ORDER BY` sorts rows by date
* `SUM` accumulates values progressively
* Produces a **cumulative total**

---

## 🔹 Daily Moving Average (DMA)

```sql
SELECT *,
       AVG(price) OVER(ORDER BY date) AS daily_moving_avg
FROM prices;
```

📌 Used heavily in:

* Finance
* Stock analysis
* Time-series analytics

---

## 🪟 Frames in Window Functions

Frames define **which rows are included in the calculation**.

### Syntax

```sql
ROWS BETWEEN <start> AND <end>
```

---

### 🔹 Example 1: Current row + previous row

```sql
SELECT *,
       SUM(total) OVER(
         ORDER BY date
         ROWS BETWEEN 1 PRECEDING AND CURRENT ROW
       ) AS running_total
FROM sales;
```

📌 Includes:

* Current row
* Immediate previous row

---

### 🔹 Example 2: Current row + all future rows

```sql
SELECT *,
       SUM(total) OVER(
         ORDER BY date
         ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING
       ) AS future_total
FROM sales;
```

📌 Includes:

* Current row
* All rows after it

---

### 🔹 Common Frame Keywords

| Keyword             | Meaning        |
| ------------------- | -------------- |
| CURRENT ROW         | Current row    |
| 1 PRECEDING         | One row before |
| UNBOUNDED PRECEDING | From first row |
| UNBOUNDED FOLLOWING | Till last row  |

---

## 🏆 Rank Functions

Suppose student scores are:

| Student | Marks |
| ------- | ----- |
| A       | 90    |
| B       | 80    |
| C       | 80    |
| D       | 70    |

---

### 🔹 RANK()

```text
A → 1
B → 2
C → 2
D → 4
```

📌 **Skips numbers**

---

### 🔹 DENSE_RANK()

```text
A → 1
B → 2
C → 2
D → 3
```

📌 **No gaps**

---

### 🔹 ROW_NUMBER()

```text
A → 1
B → 2
C → 3
D → 4
```

📌 **Always unique**

---

### 🔹 Rank Functions Query Example

```sql
SELECT *,
       DENSE_RANK() OVER(ORDER BY quantity DESC) AS drk,
       RANK() OVER(ORDER BY quantity DESC) AS rk,
       ROW_NUMBER() OVER(ORDER BY quantity DESC) AS r_no
FROM table;
```

---

## ❗ Why WHERE Clause Does Not Work Here

You **cannot use WHERE** on:

* `drk`
* `rk`
* `r_no`

Because:

* These columns are created **after SELECT**
* They don’t exist in the base table

---

## 🔹 Solution 1: Subquery

```sql
SELECT *
FROM (
  SELECT *,
         DENSE_RANK() OVER(ORDER BY quantity DESC) AS drk,
         RANK() OVER(ORDER BY quantity DESC) AS rk,
         ROW_NUMBER() OVER(ORDER BY quantity DESC) AS r_no
  FROM table
) a
WHERE drk = 1;
```

📌 Used to fetch **top records**

---

## 🔹 Solution 2: CTE (Cleaner & Better)

### CTE = Common Table Expression

Preferred for readability and interviews.

```sql
WITH ranked_data AS (
  SELECT *,
         DENSE_RANK() OVER(ORDER BY quantity DESC) AS drk
  FROM table
)
SELECT *
FROM ranked_data
WHERE drk = 1;
```

---

## 🧠 Final Mental Model (VERY IMPORTANT)

| Requirement            | Use               |
| ---------------------- | ----------------- |
| Aggregate only         | GROUP BY          |
| Aggregate + full table | Window Function   |
| Running total          | Window + ORDER BY |
| Per-group analytics    | PARTITION BY      |
| Top-N queries          | RANK / DENSE_RANK |
| Clean complex logic    | CTE               |

---

## ⭐ One-line Golden Rule

> **If you need calculations without losing rows → use Window Functions**

```
```
