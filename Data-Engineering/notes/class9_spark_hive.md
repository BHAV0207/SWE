# Data Engineering – Class 9 Notes
# Hive Storage Model, Table Types, Partitioning, Bucketing, and Execution Engines

## 1. Data Storage in HDFS and Hive Schema

In the Hadoop ecosystem, data is usually stored in **HDFS (Hadoop Distributed File System)** as files. These files may contain structured or semi-structured data formats such as:

- CSV
- JSON
- Parquet
- ORC
- Text files

Hive allows us to **create a schema on top of these files** so that they can be queried using SQL-like syntax. Hive does not work on unstructured data 

Important idea:

Hive does **not store the data itself**.  
The data is stored in HDFS files, while Hive only stores **metadata about the schema**.

This concept is called:

**Schema-on-read**

This means:
- Data is stored first
- Schema is applied when we query it

This is different from traditional databases where schema must be defined before storing data.

---

## 2. Difference Between Hive and RDBMS Updates

In a traditional relational database system (RDBMS) such as MySQL or PostgreSQL, updating a record is straightforward.

Example:

```sql
UPDATE employee
SET phone_no = '1234567890'
WHERE emp_id = 1;
````

Why is this easy in RDBMS?

Because RDBMS systems are designed for **transactional workloads (OLTP)**.

Characteristics of RDBMS:

* Row-level updates are supported
* Transactions are supported
* ACID compliance
* Optimized for frequent changes

---

### Why Updating Data in Hive is Difficult

Hive operates on **files stored in HDFS**, not rows inside a database table.

HDFS has a fundamental constraint:

Files are **immutable**.

This means:

* You cannot modify a specific row inside a file.
* To change data, the entire file must be rewritten.

Therefore, to update a record in Hive, we typically use an **overwrite approach**.

Example:

```sql
INSERT OVERWRITE TABLE employees
SELECT 
    first_name,
    last_name,
    email,
    CASE 
        WHEN eid = 1 THEN '1234567890'
        ELSE phone
    END AS phone
FROM employees;
```

What happens here:

1. Hive reads the entire dataset.
2. Applies the transformation logic.
3. Writes a completely new file.
4. Replaces the old file.

This makes updates **expensive and slow**.

---

## 3. When Should Hive Be Used?

Hive should be used when:

* Data is large (terabytes or petabytes)
* Data changes infrequently
* Queries are analytical
* Historical analysis is needed
* Batch processing is acceptable

Example use cases:

* Sales analytics
* Website traffic analysis
* Log analysis
* Historical product performance

---

### When Hive Should NOT Be Used

Hive is not suitable for:

1. Frequent row-level updates
2. Real-time systems
3. Transactional workloads
4. Applications requiring millisecond response times

In such cases, RDBMS or NoSQL databases are better.

Example systems better suited for this:

* MySQL
* PostgreSQL
* Cassandra
* MongoDB

---

## 4. Real-Time Data Processing Limitation in Hive

Hive is designed for **batch processing**, not real-time updates.

When new data arrives in Hadoop systems, it is usually added as new files.

Example directory structure:


/emp/date/xyz
/emp/date/abc


Each new file represents a new batch of data.

Hive reads these files during query execution.

Because there is no direct row-level connection between files, updates and real-time operations are slow.

---


## 5. Partitioning and Bucketing

To improve performance, Hive organizes data using:

* Partitioning
* Bucketing

---

### Partitioning

Partitioning divides data into **separate folders based on column values**.

Example directory structure:


/sales/year=2024/
/sales/year=2025/
/sales/year=2026/


Each folder represents a partition.

Example Hive table:

```sql
CREATE TABLE sales (
    product_id INT,
    amount DOUBLE
)
PARTITIONED BY (year INT);
```

Benefits:

* Faster query execution
* Only relevant partitions are scanned
* Reduces data scanning

Example query:

```sql
SELECT * FROM sales WHERE year = 2026;
```

Hive only scans the folder:


/sales/year=2026
```

