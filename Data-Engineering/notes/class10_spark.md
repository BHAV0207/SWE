Here's the cleaned-up markdown with bugs fixed (broken code blocks, inconsistent headings, stray `---` separators inside sections, and the image alt text) — content unchanged:

```markdown
# Data Engineering – Class 10 Notes

# Apache Spark Backend Architecture

## 1. Motivation for Spark

Consider a large e-commerce company such as Amazon.

During events such as:

* Prime Day
* Big Billion Days
* Black Friday

Millions of users interact with the platform simultaneously.

These interactions generate massive data:

* Product views
* Add-to-cart events
* Purchases
* Clickstream logs
* Search queries

The company wants to analyze this data quickly to make decisions such as:

* Which products are trending
* Inventory planning
* Price optimization
* Fraud detection
* Recommendation updates

If we rely on **MapReduce**, analysis may take **hours or even a full day** because MapReduce writes intermediate results to disk.

However, companies often need **near real-time analytics**. For this reason, modern data platforms use **Apache Spark**.

Spark provides **much faster execution by processing data in memory instead of repeatedly writing to disk**.

---

## 2. MapReduce Execution Model

To understand why Spark is faster, it is important to first understand how MapReduce processes data.

Typical MapReduce workflow:

1. Read data from HDFS
2. Perform MAP operations
3. Write intermediate output to disk (HDFS)
4. Perform SHUFFLE and SORT
5. Perform REDUCE operations
6. Write final result to HDFS

This means **multiple disk reads and writes occur during the execution of a single job**.

Disk I/O is slow compared to memory operations. Because of this, MapReduce jobs can take a long time to complete.

---

## 3. Spark Execution Model

Spark improves performance by performing most operations **in memory**.

Typical Spark workflow:

1. Read data from HDFS
2. Load data into memory
3. Perform transformations (map, filter, join, etc.)
4. Execute aggregations in memory
5. Perform shuffles when necessary
6. Write final result to HDFS

Because intermediate data is stored in memory rather than disk, Spark can be **10–100 times faster than MapReduce**.

---

## 4. Memory Requirement in Spark

Since Spark relies heavily on memory for processing:

* Nodes must have large RAM capacity
* Cluster infrastructure cost increases

Example:

If each node requires:

* 128 GB memory

And the cluster has:

* 2000 nodes

Total memory used:

```
128 GB × 2000 = 256 TB

This high memory requirement is the trade-off for faster processing.

---

## 5. Single Point of Failure Problem

If Spark stores intermediate data in memory and a node crashes, data could be lost.

Spark solves this using a concept called **RDD (Resilient Distributed Dataset)**.

RDD provides:

* Fault tolerance
* Data recovery
* Distributed storage

---

## 6. Why Companies Are Moving from MapReduce to Spark

Several limitations of MapReduce led to the adoption of Spark.

### Disk-based processing

MapReduce writes intermediate outputs to disk multiple times.

This significantly slows down processing.

### Complexity of MapReduce Code

Writing MapReduce programs in Java is complicated.

Developers must manually implement:

* Mapper logic
* Reducer logic
* Data partitioning
* Optimization

### Structured vs Unstructured Data

Hive simplifies querying structured data using SQL.

But when dealing with unstructured data, developers often had to write custom MapReduce code.

Spark simplifies this by providing APIs in multiple languages.

---

## 7. Spark Programming Languages

Spark supports multiple programming languages:

* Python (PySpark)
* Scala
* Java
* R

Because PySpark uses Python syntax, it is easier for data engineers and data scientists to write distributed programs.

---

## 8. Spark Execution Planning

Spark internally creates a **DAG (Directed Acyclic Graph)**.

DAG represents the execution plan of the job.

A DAG ensures that:

* Tasks are executed in a logical order
* Dependencies are maintained
* Parallel execution is optimized

Spark automatically generates the execution plan based on the transformations applied in the code.

---

## 9. Resource Management with YARN

Spark does not manage cluster resources directly.

Instead, it relies on cluster managers such as:

* YARN
* Kubernetes
* Standalone cluster manager

In Hadoop environments, Spark usually runs on **YARN**.

YARN handles:

* Resource allocation
* Node management
* Failure handling

Data is still stored in **HDFS**, so Spark reads data from HDFS through YARN.

---

## 10. Spark Architecture Overview

Spark architecture consists of the following main components:

