````md
# 🗄️ HDFS – Hadoop Distributed File System (Final Consolidated Notes)

---

## 🔹 What is HDFS?

**HDFS (Hadoop Distributed File System)** is a **distributed storage system** designed to store **very large volumes of data** across multiple machines in a **reliable, fault-tolerant, and scalable** manner.

---

## ❓ Why do we need HDFS?

Think about platforms like **Instagram**:
- ~2.5 billion users
- Millions of images/videos
- Any user’s content is accessible anytime

This works because data is:
- Distributed across many machines
- Replicated to avoid data loss
- Centrally managed via metadata

👉 **HDFS solves this problem at scale**

---

## 🔹 Vertical Scaling vs Horizontal Scaling

### 🔸 Vertical Scaling
- Increase RAM / CPU / storage of a single machine

Problems:
- Hardware limit
- Very expensive
- **SPOF (Single Point of Failure)**

---

### 🔸 Horizontal Scaling (Used by HDFS)
- Increase number of machines (nodes)
- Data is distributed across machines

#### Benefits
- High scalability
- Avoids SPOF
- High availability
- Rack & region-level fault tolerance

#### Disadvantages
- Coordination complexity
- Consistency challenges
- Debugging is difficult
- Network latency issues

---

## 🔹 Hadoop Ecosystem (Big Picture)

Hadoop is **not a single software**, but an **ecosystem**.

### Hadoop 1.0
- **Storage** → HDFS
- **Processing** → MapReduce  
❌ Only one job at a time

### Hadoop 2.0
- Added **YARN (Yet Another Resource Negotiator)**  
✔ Multiple jobs  
✔ Multi-tenant support  

📌 These notes focus **only on HDFS**

---

## 🧠 Core Idea of HDFS

1. Files are split into **blocks** (default 128 MB)
2. Blocks are stored on **DataNodes**
3. Each block is **replicated (default = 3)**
4. Replicas are placed on:
   - Different DataNodes
   - Different racks
   - Different locations

📌 This removes **single point of failure**

---

## 🔹 NameNode & DataNode (Master–Slave Model)

### 🔴 NameNode (Master)
- Stores **metadata only**
- Manages:
  - File names & directories
  - Block → DataNode mapping
- Controls read/write access
- Stores:
  - **FSImage**
  - **Edit Logs**
- Metadata kept in **RAM** for fast access

📌 **NameNode does NOT store actual data**

---

### 🟡 DataNode (Slave)
- Stores **actual data blocks**
- Stores **multiple blocks** from multiple files
- Sends:
  - Heartbeats
  - Block reports

---

## 🔹 What does the NameNode store?

### 1️⃣ Metadata
- File names
- Directory structure
- Block locations

### 2️⃣ Edit Logs
- Logs every filesystem change
- Used for:
  - Recovery
  - Rollback
  - Consistency

### 3️⃣ FSImage
- Snapshot of filesystem metadata
- Used during restart & rollback

---

## 🔹 NameNode High Availability (Fixing SPOF)

Earlier:
- Single NameNode → SPOF

Solution:
- **Active NameNode**
- **Standby NameNode**

### How HA works
1. Active NameNode handles requests
2. Standby NameNode stays in sync
3. Edit logs are continuously shared
4. If Active fails → Standby becomes Active

📌 **Secondary NameNode is NOT a backup**  
It is a **checkpointing node**

---

## 🔹 Heartbeat Mechanism

- DataNodes send heartbeats (~3 seconds)
- If no heartbeat for ~10 minutes:
  - Node marked **DEAD**
  - Replication triggered automatically

---

# ✍️ HDFS WRITE FLOW (How data is stored)

---

## Step-by-Step Write Process

### 1️⃣ Client → NameNode
Client requests permission to write a file.

### 2️⃣ NameNode validation
NameNode:
- Checks permissions
- Decides:
  - Block size
  - Replication factor
  - Target DataNodes

### 3️⃣ File split into blocks
Example:
- File = 256 MB
- Block size = 128 MB
- → 2 blocks

### 4️⃣ Pipeline write to DataNodes

```text
Client → DataNode1 → DataNode2 → DataNode3
````

* Each DataNode stores one replica
* Replicas placed across racks

### 5️⃣ Acknowledgement (ACK)

ACK flows back through pipeline.
Only then is block considered written.

### 6️⃣ Metadata update

NameNode updates:

* FSImage
* Edit logs
* Block locations

---

## 🧩 HDFS Write Flow Diagram (ASCII)

```text
          ┌──────────┐
          │  Client  │
          └────┬─────┘
               │
               ▼
        ┌─────────────┐
        │  NameNode   │
        │ (Metadata)  │
        └────┬────────┘
             │
             ▼
   ┌────────────┐   ┌────────────┐   ┌────────────┐
   │ DataNode 1 │──►│ DataNode 2 │──►│ DataNode 3 │
   │ Replica 1  │   │ Replica 2  │   │ Replica 3  │
   └────────────┘   └────────────┘   └────────────┘