Instead of scanning the entire dataset.

---

### Bucketing

Bucketing divides data **within partitions into fixed number of files**.

Example:

If we create 4 buckets:

```
bucket_0001
bucket_0002
bucket_0003
bucket_0004
```

Hive uses a hash function on a column to distribute records.

Example:

```sql
CREATE TABLE sales_bucketed (
    product_id INT,
    amount DOUBLE
)
CLUSTERED BY (product_id)
INTO 4 BUCKETS;
```

Benefits:

* Improves join performance
* Efficient sampling
* Balanced data distribution

---

### Partition vs Bucket

| Feature           | Partition             | Bucket             |
| ----------------- | --------------------- | ------------------ |
| Storage           | Separate folders      | Separate files     |
| Use case          | Filter queries        | Joins and sampling |
| Data distribution | Based on column value | Based on hash      |

---

## 6. Hive as a Data Warehouse Layer

Hive is not technically a database but behaves like a **data warehouse interface**.

A data warehouse is used for:

* Historical analysis
* Aggregation queries
* Business intelligence

Hive gives a data warehouse-like experience because:

* Files in HDFS appear as tables
* Analysts can write SQL queries
* Data can be aggregated and analyzed

Example analytical query:

```sql
SELECT product_id, SUM(views)
FROM hive.views
GROUP BY product_id;
```

This might produce millions of rows.

---

## 7. Intermediate Analysis Tables

Suppose an analyst runs a query on large datasets and generates results.

Example:

Amazon product view analysis:

```
product_id | total_views
```

This result might contain **10 million rows**.

If the analyst wants to perform further analysis, they may store this output back into HDFS.

However, this data may only be useful temporarily.

Therefore, it is better to store such temporary analysis results using **internal tables**.

---

## 8. Types of Tables in Hive

Hive supports two types of tables:

1. Managed Tables (Internal Tables)
2. External Tables

---

## 9. Managed Table (Internal Table)

In a managed table, Hive manages:

* Metadata
* Data files

Example:

```sql
CREATE TABLE employees (
    id INT,
    name STRING
);
```

If the table is dropped:

```sql
DROP TABLE employees;
```

Hive will delete:

* Table schema
* Metadata
* Actual files stored in HDFS

This means the data is permanently deleted.

---

### When to Use Managed Tables

Use internal tables when:

* Data is temporary
* Data is generated for analysis fro personal use to maybe check something or personal use etc...
* Data is not part of production systems

Example:

Temporary analytical results.

---

## 10. External Tables

In external tables, Hive only manages the schema.

The data files remain in HDFS even if the table is dropped.

Example:

```sql
CREATE EXTERNAL TABLE employees (
    id INT,
    name STRING
)
LOCATION '/data/employees/';
```

If the table is dropped:

```
DROP TABLE employees;
```

Only metadata is deleted.

The HDFS file remains untouched.

---

### When to Use External Tables

External tables should be used when:

* Data belongs to production systems
* Multiple tools access the data
* Data should not be accidentally deleted
* Data is shared across teams

Most production Hive tables are external tables.

---

## 11. Default Table Behavior

If you create a table without specifying the type:

```
CREATE TABLE emp_123 (...)
```

Hive creates a **managed table by default**.

To create an external table you must explicitly specify:

```
CREATE EXTERNAL TABLE emp_123 (...)
```

---

## 12. Hive Execution Engines

Hive queries are converted into execution plans that run on distributed engines.

Originally, Hive used:

MapReduce

Later, faster engines were introduced:

* Tez
* Spark

---

## 13. MapReduce Engine

MapReduce processes data on **disk**.

Every step (map, shuffle, reduce) writes intermediate results to disk.

This causes:

* High disk I/O
* Slow performance

MapReduce is good for:

* Large ETL pipelines
* Heavy batch jobs
* Fault tolerance

But it is slower than modern engines.

---

## 14. Tez Engine