1. Driver Program
2. Spark Context / Spark Session
3. Cluster Manager
4. Worker Nodes
5. Executors

---

## 11. Driver Program

The **Driver Program** is the central coordinator of a Spark application.

It acts like the **project manager** of the Spark job.

Responsibilities of the driver:

* Executes the user program
* Creates the Spark session
* Builds the logical execution plan
* Optimizes the query plan
* Generates the physical execution DAG
* Distributes tasks to executors
* Monitors task execution
* Handles failure recovery
* Collects results from executors

Without the driver program, Spark applications cannot run.

---

## 12. Spark Context / Spark Session

Spark applications begin by creating a **SparkSession**.

SparkSession acts as the entry point for all Spark operations.

Example:

```python
from pyspark.sql import SparkSession
```

SparkSession is responsible for:

* Connecting the driver to the cluster manager
* Managing distributed execution
* Handling resource allocation
* Coordinating Spark components

---

## 13. Example Spark Configuration

```python
spark = SparkSession.builder \
   .appName("Walmart-BlackFriday-Analytics") \
   .master("yarn") \
   .config("spark.executor.instances", "2000") \
   .config("spark.executor.cores", "32") \
   .config("spark.executor.memory", "128g") \
   .config("spark.executor.memoryOverhead", "32g") \
   .config("spark.driver.memory", "64g") \
   .config("spark.driver.cores", "16") \
   .config("spark.sql.adaptive.enabled", "true") \
   .config("spark.sql.adaptive.skewJoin.enabled", "true") \
   .config("spark.sql.shuffle.partitions", "40000") \
   .config("spark.dynamicAllocation.enabled", "false") \
   .config("spark.network.timeout", "600s") \
   .config("spark.sql.parquet.compression.codec", "snappy") \
   .enableHiveSupport() \
   .getOrCreate()
```

---

## 14. Understanding Spark Configuration Parameters

### Application Name

```
.appName("Walmart-BlackFriday-Analytics")
```

### Cluster Manager

```
.master("yarn")
```

### Executor Instances

```
spark.executor.instances = 2000
```

### Executor Cores

```
spark.executor.cores = 32
```

### Executor Memory

```
spark.executor.memory = 128g
```

```
128 GB × 2000 executors = 256 TB
```

### Memory Overhead

```
spark.executor.memoryOverhead = 32g
```

### Adaptive Query Execution

```
spark.sql.adaptive.enabled = true
```

### Shuffle Partitions

```
spark.sql.shuffle.partitions = 40000
```

### Hive Support

```
.enableHiveSupport()
```

---

## 15. Cluster Manager Components

### Resource Manager (RM)

* Receives resource requests
* Allocates cluster resources
* Schedules jobs

### Node Manager (NM)

* Runs on each cluster node
* Launches executors
* Monitors resource usage
* Kills processes if memory limits are exceeded

---

## 16. Executors

Executors are processes running on worker nodes.

Responsibilities:

* Receive tasks from the driver
* Load data from HDFS
* Perform transformations
* Shuffle data across nodes
* Return results to the driver

Executors enable **parallel data processing**.

---

## 17. Directed Acyclic Graph (DAG)

```python
df.filter(amount > 100)
  .groupBy(category)
  .sum(amount)
  .orderBy(sum(amount))
```

---

## 18. Spark Transformations

### Narrow Transformations

* map()
* filter()

### Wide Transformations

* groupBy()
* join()
* orderBy()

---

## 19. RDD (Resilient Distributed Dataset)

### Resilient

RDDs are fault-tolerant.

### Distributed

Data is divided into partitions across nodes.

### Dataset

Supports structured, semi-structured, and unstructured data.

---

## 20. Summary

Spark is a distributed computing engine designed for fast data processing.

* In-memory processing
* DAG-based execution
* Multi-language support
* Faster analytics

---

## Spark's Backend

Imagine you working with Amazon e-commerce.

They have Big Billion Days / Prime Day.

If I rely on MR technique => for batch processing => we will get analysis in 24 hrs.

They want the analysis in near real-time. For this we will use Spark.

Spark brings high speed of execution.

---

## How MapReduce Works

Read the data from HDFS => then MAP => then write all the mappers to HDFS. Disk write => reduce => again write to the HDFS.

---

## Spark

Read HDFS => disk read => post which MAP => which is stored in memory in disk => in case you do a join => in memory any aggregation or sort in memory.

---

![Spark Architecture Diagram](Images/10-image-01.png)
```