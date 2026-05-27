# DBMS Architecture + Storage Engine Notes (Redis, Memory, OS, Disk, Page Cache)

# 1. Introduction to Redis

## What is Redis?

Redis is an **in-memory database**.

That means:

* The primary data of Redis lives inside **RAM**
* Because RAM is extremely fast, Redis operations are very fast
* Redis is mainly used for:

  * caching
  * session storage
  * pub/sub systems
  * rate limiting
  * fast lookups
  * leaderboards
  * queues

Redis is generally called a:

* **Key-Value (KV) store**
* **In-memory datastore**
* **Data structure server**

---

# 2. Redis Internally Uses Data Structures

You wrote:

> Redis is a KV storage that is hashmap

This is mostly correct.

Internally Redis stores data in memory using structures like:

* HashMaps
* Linked Lists
* Skip Lists
* Sets
* Sorted Sets
* Tries
* Streams

Example:

```txt
SET user:1 "Bhavya"
```

Internally:

```txt
Key   -> user:1
Value -> "Bhavya"
```

Stored inside memory structures.

---

# 3. Process Memory — Stack vs Heap

You wrote:

> stack is fast and temporary and heap is slow and persistent

This needs correction.

## Correct Understanding

| Memory Area | Purpose                         | Speed           | Lifetime              |
| ----------- | ------------------------------- | --------------- | --------------------- |
| Stack       | Function calls, local variables | Very fast       | Automatically cleaned |
| Heap        | Dynamically allocated memory    | Slightly slower | Exists until freed    |

The heap is **NOT persistent**.

Persistence means:

* data survives process restart/system reboot

Heap memory disappears when:

* process dies
* machine shuts down

Redis heap data also disappears unless Redis persistence mechanisms are used.

---

# 4. Understanding Processes in RAM

Suppose there are two processes:

```txt
Process A
Process B
```

Process A has:

```txt
HashMap in Heap
```

You asked:

> Can Process B directly access Process A's heap?

Answer:

❌ NO.

Processes are isolated from each other.

---

# 5. Why Processes Cannot Access Each Other’s Memory

This is because of:

* Virtual Memory
* Memory Protection

---

# 6. Virtual Memory vs Physical Memory

This part of your understanding is very good.

## Physical Memory

This is the actual RAM hardware.

Example:

```txt
RAM chip inside computer
```

---

## Virtual Memory

Every process gets its own "fake" address space.

Example:

Process A:

```txt
Address 0x1000 -> Physical location X
```

Process B:

```txt
Address 0x1000 -> Physical location Y
```

Even though both see:

```txt
0x1000
```

They actually point to different physical locations.

This mapping is maintained by:

* OS
* MMU (Memory Management Unit)

using:

* Page Tables

---

# 7. Why This Isolation Exists

This isolation is VERY important.

Otherwise:

* one process could corrupt another process
* one app could steal another app's data
* system crashes would happen frequently

Imagine:

```txt
Chrome changing WhatsApp memory
```

That would be disastrous.

---

# 8. Shared Memory / mmap

You wrote:

> solution is shared space in RAM called mmap/shared memory

Correct idea.

---

## What is Shared Memory?

OS allows multiple processes to map the same physical memory.

So:

```txt
Process A Virtual Address ---> SAME Physical Memory
Process B Virtual Address ---> SAME Physical Memory
```

Now both processes can access same data.

---

# 9. mmap (Memory Mapping)

`mmap()` is a system call.

It can:

* map files into memory
* create shared memory between processes

Example:

```c
mmap(...)
```

---

# 10. Important Clarification About Redis

You wrote:

> all processes can read Redis heap using shared memory

This is NOT exactly correct.

Redis does NOT expose its heap directly.

Instead:

* Redis runs as a separate server process
* Other applications communicate through:

  * TCP sockets
  * Unix sockets

Example:

```txt
NodeJS App ---> Redis Server
Python App ---> Redis Server
Java App ---> Redis Server
```

They communicate through network/socket APIs.

NOT by directly reading Redis heap memory.

---

# 11. Redis is Mostly Single Threaded

You wrote:

> mainly runs as a single main process

Mostly correct.

Modern Redis uses:

* single-threaded command execution
* some background threads for:

  * I/O
  * persistence
  * replication

