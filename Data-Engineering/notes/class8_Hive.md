---
# Advanced Features of Hive & Hive Architecture (08)
---

# 1️⃣ Why Do We Need Hive?

Let’s take an example:

Amazon has **300 million records** of financial data.

Who analyzes this data?

- Data Analysts
- Product Analysts
- Business Teams (Non-technical users)

These people:

- Do NOT know Java
- Do NOT write MapReduce code
- Only know SQL
- now we know that the above people are not the tech guys , so they will approach the software developeer , they will have to write long long codes and then give the data ti the above for analysis , whihc is a very tedious task

So how do they analyze data stored in Hadoop?

**Solution: Hive**

---

# 2️⃣ What is Hive?

> Hive is NOT a database.

Hive is:

- A **SQL engine**
- A **data warehouse system built on top of Hadoop**
- A tool that converts **SQL (HQL)** into the MR(map reduce) code that hadoop can understand like:
  - MapReduce
  - Tez
  - Spark jobs

---

## 🔹 Main Purpose of Hive

> Convert SQL queries into execution plans that Hadoop ecosystem understands.

Hive only:

- Accepts SQL-like queries (HQL)
- Translates them into execution engine code

---

# 3️⃣ Where Does Hive Fit in Data Architecture?

We already know:

```
Data Sources → Data Lake → ETL → Data Warehouse → BI Layer
```

Now suppose:

- Data is stored in **HDFS (Data Lake)**
- Financial data is raw

We use Hive to:

1. Read data from HDFS
2. Apply SQL transformations
3. Store processed data back into HDFS

---

# 4️⃣ ELT vs ETL in Hive

When dealing with **large-scale data processing**, there are two common data processing approaches:

1. **ETL (Extract → Transform → Load)**
2. **ELT (Extract → Load → Transform)**

These represent **two different strategies for moving and processing data in data pipelines**.

---

# 1️⃣ Traditional Data Processing: ETL

ETL stands for:

```

Extract → Transform → Load

```

This approach was used in **traditional data warehouses** such as:

- Oracle
- Teradata
- SQL Server
- On-premise BI systems

---

## Step 1: Extract

Data is collected from different sources.

Example sources:

- Databases
- APIs
- Log files
- CSV files
- Application servers

Example:

```

Sales data from MySQL
User logs from web servers
Inventory data from ERP system

```

---

## Step 2: Transform

Before storing the data, it is **cleaned and transformed**.

Typical transformations include:

- Removing duplicates
- Filtering unwanted data
- Data type conversions
- Aggregations
- Joining multiple datasets

Example transformation:

Raw data:

```

order_id, product_id, price
1,p1,100
2,p2,NULL
3,p3,150

```

After cleaning:

```

order_id, product_id, price
1,p1,100
3,p3,150

```

Here we removed rows with **missing values**.

---

## Step 3: Load

After transformation is complete, the cleaned data is loaded into the **data warehouse**.

Example destination:

```

Data Warehouse → PostgreSQL / Oracle / Snowflake

```

Now analytics queries can run on this **processed data**.

---

## ETL Pipeline Example

```

Source Systems
↓
Extract Data
↓
Transform Data
↓
Load into Data Warehouse

```

Example pipeline:

```

MySQL → Python Scripts → Clean Data → Data Warehouse

```

---

## Problems with ETL for Big Data

When data became **very large (TB / PB scale)**, ETL started facing problems.

### 1️⃣ Transformation becomes slow

All transformation happens **before loading**, which requires:

- Large compute resources
- Complex pipelines

---

### 2️⃣ Storage limitations

Traditional data warehouses had **limited storage capacity**.

---

### 3️⃣ In ETL, Transformation Happens Before Loading

ETL pipeline:

Extract → Transform → Load

Example:

MySQL Database → Python Script → Clean Data → Data Warehouse
What happens here?

Data is extracted from sources.

Transformation happens outside the data warehouse.

A limited compute system processes the data.

Example transformation system:

One server

16 CPU cores

64GB RAM

If dataset is:

10 TB

Then the transformation is done by one machine.

So processing might take:

10–12 hours

because parallelism is limited.


# 2️⃣ Modern Big Data Approach: ELT

With systems like:

- Hadoop
- Hive
- Spark
- BigQuery
- Snowflake

A new strategy emerged:

```

Extract → Load → Transform

```

This is called **ELT**.

---

# Step 1: Extract

Data is collected from multiple sources just like ETL.

Example sources:

```

Application logs
User events
Transaction databases
Streaming data
IoT sensors

```

---

# Step 2: Load (Raw Data First)