Tez improves performance by:

* Using DAG execution
* Reducing disk writes
* Optimizing task execution

Tez runs jobs mostly **in memory**, which makes it much faster than MapReduce.

Tez is commonly used for:

* Interactive analytics
* SQL queries on Hive

In modern Hive installations, **Tez is the default engine**.

---

## 15. Spark Engine

Spark is the fastest execution engine for large-scale data processing.

Spark advantages:

* In-memory processing
* Advanced DAG scheduling
* Supports machine learning
* Supports streaming data

However, Spark must be configured with Hive separately.

Spark is widely used for:

* Real-time analytics
* Machine learning pipelines
* Data science workloads

---

## 16. Changing Execution Engine in Hive

To switch execution engines:

```
SET hive.execution.engine = mr;
SET hive.execution.engine = tez;
SET hive.execution.engine = spark;
```

---

## 17. Comparison of Execution Engines

| Engine    | Speed   | Processing       | Architecture            |
| --------- | ------- | ---------------- | ----------------------- |
| MapReduce | Slow    | Disk-based       | Hadoop 1.x              |
| Tez       | Faster  | Mostly in-memory | Hadoop 2.x              |
| Spark     | Fastest | In-memory        | Separate cluster engine |

---

## 18. Choosing the Right Engine

MapReduce should be used when:

* Running heavy ETL jobs
* Stability is more important than speed
* Batch pipelines are large

Tez should be used when:

* Running analytical SQL queries
* Working with Hive frequently
* Faster query performance is needed

Spark should be used when:

* Running machine learning pipelines
* Building real-time dashboards
* Handling streaming data
* Data science workflows

---

## 19. Summary

Hive provides a SQL interface for analyzing large datasets stored in HDFS.

Important concepts:

* Hive uses schema-on-read.
* Updates require file overwrites.
* Hive is best suited for batch analytics.
* Partitioning and bucketing improve performance.
* Managed tables delete data when dropped.
* External tables preserve HDFS data.
* Hive execution engines include MapReduce, Tez, and Spark.

Hive is primarily used as a **data warehouse interface for big data systems**.


----
````
-----
----
----
---
we have a data which is residing into the hdfs. incase its a structured data.remember hive is only for structured data, we can create a schema on top of the file in hdfs , whatever . 



in RDBMS system to update the record 
we would write something like
        update table employee
        set phone-no = '1234567890'
        where emp-id = 1

in RDBMS updating the data would be very very simple, because they are transactional database they are made for this kind of work , if we were to do the same thing in hive , do you think this kind of code will work ?
actually we are referring to  a file , so now if i were to update a file in hdfs , so if i have to update i have to update a original file in hdfs , so in this case if i have to update a file , i have to override the file with new condition.
we will have to write 
        overwrite table employees 
        select first_name , Last_name , email, case when eid=1 then phone = '1234567890' else phone 
        end as phone 
        from the table 


if we are working with the data which is contineously changing ? is hive the solution for the same, if it is very frequnetly changing the data, then we have to rely on rdbms, 
but if it is not so frequently changing data  , you dont want to update or run the update command, in that case it is fine because , the point we have the file and anything that we have to change in the data then we have to override the file , thats the main drawback that we find while using hive .

the second kind of limitation is : if we are lookign to deal with anykind of realtime data or realtime updates ..  ?
why it is not doable because unlike your rdbms system, ultp systems , if any new information comes , it will be added as a file itself and if a file will not have a direct connection it will usually take a lot of time .

you will specify you will specify , 
that there is a folder  say employee data and then you have a date and then whatever file comes in here you will pick this up 
    /emp/date/xyz
    /emp/date/abc

do you know what this foldering is called as  ?
this is called partitions and bucketing is folders ke under aur divisions .
division of files is my bucket and division of folder is my partition .

