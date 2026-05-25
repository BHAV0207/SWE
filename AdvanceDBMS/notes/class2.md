# DBMS Architecture + Storage Engine Notes

# Introduction

In this lecture we study:

- DBMS Architecture
- Redis Internals
- Memory Architecture
- Shared Memory (mmap)
- Disk Storage
- Page Cache
- File Read/Write Flow
- DMA
- SSD vs HDD
- Eviction Policies

---

# REDIS

Redis is an **in-memory database**.

This means:

- Data primarily exists inside RAM
- Very low latency
- Extremely fast reads/writes

Redis is commonly used for:

- Caching
- Session storage
- Pub/Sub systems
- Real-time systems
- Rate limiting
- Leaderboards

---

# Redis as a Key-Value Store

Redis is a:

## Key-Value (KV) Database

Internally it stores:

```text
key -> value
```

Similar conceptually to:

```js
HashMap / Dictionary / Map
```

Example:

```text
"user:1" -> "Bhavya"
```

---

# Why Redis is Fast

Redis stores data inside RAM.

RAM access is significantly faster than disk access.

Approximate latencies:

| Storage Type | Approximate Latency |
|---|---|
| CPU Cache | Nanoseconds |
| RAM | ~100 nanoseconds |
| SSD | Microseconds |
| HDD | Milliseconds |

This is why Redis is extremely fast.

---

# Process Memory Basics

Every running program/process gets memory.

A process generally has:

- Stack Memory
- Heap Memory

---

# Stack vs Heap

| Stack | Heap |
|---|---|
| Fast | Slower than stack |
| Temporary | Dynamic memory |
| Function calls | Objects/data structures |
| Automatically managed | Manually/GC managed |
| Small size | Larger size |

---

# Important Correction

Incorrect:

```text
Heap is persistent
```

Correct:

Heap memory is also inside RAM and is NOT persistent.

Both stack and heap are volatile memory.

Persistence means:

→ Data survives system restart/power off.

Heap does NOT survive restart.

Disk storage provides persistence.

---

# Process Isolation

Suppose:

- Process A has a HashMap in its heap
- Process B wants to access it

Normally this is NOT possible.

Reason:

Every process has isolated memory space.

---

# Virtual Memory vs Physical Memory

# Physical Memory

Actual RAM hardware.

---

# Virtual Memory

Each process gets its own virtual address space.

Example:

Both processes may use address:

```text
0x0004
```

But:

- Process A's address maps to one RAM location
- Process B's address maps to another RAM location

This mapping is managed using:

- Page tables
- MMU (Memory Management Unit)

---

# Why Processes Cannot Access Each Other's Heap

Because:

- Memory isolation provides security
- Prevents accidental corruption
- Ensures process stability

Each process has separate virtual memory mapping.

---

# Shared Memory / mmap

To share data between processes:

We use:

- Shared Memory
- mmap (Memory Mapped Files)

---

# How Shared Memory Works

In shared memory:

Multiple processes map their virtual memory addresses to the SAME physical RAM location.

Example:

```text
Process A Virtual Address
            ↓
        Shared RAM Region
            ↑
Process B Virtual Address
```

Now both processes can access same memory.

---

# mmap (Memory Mapping)

`mmap()` is a system call.

It maps:

- File
- Shared memory region

directly into process virtual memory.

Benefits:

- Fast IPC (Inter Process Communication)
- Avoids unnecessary copying
- Efficient file access

---

# Redis and Shared Memory

Important Correction:

Incorrect:

```text
All processes read Redis heap using shared memory
```

Correct:

Redis runs as a separate server process.

Other applications communicate with Redis via:

- TCP sockets
- Unix sockets

NOT by directly accessing Redis heap memory.

---

# Redis Architecture

Redis generally:

- Runs as a single main process
- Uses event-driven architecture
- Uses single-threaded command execution (core logic)

Modern Redis versions also use helper threads for:

- Networking
- Background tasks
- Persistence

---

# Redis Persistence Problem

Redis stores data in RAM.

RAM is volatile.

If power goes off:

→ Data is lost.

Therefore persistence becomes important.

---

# Redis Persistence Mechanisms

Redis uses:

## 1. RDB (Snapshotting)

Creates periodic snapshots of memory onto disk.

Example:

```text
dump.rdb
```

---

## 2. AOF (Append Only File)

Logs every write operation.

Example:

```text
SET user:1 Bhavya
```

This allows recovery after restart.

---

# Disk-Based Databases

Unlike Redis:

Traditional databases store data primarily on disk.

Examples:

- PostgreSQL
- MySQL
- MongoDB (partially memory optimized)

Disk storage provides persistence.

---

# System Calls (Syscalls)

Processes cannot directly interact with hardware.

When a process needs operations like:

- Open file
- Read file
- Write file
- Network access

it requests the Kernel using:

## System Calls

Example syscall:

```c
open()
read()
write()
mmap()
```

---

# Kernel and Operating System

Kernel responsibilities:

- Memory management
- File system management
- Process scheduling
- Hardware interaction
- Device management

