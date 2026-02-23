```md
# 🎵 How Spotify Works – Hadoop Processing & YARN (Complete Notes)

---

## 🌍 Big Picture: How Spotify Optimizes Listening Experience

Spotify has **2B+ users** streaming music simultaneously.  
To make this possible, Spotify relies on **Big Data systems** to:

- Store massive audio & metadata
- Process user behavior (likes, skips, repeats)
- Allocate computing resources efficiently

At a high level, Hadoop provides **three core layers**:

```

Storage  → HDFS
Processing → MapReduce
Resource Management → YARN

```

📌 **HDFS** was covered earlier  
📌 In this session, focus is on **Processing & YARN**

---

## 🧠 Hadoop Architecture (Revisited)

| Layer | Responsibility |
|----|---------------|
| HDFS | Distributed storage |
| MapReduce | Data processing |
| YARN | Resource & job management |

---

## 🧱 Rack Awareness (Very Important Concept)

A **rack** is a collection of DataNodes connected to the same network switch.

### Rack Awareness Rule:
> **Replicas of the same block must never be stored on the same rack**

### Why?
- If a rack fails (power / switch / fire)
- All nodes in that rack go down
- Data loss occurs if replicas were colocated

📌 HDFS ensures:
- Replicas across **different DataNodes**
- Replicas across **different racks**
- Sometimes across **different regions**

---

## 📖 How HDFS Reads a File (Optimized for Speed)

### Step-by-step File Read Flow

1️⃣ A file is split into **128 MB blocks**  
2️⃣ Each block has **3 replicas** on different DataNodes  
3️⃣ Client requests the file from **NameNode**  

---

### Step 1: Metadata Lookup

NameNode returns a **block-to-DataNode mapping**, e.g.:

```

Block 1 → DN1, DN2, DN10
Block 2 → DN12, DN4, DN11
...

```

📌 NameNode only provides **locations**, not data.

---

### Step 2: Latency-Based Selection

Each block has multiple replicas.  
The client chooses the **nearest DataNode** based on **network latency**.

Example:
```

Block 1 replicas:
DN1 → 2 ms
DN2 → 10 ms
DN10 → 30 ms

```

✅ DN1 is selected (lowest latency)

---

### Step 3: Parallel Block Reading

If a file has **10 blocks**:
- Each block is read **in parallel**
- From the closest DataNode
- Blocks are then **concatenated**

📌 This parallelism makes HDFS **very fast for large files**

---

## ⚙️ Processing Layer – MapReduce

MapReduce is the **processing engine** in Hadoop.

### What does MapReduce do?
- Processes data stored in HDFS
- Works in **parallel**
- Moves computation **to data**, not data to computation

### Two Phases:
1️⃣ **Map** → Process input blocks  
2️⃣ **Reduce** → Aggregate results  

📌 Example use cases:
- Counting song plays
- Aggregating user listening time
- Building recommendation models

---

## 🧠 Why Resource Management is Needed

### Real-life analogy (Your example – refined)

Imagine:
- Multiple teams
- Each team has:
  - Manager
  - Employees
- Some employees are on bench

A new project needs **2 employees**.

❌ Bad approach:
- Restrict hiring only within one team
- Project fails even though people are free elsewhere

✅ Correct approach:
- Central group tracks **all employees**
- Assigns free people across teams

👉 This is exactly what **YARN** does.

---

## 🧩 What is YARN?

**YARN (Yet Another Resource Negotiator)** is the **resource manager of Hadoop**.

### Responsibilities:
- Tracks all cluster resources
- Schedules jobs
- Allocates resources
- Monitors nodes
- Handles failures

📌 Think of YARN as:
> **Task Manager / Resource Manager Group (RMG)**

---

## 🏗️ YARN Core Components (Old Understanding)

### Resource Manager (RM)
- Global authority
- Knows total cluster resources

### Node Manager (NM)
- Runs on every node
- Manages:
  - CPU
  - RAM
  - Containers
- Reports status to RM

### Containers
- Resource allocation unit
- Like a **lightweight VM**
- Example:
```

4 GB RAM + 2 CPU cores

```

Each container:
- Runs **one task**
- Is isolated from others

---

## 🚀 New YARN Architecture (Modern & Important)

```

Resource Manager
↓
Application Master(s)
↓
Containers

```

---

## 🧠 Application Master (AM) – The Game Changer

Each job has its **own Application Master**.

### Responsibilities of Application Master:
1️⃣ Monitors job execution  
2️⃣ Requests more resources dynamically  
3️⃣ Handles failures  
4️⃣ Coordinates task execution  

📌 Earlier:
- Containers were killed if limits exceeded

📌 Now:
- AM asks RM for more resources

---

## ⚡ Example: Dynamic Resource Allocation

Suppose a job needs:
```

40 GB RAM + 10 CPU cores

```

Available resources:
- AM1 → 10 GB, 4 cores
- AM2 → 20 GB, 4 cores
- AM3 → 10 GB, 2 cores

👉 Job is **split into 3 parallel tasks**
👉 Runs simultaneously across AMs

📌 This improves:
- Speed
- Resource utilization
- Fault tolerance

---

## 📊 Scheduling in YARN

YARN decides **how resources are distributed** using schedulers.

### 1️⃣ Fair Scheduler
- Every job gets fair share
- Prevents starvation

### 2️⃣ Capacity Scheduler
- Resources divided into queues
- Each queue has guaranteed capacity
- Used in large organizations

---

## 🧠 Final Mental Model

| Component | Role |
|----|----|
| HDFS | Stores data |
| MapReduce | Processes data |
| YARN | Manages resources |
| Resource Manager | Cluster brain |
| Node Manager | Node-level manager |
| Application Master | Job-level manager |
| Container | Resource unit |

---