is it easy to do the row level updates in hive , ? we can do, but for this the better option is the RDBMS databases .
it act as a datawarehouse 
the reason we have warehousess is because we have to do some historical data analysis . so for historical analysis is where we use the data warehouse .
hive is not a datawarehouse , it just creates , it just creates a feel of datawarehouse , because we can directly reference a file from hdfs which can be stored in your schema  which can be seen as a table in your  hue ,and thats the reason it acts as a datawarehouse without actually being data warehouse .


----


 

we have difffernt table types in hive 
             
managed table / internal table => hive actually manages both file as well as metadata
that means the internal table takes the full responsibility of the table.

once data is written to managed table which is coming from HDFS. 
if the table schema that we have created using the metadata which is powerd from the file using hdfs is removed , the data from HDFS will also be removed.

this means if you have a file on which you have created a schema , which is powering this internal table and if you delete that table and you write a command drop table or anything , it will not just drop the table , it will  not just deop the schema , it will also remove the hdfs file.
once the file is given to the hive internal tables , it takes the responsibility of it, it the table is dropeed the file in hdfs will also be dropped .




HDFS mei file hai.. uspe humne schema banaya . ab schema pe hum queries likh rhe hai  .
uss queries mei likh diya ki delete the table of drop the table .
in internal table the risk is we can loose the original table.

so ideally fayda yeh hai ki koi data hai jo mughko nhi chayeye  , to ideally agar hive mei hai to pahele mei shcema delete krunga fir hdfs mei jaunga and then i will delete it 
par agar pata hai ki this table only used by hive so you can use a internal table , taki you dont want that table taki if you don want that table you can remove the file and you can save some memory.

lets say i am doing an analysis that how many views each prodcut get in a day ... now what you will do, this views data which is in the file of the views is spreaded across different servers in distributed manner is stored inside hdfs , you create a hive schema on the file of this perticualr views and then after usning hql youwill wirte a code 
eg :
        select productid, sum of views from the table hive.views 
        group by 1 
    
when you write this particualr code  lets say for amazon you will get 1cr rows and now you want to futher analyse this data so whatever is the oouput of the code you will write it to the hdfs now when you store this particular data in hdfs .
now if you write this to hdfs .. is it adding any value to the company , is it an important table for the company to use ... no , it is for your personal use  now once your analyis is over do you really want to keep this file .. no so in taht case , this is to make sure we can use internal table and once it drops it, the file will also be dropped and the table will also be dropped .

second one is the external table =>
schema is not tied to the table.
even if you drop the schema .
we have a hdfs file on top of it we create a schema , this schema will be stored as external table.
if you drop this external table just the schema will be dropped from the metadata 

so it is always advised that whenever you read the data from  production and you want to analys that it is prefferd to use the external table 
we are not touching the hdfs file we are just touching the schema. 
if we dont mention anything in
create ---- emp_123 
    (schema)

so bydefault it will take internal table.
 
but  for external we have to explicitly mention
create external table emp_123
    (Schema)


in the initial phases of hive , the default execution process or the query converion which was happening or the default enginw which was used MR engine 
for parallel processing we were using the MR engine
whenever we use MR as engine , the processing would happen on the disk.(every shuffle , join action)
this leads to slow retrivel of data.
if i am doing batch processing then its fine.   

in that case there are new engines in which instead of doing the processing on the disk they do it on RAM 
this has led us to new engine tez and spark
another feature of taz and spark is
for every execution that they do, they will internally create the thing called DAG.

default engine is tez 
the fastest way to run the code in hive is tez
if we want to switch
    set hive.exectution.engine=spark/mr

  
differences 



sqark is not that optimized for hql

MR works with the fixed map 
Tez/spark use DAG
mr would be slow  and uses hadoop 1x architecture
tez is faster uses hadoop 2x 
spark is fastest and we have to configure it.

for batch processing we will do MR
analytical query we can use tez
realtime dashboard we can use spark


MR is best for etl pipelines 
for analytics we can use tez
for ML/AI models which needs to be updated every single minute every single second we should use spark.


---------
-------
------
-----
-----
----