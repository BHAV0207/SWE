```md
# 🐝 Introduction to HIVE & MapReduce Processing (Lecture 07)

---

# Why Distributed Processing is Needed

If **processing happens on only one machine**, there are several drawbacks.

### Drawbacks

1️⃣ **Speed is slow**

- A single machine processes data sequentially.
- If dataset is extremely large (TB / PB), processing becomes extremely slow.

Example:

```

Processing 90GB on a single machine → could take ~48 hours

```

---

2️⃣ **Single Point of Failure (SPOF)**

If the machine crashes:

- Entire processing stops
- Data processing must restart again

---

3️⃣ **Restart Issue**

If processing fails midway:

- We must restart from the beginning
- No fault tolerance exists

---

# Solution → Parallel Processing

Instead of using **one machine**, we distribute work across **many machines**.

This is called:

```

Distributed Parallel Processing

```

Advantages:

- Faster processing
- Fault tolerant
- Load balancing
- Horizontal scalability

---

# Origin of MapReduce

In **2004**, Google introduced the **MapReduce programming model**.

Goal:

```

Process extremely large datasets in parallel

```

Key ideas:

- Split large data into smaller pieces
- Process pieces independently
- Combine results later

---

# MapReduce Concept (Divide and Conquer)

In simple terms:

```

MapReduce = Divide + Process + Combine

```

### Map Phase

Processes **each piece of data independently**

### Reduce Phase

Combines results **based on keys**

---

# Example 1: Count Orders by Category

Suppose we want to compute:

```

Number of orders in each category

```

Dataset size:

```

5 Petabytes

```

Block size in HDFS:

```

128 MB

```

Therefore:

```

Total blocks ≈ 40,000

```

Each block can be processed **independently**.

---

# Example 2: Product Pair Recommendation

Suppose we have:

```

3 million orders
9 million rows

```

Stored in HDFS:

```

/amazon/orders/2026-02-01

```

Each row contains:

```

order_id, product_id, sales

```

Example:

```

1, p1, 100

````

---

# Map Function Example

The **map function** extracts relevant data.