Why single-threaded?

Because:

* avoids locking complexity
* RAM operations are already extremely fast

---

# 12. Why Redis is Fast

Redis is fast because:

## Reason 1: RAM Access

RAM latency:

```txt
~100 nanoseconds
```

Disk latency:

```txt
SSD -> microseconds
HDD -> milliseconds
```

Huge difference.

---

## Reason 2: No Complex Disk Reads

Traditional DB:

```txt
Disk -> RAM -> Process
```

Redis:

```txt
RAM directly
```

No disk seek needed for normal operations.

---

# 13. Problem with Redis — Persistence

Very important point.

Since Redis stores data in RAM:

```txt
Power off = data loss
```

unless persistence is enabled.

---

# 14. Redis Persistence Mechanisms

Redis solves persistence using:

## AOF (Append Only File)

Every write operation is appended to a log file.

Example:

```txt
SET user Bhavya
INCR count
```

After restart Redis replays commands.

---

## RDB Snapshots

Redis periodically stores memory snapshot to disk.

Example:

```txt
Dump complete memory every 5 minutes
```

---

# 15. System Calls

You wrote:

> when process does not know how to open file it asks kernel

Correct idea.

Applications cannot directly access hardware.

They request OS through:

* System Calls (syscalls)

Example:

```c
open()
read()
write()
mmap()
socket()
```

---

# 16. File Read Flow (Very Important)

Your understanding is mostly correct.

Let us cleanly structure it.

---

# 17. Reading a File — Complete Flow

Suppose application wants:

```txt
read("data.txt")
```

---

## Step 1 — Process Requests Read

Application calls:

```c
read()
```

This is a syscall.

---

## Step 2 — CPU Switches to Kernel Mode

OS kernel takes control.

---

## Step 3 — Kernel Checks Page Cache

Before going to disk:

OS checks:

```txt
"Is file already in RAM?"
```

inside:

# Page Cache

---

# 18. What is Page Cache?

Page cache is:

```txt
RAM used by OS to cache disk pages
```

This is one of the MOST IMPORTANT optimizations in databases.

---

# 19. Pages and Blocks

You wrote:

> hardware cannot get random 3 bytes

Correct idea.

Disk reads happen in blocks/pages.

Typical page size:

```txt
4 KB
```

Even if you request:

```txt
3 bytes
```

OS loads:

```txt
Entire 4 KB page
```

into page cache.

---

# 20. Why Read Entire Pages?

Because disk hardware is optimized for block access.

Reading tiny bytes individually would be extremely slow.

---

# 21. Example of Page Loading

Suppose:

```txt
Page Size = 4 KB
```

File contains:

```txt
Users 0–100
```

User requests:

```txt
User 40
```

OS loads entire page in the page cache 

Then returns only requested bytes to the process 

---

# 22. What if Page Not in Cache?

This is called:

# Cache Miss

Then:

```txt
Disk -> RAM(Page Cache)
```

using DMA.

---

# 23. DMA (Direct Memory Access)

You wrote:

> copying does not go through CPU

Partially correct.

Better understanding:

DMA allows hardware devices to transfer data directly to RAM without CPU copying every byte manually.
basically the drivers does the work of tranvferring the dato from the disc to the page cache of the kernel 

CPU still:

* initiates operation
* configures DMA controller

But bulk transfer is handled by hardware.

This reduces CPU overhead.

---

# 24. Disk Read Path Summary

```txt
Process
   ↓
System Call
   ↓
Kernel
   ↓
Check Page Cache
   ↓
(if miss)
SSD/HDD → DMA → RAM(Page Cache)
   ↓
Kernel copies requested bytes
   ↓
Process receives data
```

---

# 25. Writing Data — Complete Flow

Your understanding is good.

Suppose page contains:

```txt
HELLO
```

Process wants:

```txt
BYLLO
```

(Modify first bytes)

---

# 26. Write Flow

## Step 1

Process issues:

```c
write()
```
each process have its own mwmory and in that memory it changes the bytes and then makes a sys call to the kernel about the change  
---

## Step 2

Kernel updates page inside page cache.

NOT immediately on disk.

---

# 27. Dirty Pages

Modified pages are marked:

# Dirty

Meaning:

```txt
RAM version != Disk version
```

