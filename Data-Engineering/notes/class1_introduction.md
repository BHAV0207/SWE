# 📊 Data Engineering – Complete & Easy Notes

## 🔹 What is Data Engineering?

**Data Engineering** is the process of **collecting, processing, storing, and transforming raw data** into a form that can be **analyzed and consumed** by business teams, data analysts, and data scientists.

> **Raw Data → Clean & Structured Data → Useful Insights**

---

## 🔹 ETL Process (Core of Data Engineering)

**ETL = Extract, Transform, Load**

### 1️⃣ Extract

- Collect data from multiple sources
- Examples:
  - Databases
  - APIs
  - Application logs
  - Files (CSV, JSON)

### 2️⃣ Transform

- Clean and process raw data
- Tasks include:
  - Removing duplicates
  - Data validation
  - Format conversion
  - Applying business logic
- Example:
  - Currency conversion
  - Timestamp normalization

### 3️⃣ Load

- Store transformed data into:
  - Data Warehouse
  - Data Lake

📌 **ETL ensures data is accurate, consistent, and analysis-ready**

---

## 🔹 What We Learn in Data Engineering

### 1️⃣ Handling Large Volume of Data (Volume)

- Modern companies generate **terabytes to petabytes** of data
- Data Engineers build systems that:
  - Store huge datasets
  - Process data efficiently
  - Scale as data grows

---

### 2️⃣ Economics of Speed (Processing Speed)

- Faster processing = faster business decisions
- Goal:
  - High performance
  - Low operational cost
- Trade-off between:
  - ⚡ Speed
  - 💰 Cost

---

### 3️⃣ Variety of Data

Data exists in multiple formats:

- **Structured Data**
  - Rows and columns
  - Example: MySQL tables

- **Semi-Structured Data**
  - JSON, XML
  - Flexible schema

- **Unstructured Data**
  - Images, videos, logs, text files, emails

📌 Data Engineers must handle **all data types**

---

### 4️⃣ Cost Optimization

- Storage is relatively cheap
- Data processing is expensive
- Companies design pipelines to:
  - Store raw data cheaply
  - Process only required data
  - Reduce unnecessary computation

---

## 🔹 How Companies Acquire Data

### Sources of Data:

1. **User Interactions**
   - Website clicks
   - Mobile app usage
   - Page views, searches, likes

2. **APIs**
   - Internal services
   - External platforms

3. **Third-Party Data**
   - Marketing tools
   - Analytics platforms
   - Partner companies

4. **Transactions**
   - Orders
   - Payments
   - Inventory updates

---

## 🔹 Data Storage Concepts

### 🔹 Data Warehouse

- Stores **structured data**
- Optimized for:
  - Analytics
  - Reporting
- Clean and organized

📌 Use cases:

- Business dashboards
- Sales analysis
- Financial reports

---

### 🔹 Data Lake

- Stores:
  - Raw data
  - Unstructured data
  - Semi-structured data
- Data is stored **as-is**
- Accessed rarely

📌 Why Data Lakes?

- Cheap storage
- Useful for:
  - Machine learning
  - Future analysis
  - Experimental use cases

🔁 When needed:

- Data is extracted from Data Lake
- ETL is applied
- Loaded into Data Warehouse

---

### 🔹 Cloud Storage (Example: AWS)

- Cloud platforms allow:
  - Cheap data storage
  - Pay-as-you-go model
- Storage is cheap
- **Data retrieval and processing are costly**

📌 Hence:

- Companies store raw data in Data Lakes
- Process data only when required
- all the unstructured data is stored in the data lake , which is the scttered data that is generally not needed by the company , or in a very rare case , so when the company need the data form data lake they do ETL and put in the data warehouse generally AWS allows you to put all you data in it for free , but when you try to retrieve it it charges you for retrieving , generally companies keep the data lake in the aws

---

## 🔹 Data Marts

**Data Marts** are **smaller, subject-specific subsets** of a Data Warehouse.

### Examples:

- Sales Data Mart
- HR Data Mart
- Product Data Mart

📌 Benefits:

- Faster queries
- Easier BI analysis
- Department-specific insights

---

## 🔹 Overall Data Flow (Architecture)

```

Data Sources
|
|---- ETL ----> Data Warehouse ----> BI / Analytics
|
|------------> Data Lake (raw data)

```

---

## 🔹 OLTP vs OLAP

### 🔹 OLTP – Online Transaction Processing

- Handles real-time transactions
- Fast insert, update, delete operations
- Maintains data consistency
- online transaction processing these are the processes where all the transaction related changes and chain of events stored eg > when an order is placed the inventory is updated etc. all of this is stored

📌 Examples:

- Order placement
- Payment processing
- Inventory updates

📌 Databases used:

- MySQL
- PostgreSQL
- Oracle

These are **RDBMS (Relational Database Management Systems)**

---

### 🔹 OLAP – Online Analytical Processing

- Used for:
  - Data analysis
  - Reporting
- Read-heavy workloads
- Works on historical data

📌 Examples:

- Sales trend analysis
- Customer behavior analysis

📌 Uses:

- Data Warehouses
- Big Data systems

---

## 🔹 Technology Mapping

| Purpose        | Technology                |
| -------------- | ------------------------- |
| OLTP           | MySQL (RDBMS)             |
| Data Lake      | Cloud Storage (AWS / GCP) |
| Data Warehouse | BigQuery                  |
| Analytics      | BI Tools                  |

📌 **BigQuery**

- SQL-based
- Designed for massive datasets
- Optimized for OLAP workloads

---

## 🔹 Big Data Storage & Scaling

When data grows, companies use two scaling methods:

### 1️⃣ Vertical Scaling

- Increase:
  - CPU
  - RAM
  - Storage
- Limited and expensive

---

### 2️⃣ Horizontal Scaling (Distributed Systems)

- Add more machines
- Distribute data across nodes
- Highly scalable and cost-effective

---

## 🔹 Hadoop Distributed File System (HDFS)

- Open-source distributed file system
- Designed for big data storage
- Stores data across multiple machines
- Provides:
  - Fault tolerance
  - High availability
- Hadoop distributed file system (HDFC) whihc is an opesource software which was created to manage the distributed systems

📌 Forms the foundation of the Big Data ecosystem

---