```python
def map(linenr, order_line):

    part = order_line.split(',')

    order_id = part[0]
    product_id = part[1]

    return (order_id, product_id)
````

Map output:

```
(order_id, product_id)
```

Example output:

```
(1, p1)
(1, p2)
(1, p3)
(2, p4)
```

---

# Next Step → Shuffle + Sort

After Map phase finishes:

Data must be grouped by **key**.

This stage is called:

```
Shuffle + Sort
```

Purpose:

1. Transfer intermediate data across nodes
2. Group identical keys together
3. Sort keys

---

# Example Cluster Setup

Suppose we have 3 machines:

```
Machine 1 → DataNode 1
Machine 2 → DataNode 2
Machine 3 → DataNode 3
```

Data distribution:

```
DN1 → First 10,000 orders
DN2 → Next 10,000 orders
DN3 → Next 10,000 orders
```

Each machine:

* Stores data
* Has RAM for processing

---

# YARN Assigns the Cluster Resources

YARN decides:

* Where Map tasks run
* How many containers are allocated
* How much CPU/RAM each task receives

---

# Map Tasks Run in Parallel

Each block is processed independently.

Example:

```
900M rows ≈ 90GB dataset
```

If block size = 128MB

```
Total blocks ≈ 700
```

---

# Ideal Parallel Execution

Ideally:

```
700 blocks → 700 Map tasks
```

Each block processed by:

```
1 container
```

All tasks running **simultaneously**.

Processing time:

```
~10 minutes
```

Without parallelism:

```
~48 hours
```

---

# Hadoop 2.0 Major Advancement → Data Locality

Data locality means:

```
Move computation to data
```

instead of:

```
Move data to computation
```

Example:

```
Block 1 → DN1, DN23, DN47
Block 2 → DN2, DN1, DN24
```

If block exists on DN1:

Map task will run **on DN1 itself**.

Advantages:

* Avoid network transfer
* Faster processing
* Lower cluster traffic

---

# Without Data Locality

If a random server fetches data:

Example:

```
Block size = 128MB
Network speed = 100MB/sec
```

Transfer time:

```
~1.3 seconds
```

But in large clusters with overhead:

```
~10 seconds per block
```

Multiply by thousands of blocks → huge delay.

Thus **data locality is critical**.

---

# How YARN Actually Works

YARN architecture consists of:

```
Resource Manager
Node Manager
Application Master
Containers
```

---

# Resource Manager (RM)

Responsibilities:

* Allocates containers
* Schedules jobs
* Monitors cluster resources
* Approves job execution

Works closely with:

```
Node Managers
```

---

# Node Manager (NM)

Runs on every machine.

Responsibilities:

* Launch containers
* Monitor CPU / RAM usage
* Run Map tasks
* Run Reduce tasks

Example node capacity:

```
32 CPU cores
```

---

# Example Job → Product Recommendation

Dataset:

```
Input: /orders/2026-01-02.csv
Size: 5 Petabytes
Blocks: 40,000
```

---

# Job Submission

1️⃣ Client writes MapReduce job
2️⃣ Client submits job to YARN

```
"I need to run a MapReduce job"
```

---

# Step 1: Application Master Container Allocation

YARN allocates container for **Application Master**

Example container:

```
2 CPU cores
4 GB RAM
```

This container launches on a Node Manager.

Example:

```
NM42 launches Application Master
```

---

# Step 2: Map Task Planning

Dataset:

```
5 PB
40,000 blocks
```

Therefore:

```
40,000 Map tasks required
```

Application Master requests:

```
40,000 containers
```

Each container processes **one block**.

---

# Data Locality Optimization

Application Master recommends nodes where data exists.

Example:

```
Block 1 → DN5
```

Best node:

```
Node Manager 5
```

This reduces network transfer.

---

# Resource Allocation Example

Cluster capacity:

```
320,000 CPU cores
```

Job request:

```
40,000 cores
```

Resource Manager:

```
Request Approved
```

Containers assigned across cluster.

---

# Map Task Execution

Example assignments:

```
Container 1 → NM5 (DN5)
Container 2 → NM2 (DN4)
Container 3 → NM7 (DN9)
```

Map tasks run **fully in parallel**.

All containers report status to:

```
Application Master
```

---

# Next Phase → Shuffle + Sort

Now intermediate results must be transferred.

Example:

```
40,000 Map tasks
```

Suppose each map produces:

```
10 reduce files
```

Total intermediate files:

```
40,000 × 10 = 400,000 files
```

Example size:

```
100 MB each
```

Total network transfer:

```
400,000 × 100MB
```

This is why **Shuffle is the most expensive phase**.

---

# Reduce Container Allocation

Application Master requests new containers.

Example request:

```
10,000 containers
2 CPU cores
4GB RAM
```

Resource Manager approves if available.

---

# Reduce Phase

Reducers:

* Collect grouped data
* Aggregate results

Example output:

```
Product A + Product B → bought together 2000 times
Product A + Product C → bought together 1500 times
```

---

# Final Output

Reduce results are written to:

```
HDFS
```

---

# Important Limitation of MapReduce

MapReduce is **not designed for real-time processing**.

Reasons:

* Heavy disk I/O
* Multiple stages
* Large shuffle operations

Processing latency:

```
Minutes to hours
```

Not suitable for:

```
Real-time analytics
```

---

# Key Takeaways

✔ Parallel processing improves speed
✔ HDFS splits data into blocks
✔ Map tasks process blocks independently
✔ YARN manages resources
✔ Shuffle transfers intermediate data
✔ Reduce aggregates results

---

# One-Line Summary

```
MapReduce processes large datasets by splitting them into blocks, executing map tasks in parallel across the cluster, shuffling intermediate results, and aggregating them using reduce tasks.
```

---

# Next Topic → Apache Hive

Hive was introduced because:

```
Writing MapReduce jobs directly is complex.
```

Hive provides:

```
SQL-like interface on top of Hadoop.
```

So instead of writing Java MapReduce code:

```
SELECT category, COUNT(*)
FROM orders
GROUP BY category;
```

Hive converts this query into **MapReduce jobs automatically**.





# Map Reduce Deep Dive 

Great feedback 👍 — MapReduce is **the hardest concept to understand initially**, so the best way is to explain it **very slowly with multiple examples and step-by-step flow**.

Below I rewrote the **MapReduce section only**, keeping your notes’ style but **expanding heavily with intuition, examples, and flow diagrams**.

You can **replace the MapReduce section in your notes with this Markdown**.

---

```md
# MapReduce Processing (Detailed Explanation)

---

# What is MapReduce?

MapReduce is a **distributed data processing model** used in Hadoop to process **very large datasets** across many machines.

It follows the idea of:

```

Divide → Process → Combine

```

or simply:

```

Divide and Conquer

```

Instead of processing the entire dataset on **one machine**, the data is:

1. Split into smaller pieces
2. Processed in parallel across many machines
3. Results are combined at the end

---

# Why MapReduce is Needed

Suppose we have:

```

5 Petabytes of data

```

Processing this on a **single machine** would take **days or weeks**.

But Hadoop splits the data into **blocks**.

Example:

```

Block size = 128 MB

```

Therefore:

```

5 PB data ≈ 40,000 blocks

```

Each block can be processed **independently**.

This allows **40,000 processors to work simultaneously**.

---

# MapReduce Workflow Overview

The MapReduce pipeline has **three major stages**:

```

Input Data
↓
Map Phase
↓
Shuffle + Sort
↓
Reduce Phase
↓
Final Output

```

---

# Step 1: Input Data in HDFS