---

# 28. Flush to Disk

Later OS flushes dirty pages to disk.

This is asynchronous.

OS decides timing based on:

* load
* memory pressure
* scheduling

---

# 29. Why Async Writes are Faster

If every write waited for disk:

```txt
Application becomes very slow
```

Instead:

```txt
Write to RAM quickly
Flush later
```

Huge performance boost.

---

# 30. HDD vs SSD

Your notes mixed SSD and HDD a little.

Let us fix that.

---

# 31. HDD (Hard Disk Drive)

Uses:

* spinning magnetic platters
* mechanical arm

Operations require:

* seek time
* rotational latency

Typical latency:

```txt
5–10 ms
```

Slow because mechanical movement exists.

---

# 32. SSD (Solid State Drive)

No moving parts.

Uses:

* flash memory

Very fast random access.

Latency:

```txt
microseconds
```

Much faster than HDD.

---

# 33. Database Optimization Goal

Excellent point from your notes.

Most DB optimization is about:

# Reducing Disk I/O

Because:

```txt
RAM is fast
Disk is slow
```

Databases try to:

* cache aggressively
* reduce page fetches
* optimize reads/writes

---

# 34. Page Cache Example

Suppose page cache can hold:

```txt
2 pages
```

Pages:

```txt
Page1 -> Users 0–100
Page2 -> Users 100–200
```

Request:

```txt
User 40
```

Fast.

Already in RAM.

---

# 35. Cache Miss Example

Now request:

```txt
User 300
```

Need:

```txt
Page3
```

But cache full.

So OS evicts one page.

Then loads Page3 from disk.

---

# 36. Eviction Policies

Very important topic.

Eviction policy decides:

```txt
Which page should be removed?
```

Common algorithms:

| Policy | Meaning               |
| ------ | --------------------- |
| LRU    | Least Recently Used   |
| LFU    | Least Frequently Used |
| FIFO   | First In First Out    |
| CLOCK  | Approximate LRU       |

---

# 37. Important DB Design Insight

You wrote:

> design your own eviction policy

Very important insight.

Many databases implement custom caching because:

* OS page cache may not be optimal
* DB understands access patterns better

Example:

* PostgreSQL has shared buffers
* InnoDB has buffer pool

---

# 38. mmap vs Traditional Read

Traditional read:

```txt
Disk -> Page Cache -> Process Buffer
```

Extra copy exists.

---

Using mmap:

```txt
Disk Page mapped directly into process virtual memory
```

Potentially fewer copies.

Very important optimization in DB systems.

---

# 39. Final Big Picture

# Full Architecture Flow

```txt
Application Process
       ↓
System Calls
       ↓
Kernel / OS
       ↓
Page Cache (RAM)
       ↓
DMA / Drivers
       ↓
SSD / HDD
```

---

# 40. Final Core Concepts to Remember

## Redis

* In-memory DB
* Extremely fast
* Uses RAM
* Needs persistence mechanisms

---

## Heap vs Stack

* Stack → local variables/functions
* Heap → dynamic memory
* Heap is NOT persistent

---

## Virtual Memory

* Every process gets isolated memory
* Processes cannot access each other directly

---

## Shared Memory / mmap

* Multiple processes can share same physical memory

---

## Page Cache

* OS caches disk pages in RAM
* Huge performance optimization

---

## DMA

* Hardware-assisted memory transfer
* Reduces CPU overhead

---

## Dirty Pages

* Modified RAM pages not yet written to disk

---

## SSD vs HDD

* SSD much faster
* Databases optimize to reduce disk access

---

# 41. One Important Interview-Level Insight

Many beginners think:

```txt
Database speed = CPU speed
```

Wrong.

Usually:

# Database performance bottleneck = Disk I/O

That is why:

* caching
* indexing
* page cache
* buffer pools
* Redis
* mmap
* SSD optimization

all exist.

---

# 42. One Small Correction About “Persistence”

You associated:

```txt
Heap = persistent
```

Correct mental model:

| Storage | Persistent? |
| ------- | ----------- |
| Stack   | ❌           |
| Heap    | ❌           |
| RAM     | ❌           |
| SSD/HDD | ✅           |

Persistence means:

```txt
Data survives reboot/crash
```