```

---

# 📖 HDFS READ FLOW (How data is retrieved)

---

## Step-by-Step Read Process

### 1️⃣ Client → NameNode

Client asks:

> “Where are the blocks of this file?”

### 2️⃣ NameNode response

Returns:

* Block IDs
* DataNode locations

📌 No data flows through NameNode

### 3️⃣ Client reads from nearest DataNode

```text
Client → Nearest DataNode
```

### 4️⃣ Failover

If a DataNode fails:

* Client switches to another replica
* Read continues seamlessly

---

## 🧩 HDFS Read Flow Diagram (ASCII)

```text
          ┌──────────┐
          │  Client  │
          └────┬─────┘
               │
               ▼
        ┌─────────────┐
        │  NameNode   │
        │ (Metadata)  │
        └────┬────────┘
             │
             ▼
        ┌────────────┐
        │ DataNode   │
        │ (Nearest)  │
        └────────────┘
```

---

## ⚠️ Read vs Write Comparison

| Aspect         | Write                | Read              |
| -------------- | -------------------- | ----------------- |
| NameNode role  | Chooses DataNodes    | Returns metadata  |
| Data movement  | Client → DataNodes   | DataNode → Client |
| Replication    | Happens during write | Already exists    |
| Fault handling | Pipeline reroute     | Replica switch    |

---

## 🧱 DataNode & Blocks (Important Clarification)

* ❌ One DataNode ≠ One block
* ✅ One DataNode stores **many blocks**

### Example

* File size = 1 GB
* Block size = 128 MB
* → 8 blocks

| DataNode | Blocks Stored    |
| -------- | ---------------- |
| DN1      | Block 1, Block 5 |
| DN2      | Block 2, Block 6 |
| DN3      | Block 3, Block 7 |
| DN4      | Block 4, Block 8 |

📌 Blocks of the same file are **spread across DataNodes**

---

## ❓ Can blocks of same file be on same DataNode?

* ⚠️ **Technically yes**
* 🧠 **Practically avoided**

HDFS prefers different DataNodes to ensure:

1. Fault tolerance
2. Parallel reads
3. Load balancing

---

# 🚨 What happens when a DataNode fails?

---

## Step-by-Step Failure Handling

### 1️⃣ Failure detection

* No heartbeat → DataNode marked DEAD

### 2️⃣ Under-replication

Replica count drops below required value.

### 3️⃣ Re-replication

NameNode:

* Chooses healthy DataNode
* Copies block from existing replica

### 4️⃣ Failed DataNode

* NOT repaired automatically
* Admin restarts/replaces it
* Rejoins cluster later

---

## 📝 One-line Exam Answer

> When a DataNode fails, the NameNode detects it via missing heartbeats, marks its blocks as under-replicated, and creates new replicas on healthy DataNodes to restore the replication factor.

---

## ❌ Why HDFS is NOT for OLTP

* High latency
* Append-only writes
* Large block size
* Not for frequent small updates

📌 OLTP → MySQL / PostgreSQL
📌 Analytics → HDFS / Data Lake

---

# ⚖️ CAP Theorem (VERY IMPORTANT)

A distributed system can guarantee **only two out of three**:

### Consistency (C)

All nodes see same data

### Availability (A)

Every request gets response

### Partition Tolerance (P)

Works despite network failure

---

## CAP Combinations

| Type | Example                        |
| ---- | ------------------------------ |
| CP   | Banking systems, HDFS NameNode |
| AP   | Twitter, Instagram             |
| CA   | Traditional RDBMS              |

---

## 🧠 Final Mental Model (INTERVIEW GOLD)

* **HDFS = Distributed storage**
* **NameNode = Brain**
* **DataNode = Storage**
* **Replication = Fault tolerance**
* **Write** → Client → NameNode → DataNodes
* **Read** → Client → NameNode → DataNode

---

## ⭐ One-Line Summary

> HDFS is a fault-tolerant distributed file system that stores massive data using replication and centralized metadata management.

```

---

If you want, I can also:
- Convert this into **beautiful Notion-style notes**
- Add **real diagrams (not ASCII)**
- Or compress it into **1-page interview revision sheet**

Also referencing your file: :contentReference[oaicite:0]{index=0}
```