Suppose we have order data stored in HDFS:

```

/amazon/orders/2026-02-01

```

Example rows:

```

order_id, product_id, sales
1, p1, 100
1, p2, 200
1, p3, 150
2, p2, 120
2, p5, 90

```

HDFS splits this file into **blocks**.

Example cluster:

```

DN1 → first 10,000 rows
DN2 → next 10,000 rows
DN3 → next 10,000 rows

````

Each block will be processed by **one Map task**.

---

# Step 2: Map Phase

The **Map function processes each row independently**.

The goal of Map is to convert raw data into **key-value pairs**.

Example Map function:

```python
def map(line_number, order_line):

    part = order_line.split(',')

    order_id = part[0]
    product_id = part[1]

    return (order_id, product_id)
````

---

# Example Map Output

Input row:

```
1,p1,100
```

Map output:

```
(1, p1)
```

If input is:

```
1,p1
1,p2
1,p3
2,p4
```

Map output becomes:

```
(1,p1)
(1,p2)
(1,p3)
(2,p4)
```

Each Map task produces many **key-value pairs**.

---

# Example: Counting Orders by Category

Suppose input data:

```
order1, electronics
order2, electronics
order3, books
order4, electronics
order5, books
```

### Map Output

```
(electronics,1)
(electronics,1)
(books,1)
(electronics,1)
(books,1)
```

Map simply prepares data for counting.

---

# Parallel Map Execution

Suppose dataset size:

```
90 GB
```

Block size:

```
128 MB
```

Total blocks:

```
≈ 700 blocks
```

This means:

```
700 Map tasks can run simultaneously
```

Each Map task processes **one block**.

This is why Hadoop processing is **very fast**.

---

# Step 3: Shuffle + Sort Phase

After the Map phase finishes, the intermediate data must be **grouped by key**.

Example Map output:

```
(electronics,1)
(electronics,1)
(books,1)
(electronics,1)
(books,1)
```

Shuffle groups identical keys together:

```
electronics → [1,1,1]
books → [1,1]
```

Sort ensures keys are processed in order.

This phase involves **network transfer between nodes**.

---

# Step 4: Reduce Phase

Reducers process grouped data.

Example reduce function:

```python
def reduce(category, values):

    total = sum(values)

    return (category, total)
```

---

# Example Reduce Output

Input to reducer:

```
electronics → [1,1,1]
books → [1,1]
```

Reducer output:

```
electronics → 3
books → 2
```

This means:

```
3 electronics orders
2 book orders
```

---

# Example 2: Product Pair Recommendation

This example is used in recommendation systems.

Suppose order contains:

```
order1 → pA, pB, pC
```

Products bought together:

```
(pA,pB)
(pA,pC)
(pB,pC)
```

Map outputs:

```
(pA,pB) → 1
(pA,pC) → 1
(pB,pC) → 1
```

After shuffle:

```
(pA,pB) → [1,1,1,1]
(pA,pC) → [1,1]
(pB,pC) → [1,1,1]
```

Reduce counts occurrences:

```
(pA,pB) → 4
(pA,pC) → 2
(pB,pC) → 3
```

These results can be used for:

```
"Customers who bought A also bought B"
```

---

# Why MapReduce is Powerful

Advantages:

✔ Massive parallel processing
✔ Fault tolerance
✔ Handles petabytes of data
✔ Automatic load balancing
✔ Runs on commodity hardware

---

# Why MapReduce is Slow

MapReduce is **not suitable for real-time processing**.

Reasons:

1. Heavy disk usage
2. Intermediate results written to disk
3. Large shuffle network transfers
4. Multi-stage execution

Typical runtime:

```
Minutes → Hours
```

Not:

```
Milliseconds
```

---

# Real-Life MapReduce Example (Spotify)

Spotify collects data such as:

```
user_id, song_id, play_time
```

Map phase:

```
(song_id,1)
(song_id,1)
(song_id,1)
```

Shuffle:

```
song_id → [1,1,1,1,1]
```

Reduce:

```
song_id → total plays
```

This helps Spotify find:

```
Top trending songs
```

---

# Key MapReduce Concepts

| Concept     | Meaning                       |
| ----------- | ----------------------------- |
| Map         | Processes raw data            |
| Key-Value   | Intermediate format           |
| Shuffle     | Groups identical keys         |
| Sort        | Orders keys                   |
| Reduce      | Aggregates results            |
| Parallelism | Many tasks run simultaneously |

---

# Final Mental Model

Think of MapReduce as:

```
Split work
→ Work in parallel
→ Combine results
```

or

```
Map → Shuffle → Reduce
```

---

# One-Line Interview Answer

MapReduce is a distributed processing framework that processes large datasets by dividing them into blocks, executing map tasks in parallel, grouping intermediate results using shuffle and sort, and aggregating them using reducers.

```