Instead of transforming data first, we **load raw data directly into the data lake**.

Example destination:

```

HDFS
Amazon S3
Google Cloud Storage

```

Raw data is stored **as-is**.

Example raw file:

```

orders_2026_01_01.csv

```

Stored in HDFS:

```

/data/orders/2026/01/01/

```

---

# Step 3: Transform Using Hive

Once data is inside the data lake, we run **transformations using Hive queries**.

Example Hive query:

```sql
SELECT product_id, SUM(price)
FROM orders
GROUP BY product_id;
```

Hive converts this query into **MapReduce or Spark jobs**.

The transformation now happens **inside the cluster**, not before loading.

---

# In ELT, Transformation Happens Inside the Big Data System

ELT pipeline:

Extract → Load → Transform

Example:

Logs → HDFS → Hive Query → Output

Now the transformation happens inside the cluster.

Example cluster:

100 machines
Each machine → 16 cores

Total computing power:

1600 CPU cores

Now when Hive runs a query:

SELECT product_id, COUNT(*)
FROM orders
GROUP BY product_id;

Hive converts it into MapReduce tasks that run across all machines.

So instead of one machine processing data, you get:

100 machines processing data in parallel

# ELT Pipeline Example

```
Source Systems
      ↓
Extract
      ↓
Load Raw Data into HDFS
      ↓
Transform using Hive SQL
      ↓
Analytics / BI
```

Example pipeline:

```
Application Logs → HDFS → Hive Queries → Reports
```

---

# Example: ETL vs ELT

## ETL Example

Suppose we want to analyze **sales by product**.

Pipeline:

```
Database → Python Script → Clean Data → Data Warehouse
```

Steps:

1. Extract sales data
2. Clean data using scripts
3. Load processed data into warehouse

---

## ELT Example Using Hive

Pipeline:

```
Database → HDFS → Hive Query → Results
```

Steps:

1. Extract raw sales data
2. Load raw files into HDFS
3. Run Hive queries for transformation

Example Hive query:

```sql
SELECT product_id, COUNT(order_id)
FROM orders
GROUP BY product_id;
```

---

# Why Hive Uses ELT Instead of ETL

Hive works on **massive datasets stored in HDFS**.

Therefore:

✔ Raw data is stored first
✔ Transformation happens later
✔ Cluster handles computation

Advantages:

- Faster processing
- Scalable to petabytes
- Parallel processing
- No need to clean data beforehand

---

# Key Takeaways

✔ ETL transforms data **before storage**
✔ ELT loads raw data **first**
✔ Hive follows **ELT architecture**
✔ ELT works better for **Big Data systems**

---

# One-Line Interview Answer

> ETL transforms data before loading it into the warehouse, while ELT loads raw data first and performs transformations later inside the big data processing system such as Hive or Spark.


## Important Question

Data Lake stores unstructured data.

Then how can Hive run SQL on it?

### Answer:

Hive works only on:

- Structured
- Semi-structured

data.

So what we do:

- Store raw data in lake
- Define **schema on read**
- Apply Hive transformation
- Store processed structured output

---

# 5️⃣ What is HQL?

When analyst writes SQL in Hive:

```sql
SELECT category, SUM(amount)
FROM sales
GROUP BY category;
```

This is called:

> **HQL (Hive Query Language)**

Hive then translates this into:

- MR / Tez / Spark execution plan

---

# 6️⃣ Hive is Just a Converter

Flow:

```
Analyst writes SQL
        ↓
Hive converts to MR/Tez/Spark
        ↓
YARN allocates resources
        ↓
Execution happens
        ↓
Result returned
```

Hive itself does NOT:

- Store data
- Process data

It only:

- Creates execution plan

---

# 7️⃣ Hive Architecture Overview

```
                   User Interface
                          |
        -------------------------------------
        |         |         |              |
       CLI       HUE      Tableau       PowerBI
                          (via JDBC/ODBC)
```

---

# 8️⃣ Core Components of Hive Service

There are 3 major components:

## 1️⃣ Hive Server

- Handles client connections
- Accepts queries
- Manages sessions

---

## 2️⃣ Driver

Responsible for:

- Receiving query
- Managing query lifecycle
- Coordinating execution

Steps:

- Assign query ID
- Track status
- Return results

---

## 3️⃣ Compiler

Most important component.

Responsibilities:

- Parse SQL
- Validate syntax
- Check table existence
- Validate schema
- Generate logical plan
- Optimize query
- Convert to physical execution plan

---

# 9️⃣ Hive Metastore

The compiler works closely with:

> Hive Metastore

Metastore stores:

- Table schemas
- Column data types
- Partition information
- Bucket information
- Table location in HDFS

Without Metastore:

- Hive cannot validate queries

---

# 🔟 Hive Query Execution Flow (With Complete Example)

To understand Hive query execution properly, we will follow **one example query from start to finish**.

---

# Example Dataset

Suppose we have a Hive table storing e-commerce order data.

Table location in HDFS:

```

/amazon/orders/

````

Example table structure:

| order_id | product_id | category | price |
|--------|--------|--------|--------|
| 1 | p1 | electronics | 500 |
| 2 | p2 | books | 20 |
| 3 | p3 | electronics | 700 |
| 4 | p4 | books | 15 |
| 5 | p5 | electronics | 400 |

Assume this table contains **5 TB of data** stored in **HDFS blocks**.

---

# Query Example

An analyst wants to know:

> **How many orders exist in each category**

The analyst writes the query in **Hue / Hive CLI / BI tool**.

```sql
SELECT category, COUNT(*)
FROM orders
GROUP BY category;
````

---

# Step 1️⃣ Analyst Writes Query

The query is written in **Hue (Hive UI)**.

Example:

```
SELECT category, COUNT(*)
FROM orders
GROUP BY category;
```

Hue sends this query to the **Hive Server**.

---

# Step 2️⃣ Query Reaches Hive Server

The **Hive Server (HiveServer2)** is responsible for:

* Receiving queries
* Managing sessions
* Handling authentication

### Authentication Step

Hive verifies the user through **LDAP / Kerberos / other security systems**.

Example:

```
User: analyst_01
Authentication: Success
```

Once authenticated, the query is forwarded to the **Hive Driver**.

---

# Step 3️⃣ Driver Receives Query

The **Driver** acts like the **query coordinator**.

Responsibilities:

1. Creates a **session**
2. Assigns a **unique Query ID**
3. Sends the query to the **Compiler**

Example Query ID:

```
query_20260307_0001
```

---

# Step 4️⃣ Compiler Processing

The **Compiler** is responsible for converting the SQL query into an **execution plan**.

This happens in multiple phases.

---

# Phase 1️⃣ Syntax Check

The compiler verifies:

* Is the SQL syntax correct?
* Does the table exist?
* Do the columns exist?

To verify this, Hive checks the **Metastore**.

The Metastore contains metadata such as:

```
Table name
Column names
Data types
Table location in HDFS
Partitions
```

Example lookup:

```
Table: orders
Location: /amazon/orders/
Columns: order_id, product_id, category, price
```

If a column does not exist:

```
Error: Column not found
```

---

# Phase 2️⃣ Logical Plan Creation

After syntax validation, Hive builds a **logical execution plan**.

Logical plan = **what operations should happen**

Example logical steps for the query:

1. Scan table `orders`
2. Extract column `category`
3. Group rows by category
4. Count rows in each group

Logical plan representation:

```
Table Scan → Group By → Aggregate
```

At this stage, Hive does **not care about execution engine yet**.

---

# Phase 3️⃣ Query Optimization

Hive now optimizes the query to reduce computation.

Some common optimizations include:

---

### 1️⃣ Predicate Pushdown

Filters are pushed closer to the data source.

Example query:

```sql
SELECT *
FROM orders
WHERE category = 'electronics';
```

Instead of scanning all data, Hive pushes the filter to **HDFS scan stage**.

Result:

```
Less data scanned
Faster execution
```

---

### 2️⃣ Column Pruning

Hive reads **only required columns**.

Example query:

```sql
SELECT category
FROM orders;
```

Hive will **not read other columns** like:

```
order_id
product_id
price
```

This reduces I/O cost.

---

### 3️⃣ Partition Pruning

If the table is partitioned:

Example table:

```
orders PARTITIONED BY (date)
```

Query:

```sql
SELECT *
FROM orders
WHERE date = '2026-01-01';
```

Hive will read only the relevant partition:

```
/orders/date=2026-01-01/
```

instead of scanning all data.

---

# Phase 4️⃣ Physical Plan Generation

Once optimization is complete, Hive generates the **physical execution plan**.

This converts the query into tasks for a distributed engine.

Possible execution engines:

| Engine    | Used For                    |
| --------- | --------------------------- |
| MapReduce | Older Hive execution engine |
| Tez       | Faster DAG engine           |
| Spark     | Modern execution engine     |

Example physical plan:

```
Map Stage → Shuffle → Reduce Stage
```

---

# What Happens Next?

Once the plan is ready:

Hive sends the execution job to **YARN**.

YARN then:

1. Allocates containers
2. Launches tasks
3. Executes MapReduce / Tez / Spark jobs

