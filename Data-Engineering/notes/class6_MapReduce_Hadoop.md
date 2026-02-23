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



````md
# 🧠 Why Resource Management is Needed (YARN – Deep & Intuitive)

---

## 🔹 The Core Problem Hadoop Faced

In a Hadoop cluster:
- There are **hundreds or thousands of machines**
- Each machine has:
  - CPU
  - RAM
  - Disk
- Many users submit jobs **at the same time**

### The big questions:
- Which job should run first?
- Which machine should run which task?
- How much CPU & RAM should each job get?
- What happens if something fails?

👉 This entire problem is called **Resource Management**

---

## 🌍 Real-Life Analogy (Intuitive Explanation)

### Imagine a company

- The company has **multiple teams**
- Each team has:
  - A manager
  - Several employees
- Some employees are working
- Some employees are on bench

Now a **new project** arrives:
- Needs **2 employees**
- Can be done by *any* employee in the company

---

### ❌ Bad System (Without Central Resource Management)

Rules:
- A project can only take employees from **one team**

Situation:
- Team 1 → 1 employee free
- Team 2 → 1 employee free
- Team 3 → 0 employees free

Result:
- ❌ Project is rejected
- ❌ Even though **2 employees are available globally**

This leads to **wasted resources**.

---

### ✅ Good System (With Central Resource Management)

Now imagine a **central HR group**:
- Knows which employees are free
- Looks across **all teams**
- Assigns:
  - 1 employee from Team 1
  - 1 employee from Team 2

Result:
- ✅ Project runs
- ✅ Resources are fully utilized
- ✅ No artificial team restriction

👉 **This central HR group is exactly what YARN is**

---

## 🧩 What is YARN?

**YARN (Yet Another Resource Negotiator)** is the **resource management layer of Hadoop**.

> HDFS stores data  
> MapReduce processes data  
> **YARN decides who gets CPU & RAM**

---

## 🎯 What Does YARN Actually Manage?

YARN manages **resources**, not data.

### Resources include:
- CPU cores
- RAM (memory)

YARN answers:
- Which job runs?
- Where does it run?
- How much CPU/RAM does it get?
- What happens on failure?

---

## 🏗️ YARN Core Components (Basic Mental Model)

---

### 🔴 Resource Manager (RM) – The Brain

Think of RM as:
> **Company HR Head**

Responsibilities:
- Knows total cluster resources
- Knows all running jobs
- Decides how resources are distributed

📌 RM **does not execute tasks**

---

### 🟡 Node Manager (NM) – The Local Manager

Runs on **every machine**.

Think of NM as:
> **Team Manager**

Responsibilities:
- Manages local CPU & RAM
- Reports resource availability to RM
- Launches containers
- Monitors tasks
- Kills tasks if limits are exceeded

📌 One cluster has:
- 1 Resource Manager
- Many Node Managers

---

### 📦 Containers – The Resource Box

A **container** is:
> A bundle of resources assigned to a task

Example:
```text
Container = 4 GB RAM + 2 CPU cores
````

Important points:

* Container ≠ VM
* Container ≠ Docker
* Container = **resource limit**
* One container runs **one task**
* Tasks are isolated from each other

---

## ❌ Problem with the Old Architecture

Earlier:

* Resource Manager directly handled tasks
* If a task exceeded its resource limit:

  * ❌ Container was killed
  * ❌ Job failed
  * ❌ Computation was wasted

This approach was **rigid and inefficient**.

---

## 🚀 New YARN Architecture (Modern & Important)

To solve these issues, Hadoop introduced the **Application Master**.

---

### 🏗️ Architecture Overview

```text
Resource Manager (Global)
        ↓
Application Master (Per Job)
        ↓
Containers (Tasks)
```

---

## 🧠 Application Master (AM) – The Game Changer

Each job gets its **own Application Master**.

Think of AM as:

> **Project Manager**

---

### Responsibilities of Application Master

1️⃣ Understands job logic
2️⃣ Splits job into tasks
3️⃣ Requests containers from RM
4️⃣ Assigns tasks to containers
5️⃣ Monitors execution
6️⃣ Handles failures

📌 RM understands the **cluster**
📌 AM understands the **job**

---

## 🔄 Old vs New Architecture (Very Important)

| Old System           | New System             |
| -------------------- | ---------------------- |
| RM managed tasks     | AM manages tasks       |
| Static allocation    | Dynamic allocation     |
| Kill on limit exceed | Request more resources |
| Less flexible        | Highly flexible        |

---

## ⚡ Example: Dynamic Resource Allocation

### Job Requirement

```text
40 GB RAM
10 CPU cores
```

### Available Resources

| Node   | Free RAM | Free CPU |
| ------ | -------- | -------- |
| Node A | 10 GB    | 4 cores  |
| Node B | 20 GB    | 4 cores  |
| Node C | 10 GB    | 2 cores  |

---

### What Happens Internally

1️⃣ RM checks total available resources
2️⃣ RM allocates resources across nodes
3️⃣ AM splits the job into **3 parallel tasks**
4️⃣ Each task runs in its own container

Result:

* ✅ Parallel execution
* ✅ Better utilization
* ✅ Faster completion
* ✅ Fault tolerance

---

## 📊 Why Scheduling is Required

When:

* Many jobs are submitted
* Resources are limited

YARN needs rules to decide:

* Who runs first?
* Who waits?
* Who gets more resources?

---

## 📊 Scheduling in YARN (Simple Explanation)

---

### 1️⃣ Fair Scheduler

Idea:

> Everyone gets a fair chance

* Resources shared equally
* No job starvation
* When one job finishes, others get more

Best for:

* Shared clusters
* Research & analytics teams

---

### 2️⃣ Capacity Scheduler

Idea:

> Department-wise quotas

* Cluster divided into queues
* Each queue has guaranteed capacity

Example:

```text
Finance → 40%
Marketing → 30%
ML Team → 30%
```

* One team cannot starve others
* Common in large enterprises

---

## 🧠 Final Intuitive Mapping

| Hadoop Component   | Real-Life Equivalent |
| ------------------ | -------------------- |
| YARN               | Central HR           |
| Resource Manager   | HR Head              |
| Node Manager       | Team Manager         |
| Application Master | Project Manager      |
| Container          | Assigned resources   |
| Scheduler          | Company policy       |

---

## ⭐ One-Line Interview Answer

> YARN is Hadoop’s resource management layer that dynamically allocates CPU and memory across distributed jobs using Resource Managers, Application Masters, and containers.

```