---

# File Open Flow

## Step-by-Step

1. Process requests file access
2. CPU switches to kernel mode
3. Kernel checks filesystem
4. Kernel communicates with storage device
5. File data loaded into RAM

---

# DMA (Direct Memory Access)

Important concept.

When copying data from:

```text
Disk → RAM
```

CPU is NOT heavily involved in moving every byte.

Instead:

DMA controller/device drivers handle transfer.

---

# Why DMA is Important

Without DMA:

CPU would become bottleneck.

DMA improves:

- Performance
- Parallelism
- CPU efficiency

---

# Reading a File

# Read Flow

## Step 1

Process requests:

```c
read(fd, buffer, size)
```

---

## Step 2

Kernel checks if data already exists in RAM page cache.

If YES:

→ Return quickly.

If NO:

→ Fetch from disk.

---

## Step 3

Disk transfers page into RAM using DMA.

---

## Step 4

Kernel copies requested bytes into process buffer.

---

# Page Cache

Disk data loaded into RAM is stored in:

## Page Cache

Managed by kernel.

Purpose:

- Faster future reads
- Avoid repeated disk access

---

# Pages and Blocks

Storage devices work in fixed-size units.

Common page size:

```text
4 KB
```

Important:

Even if process requests:

```text
3 bytes
```

Entire page may be loaded from disk.

---

# Example

Suppose file contains:

```text
HELLO
```

Process requests:

```text
HEL
```

Disk still loads entire page into RAM page cache.

Kernel then returns only requested bytes.

---

# Writing Data

# Write Flow

Suppose:

```text
HELLO
```

becomes:

```text
BYLLO
```

---

## Step 1

Process modifies data.

---

## Step 2

Kernel updates page cache in RAM.

---

## Step 3

Page marked as:

## Dirty Page

Meaning:

RAM version differs from disk version.

---

## Step 4

Kernel later flushes dirty page to disk asynchronously.

Important:

Disk writes are often NOT immediate.

OS schedules them based on:

- Load
- Performance optimization
- IO scheduling

---

# Synchronous vs Asynchronous Writes

## Synchronous

Write completes only after disk update.

Safer but slower.

---

## Asynchronous

Write acknowledged before actual disk write completes.

Faster but slight risk if crash happens before flush.

---

# HDD vs SSD

# HDD (Hard Disk Drive)

Uses:

- Spinning magnetic disks
- Mechanical read/write heads

Latency:

~5–10 milliseconds

Problems:

- Mechanical delay
- Slower random access

---

# SSD (Solid State Drive)

Uses flash memory.

No moving parts.

Benefits:

- Faster random access
- Lower latency
- Better durability

---

# Important Correction

Incorrect:

```text
SSD uses clockwise mechanism
```

Correct:

HDD uses rotating disks.

SSD uses flash memory cells.

No spinning components.

---

# Blocks, Pages and Random Access

SSD organizes data internally into:

- Pages
- Blocks

It can access locations much faster than HDD.

Not exactly binary search internally, but much more efficient random access.

---

# Database Optimization Insight

Very important optimization principle:

```text
Disk access is expensive
```

Good databases optimize:

- Reducing disk reads
- Efficient caching
- Efficient page replacement
- Sequential IO

---

# Page Cache Example

Suppose page cache can store:

- Page 1 → Users 0–100
- Page 2 → Users 101–200

---

## Case 1

Request:

```text
User 40
```

Already in Page 1.

Result:

→ Fast memory access.

---

## Case 2

Request:

```text
User 300
```

Not in cache.

Then:

1. Existing page evicted
2. Page containing User 300 loaded from disk
3. Stored in page cache
4. Data returned

---

# Eviction Policies

When cache becomes full:

Some page must be removed.

This is called:

## Eviction

---

# Common Eviction Policies

# LRU (Least Recently Used)

Remove least recently accessed item.

Most common.

---

# LFU (Least Frequently Used)

Remove least frequently accessed item.

---

# FIFO

First inserted removed first.

---

# Why Eviction Policies Matter

Bad eviction policy:

- More disk reads
- Lower performance

Good eviction policy:

- Better cache hit ratio
- Faster database

Very important in DBMS design.

---

# Storage Engine

A storage engine is the component responsible for:

- Reading data
- Writing data
- Indexing
- Caching
- Disk management
- Concurrency handling

Examples:

| Database | Storage Engine |
|---|---|
| MySQL | InnoDB |
| MongoDB | WiredTiger |
| Redis | In-memory structures |
| PostgreSQL | Custom engine |

---

# Final Important Concepts

| Concept | Meaning |
|---|---|
| Redis | In-memory KV database |
| Heap | Dynamic RAM memory |
| Shared Memory | Shared RAM region between processes |
| mmap | Maps memory/file into process space |
| DMA | Direct disk-to-RAM transfer |
| Page Cache | Kernel RAM cache for disk pages |
| Dirty Page | RAM page modified but not flushed |
| Eviction | Removing pages from cache |
| Storage Engine | DB component managing storage |