---

# Example MapReduce Execution

For our query:

```sql
SELECT category, COUNT(*)
FROM orders
GROUP BY category;
```

### Map Phase

Each mapper processes a block of data.

Example output:

```
(electronics,1)
(books,1)
(electronics,1)
(books,1)
(electronics,1)
```

---

### Shuffle + Sort

Group by key:

```
electronics → [1,1,1]
books → [1,1]
```

---

### Reduce Phase

Reducers sum the values:

```
electronics → 3
books → 2
```

---

# Final Output Returned

Hive returns the result to the user.

Result:

| category    | count |
| ----------- | ----- |
| electronics | 3     |
| books       | 2     |

This result appears in:

* Hue UI
* Hive CLI
* BI dashboards

---

# Full Hive Query Execution Flow

```
Analyst Query
      ↓
HiveServer2
      ↓
Driver
      ↓
Compiler
      ↓
Logical Plan
      ↓
Optimization
      ↓
Physical Plan
      ↓
MapReduce / Tez / Spark
      ↓
YARN Execution
      ↓
Results Returned
```

---

# Key Insight

Hive does **not process data itself**.

Instead it acts like a **SQL translator**.

It converts SQL into distributed processing jobs that run on:

```
Hadoop (MapReduce / Tez / Spark)
```

---

# One-Line Interview Answer

Hive query execution works by parsing SQL queries, generating a logical and optimized execution plan, converting it into distributed processing jobs (MapReduce/Tez/Spark), and executing them through YARN on data stored in HDFS.


# 1️⃣1️⃣ What is DAG?

DAG = Directed Acyclic Graph

Meaning:

- Execution happens in one direction
- No circular dependencies
- Each step depends on previous step

---

# 1️⃣2️⃣ Example Execution Plan (DAG Breakdown)

Suppose query:

```sql
SELECT category, SUM(amount)
FROM sales
GROUP BY category
ORDER BY SUM(amount) DESC;
```

---

## DAG Step 1 – Map Phase

- Read partitions
- Parse records
- Shuffle by category

---

## DAG Step 2 – Reduce Phase

- Group by category
- Calculate sum(amount)

---

## DAG Step 3 – Order Phase

- Sort by revenue (descending)

---

Execution plan runs on:

> YARN

---

# 1️⃣3️⃣ Role of YARN in Hive Execution

Hive → creates execution plan
YARN → manages cluster resources

YARN:

- Allocates containers
- Assigns CPU & RAM
- Monitors execution
- Handles failures

---

# 1️⃣4️⃣ Important Concepts in Hive

## 🔹 Schema on Read

Unlike traditional databases:

- Schema applied while reading data
- Data stored as raw files in HDFS

---

## 🔹 Partitioning

Divides table based on column.

Example:

```
sales/year=2026/month=02/
```

Improves performance.

---

## 🔹 Bucketing

- Divides data into fixed number of files
- Used for joins optimization

---

# 1️⃣5️⃣ Hive Execution Engines

Originally:

- Only MapReduce

Now:

- Tez (faster)
- Spark (in-memory)

MapReduce is slow because:

- Writes to disk multiple times

Tez & Spark:

- Use DAG execution
- More optimized

---

# 1️⃣6️⃣ Why Hive is Slow?

Because:

- Initially used MapReduce
- Heavy disk I/O
- Shuffle phase expensive

Modern engines improve speed.

---

# 1️⃣7️⃣ Hive vs Traditional Database

| Feature    | Hive     | RDBMS            |
| ---------- | -------- | ---------------- |
| Storage    | HDFS     | Internal storage |
| Schema     | On Read  | On Write         |
| Processing | Batch    | Real-time        |
| Use Case   | Big Data | Transactions     |

---

# 1️⃣8️⃣ End-to-End Hive Flow Summary

```
User (HQL)
     ↓
Hive Server
     ↓
Driver
     ↓
Compiler
     ↓
Metastore Validation
     ↓
Logical Plan
     ↓
Physical Plan (MR/Tez/Spark)
     ↓
YARN Execution
     ↓
Results Returned
```

---

# Summary

## What is Hive?

Hive is a SQL-based data warehouse system built on Hadoop that converts SQL queries into distributed execution plans.

---

## Does Hive Store Data?

No.

Data is stored in:

- HDFS

Hive only stores:

- Metadata

---

## What is HQL?

Hive Query Language (SQL-like).

---

## What is Metastore?

Stores metadata:

- Table structure
- Partitions
- Buckets

---

## What is DAG?

Directed Acyclic Graph:

- Ensures step-by-step execution
- No circular dependency

---
