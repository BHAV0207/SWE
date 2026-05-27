# Advanced DBMS Architecture + Storage Engine Notes

## Page Cache, Buffer Pool, mmap, Page Structure, Slot Array, SQLite vs PostgreSQL

These notes are based on your lecture understanding, with:

* corrections where needed
* detailed explanations
* preserved analogies
* additional examples
* interview-level understanding



---

# 1. Problem Statement — Why Databases Need Their Own Memory Management

Suppose:

```txt id="4e91ab"
OS Page Cache Capacity = 10 Pages
```

And we are performing:

```sql id="c2d3d1"
JOIN users u
ON orders.user_id = users.id
```

Now suppose:

```txt id="07d6d0"
Users Table  -> 4 Pages
Orders Table -> 4 Pages
```

But page cache already contains:

```txt id="9cfb54"
2 Pages of Users
2 Pages of Orders
```

Now database needs more pages.

---

# 2. Problem with OS-Controlled Page Cache

The OS owns the page cache.

Meaning:

```txt id="8a41b8"
Database does NOT control eviction policy
```

Kernel decides:

```txt id="7f0c1b"
Which pages stay
Which pages get removed
```

---

# 3. Why This Becomes a Problem

Suppose kernel decides:

```txt id="42a2d0"
Evict Orders Pages
Load Remaining User Pages
```

But:

```txt id="5b2f4c"
JOIN operation still needs Orders pages
```

So again:

* Orders pages fetched from disk
* More disk I/O happens
* Performance decreases

---

# 4. Important Insight

You correctly concluded:

```txt id="8e3f7c"
OS scheduling is not always optimal for databases
```

Because:

* OS is generic
* Database understands query patterns better

Database knows:

* future reads
* joins
* hot pages
* index usage
* query execution plans

OS does not.

---

# 5. Biggest Bottleneck in Databases

Very important concept.

Usually:

```txt id="96d61d"
Database bottleneck = Disk I/O
```

NOT CPU.

Why?

Because:

| Component | Approx Latency |
| --------- | -------------- |
| CPU Cache | nanoseconds    |
| RAM       | ~100 ns        |
| SSD       | microseconds   |
| HDD       | milliseconds   |

Disk is thousands/millions of times slower.

Therefore databases optimize:

```txt id="a0f65a"
Minimize disk reads/writes
```

---

# 6. Solution — Database Buffer Pool / Storage Buffer

You wrote:

> database should have its own page cache

Exactly.

This is called:

# Buffer Pool

OR

# Storage Buffer

---

# 7. What is Buffer Pool?

Buffer pool is:

```txt id="658d58"
Database-managed memory cache
```

instead of relying fully on OS page cache.

---

# 8. Full Architecture

Now memory looks like:

```txt id="f01e40"
Disk
  ↓
OS Page Cache
  ↓
DBMS Buffer Pool
  ↓
SQL Operations
```

---

# 9. How It Works

Suppose query needs page.

## Step 1

DB asks OS for page.

---

## Step 2

OS loads page into:

```txt id="53f76f"
Kernel Page Cache
```

---

## Step 3

Database copies page into:

```txt id="dab4cc"
DBMS Buffer Pool
```

---

## Step 4

All future SQL operations use:

```txt id="fbb4ef"
DBMS Buffer Pool
```

NOT OS page cache directly.

---

# 10. Why Buffer Pool is Powerful

Now DBMS controls:

* eviction policy
* prefetching
* dirty page flushing
* hot page retention
* query-aware caching

---

# 11. Example of Better DB Decisions

Suppose query planner knows:

```txt id="52790e"
Orders table repeatedly accessed
```

Database can decide:

```txt id="6cb06a"
Keep Orders pages permanently hot
```

OS cannot understand SQL semantics.

---

# 12. Common DB Eviction Policies

Database buffer pools often use:

| Policy | Meaning                    |
| ------ | -------------------------- |
| LRU    | Least Recently Used        |
| LFU    | Least Frequently Used      |
| CLOCK  | Approximate LRU            |
| ARC    | Adaptive Replacement Cache |

---

# 13. Important Clarification

You wrote:

> less context switching and one less copy

Partially correct.

---

## Correct Understanding

Traditional flow:

```txt id="9d9683"
Disk
 ↓
OS Page Cache
 ↓
DB Buffer Pool
 ↓
Query Execution
```

There IS still:

* kernel involvement
* copies

But DB gains:

* smarter memory control
* reduced unnecessary disk reads

---

# 14. What Exists Inside a Database Page?

VERY IMPORTANT DBMS TOPIC.

---

# 15. Disk Data Stored in Pages

Databases store data in:

```txt id="4cb6c1"
Pages
```

Typical size:

```txt id="0c89d1"
4 KB
8 KB
16 KB
```

A page contains:

* rows
* metadata
* page header
* slot array
* free space info

---

# 16. Why Page Header Exists

You gave TCP checksum analogy — VERY GOOD analogy.

---

# 17. Checksum Analogy

Suppose network sends:

```txt id="d1c21a"
200 bytes
```

First few bytes contain:

```txt id="1fca4f"
Checksum
```

Receiver verifies:

```txt id="b9e22e"
Data not corrupted/tampered
```

---

# 18. Same Concept in Database Pages

Disk is external hardware.

Pages can become corrupted because of:

* power failure
* bad sectors
* incomplete writes
* crashes

So every DB page has:

# Page Header

containing:

* checksum
* page number
* transaction info
* free space metadata
* pointers

---

# 19. Example Page Structure

```txt id="4fa6d0"
---------------------------------
| Page Header                  |
---------------------------------
| Row Data                     |
| Row Data                     |
| Row Data                     |
---------------------------------
| Free Space                   |
---------------------------------
| Slot Array                   |
---------------------------------
```

---

# 20. Why Arrays Give O(1) Access

Your analogy is excellent.

Suppose:

```txt id="4ffb47"
int arr[10]
```

Each integer:

```txt id="3c7953"
4 bytes
```

So:

```txt id="b508fe"
arr[5]
```

can directly calculate:

```txt id="6937d6"
base_address + (5 × 4)
```

Thus:

# O(1) access

---

# 21. Problem Inside Database Rows

Rows are NOT fixed size.

Example:

| ID | Name   | Email                                             |
| -- | ------ | ------------------------------------------------- |
| 1  | Bhavya | [longemail@gmail.com](mailto:longemail@gmail.com) |
| 2  | Ansh   | [a@gmail.com](mailto:a@gmail.com)                 |

Different lengths:

* names differ
* emails differ

So rows occupy variable bytes.

---

# 22. Why Variable-Length Rows Create Problem

Suppose:

```txt id="4f7d84"
Row 1 = 30 bytes
Row 2 = 18 bytes
Row 3 = 50 bytes
```

Now:

```txt id="b7a87d"
Cannot directly calculate nth row address
```

because rows are not fixed-size like arrays.

---

# 23. Solution — Slot Array

Excellent concept.

---

# 24. What is Slot Array?

Slot array is:

```txt id="e52cf8"
Array of pointers/offsets
to rows inside page
```

---

# 25. Example

Suppose page contains:

```txt id="5a76a2"
Row A -> byte 120
Row B -> byte 180
Row C -> byte 250
```

Slot array:

```txt id="e36517"
Slot 0 -> 120
Slot 1 -> 180
Slot 2 -> 250
```

Now:

```txt id="e0ddae"
10th slot directly points to 10th row
```

So random row access becomes efficient.

---

# 26. Why Slot Arrays Are Important

Without slot arrays:

```txt id="42567f"
Need sequential scan
```

to find rows.

With slot arrays:

```txt id="14ff94"
Direct row lookup possible
```

---

# 27. Deletion Problem

Suppose:

```txt id="74bb4f"
Row 10 deleted
```

Now empty space appears.

Question:

```txt id="98a0df"
How do we reuse free space efficiently?
```

---

# 28. Free Space Management

You mentioned:

> doubly linked list of free spaces

Correct idea.

Databases maintain:

* free space maps
* free lists
* page directory structures

to track reusable regions.

---

# 29. Example

Deleted row:

```txt id="57d4d2"
Slot 10 freed
```

DB can:

* mark free
* reuse later for inserts

instead of allocating new page.

This reduces:

* fragmentation
* disk growth

---

# 30. SQLite vs PostgreSQL

Excellent topic.

---

# 31. SQLite Architecture

SQLite is:

# Embedded Database

Meaning:

```txt id="7c94df"
SQLite is a library
NOT a separate DB server process
```

---

# 32. SQLite Stores Data in Single File

Usually:

```txt id="d62393"
entire database = one file
```

Example:

```txt id="ca9d17"
app.db
```

contains:

* tables
* indexes
* metadata

everything together.

---

# 33. PostgreSQL Architecture

PostgreSQL is different.

It runs as:

# Separate Server Process

Applications communicate using:

* TCP
* sockets
* connection URLs

---

# 34. SQLite vs PostgreSQL Flow

## SQLite

```txt id="69c18f"
Spring App
   ↓
SQLite Library (inside process)
   ↓
Kernel
   ↓
Disk
```

No separate DB process.

---

## PostgreSQL

```txt id="f2e3c2"
Spring App
   ↓
TCP Connection
   ↓
PostgreSQL Process
   ↓
Kernel
   ↓
Disk
```

Separate DB server exists.

---

# 35. Why SQLite is Fast for Small Apps

Because:

* no network overhead
* no separate process communication
* no socket transfer

Everything happens inside same process.

Perfect for:

* mobile apps
* browsers
* embedded systems
* local storage

---

# 36. mmap Memory Benefit

VERY IMPORTANT.

Your intuition is mostly correct.

---

# 37. Traditional Read Path

Normally:

```txt id="3f7b2d"
Process
 ↓ syscall
Kernel
 ↓
Page Cache
 ↓
Copy to Process Memory
```

There is:

* syscall overhead
* extra copy

---

# 38. mmap Optimization

With mmap:

```txt id="8a0d4b"
File pages mapped directly
into process virtual memory
```

Meaning:

```txt id="930e67"
Process can directly access
page cache memory
```

---

# 39. Biggest Benefit of mmap

Reduces:

* extra copies
* syscall overhead
* context switching

---

# 40. Important Clarification About mmap

You wrote:

> process can access page cache directly without syscall

Partially correct.

The initial `mmap()` itself IS a syscall.

But after mapping:

```txt id="c34b2f"
Normal memory reads can happen
without repeated read() syscalls
```

This is why mmap can be very fast.

---

# 41. mmap Internal Working

Kernel maps file-backed pages into:

```txt id="948ee7"
Process Virtual Address Space
```

So process thinks:

```txt id="49e2b0"
"I am reading normal memory"
```

But data actually backed by:

* disk file
* OS page cache

---

# 42. mmap Example

Without mmap:

```txt id="5475d3"
read() → kernel copy → process buffer
```

With mmap:

```txt id="0dc775"
Direct memory access via mapped pages
```

Potentially zero-copy access.

---

# 43. Why Databases Care So Much About mmap

Because databases are obsessed with:

```txt id="cb7304"
Reducing disk I/O
Reducing copies
Reducing context switches
Reducing latency
```

---

# 44. Final Big Picture

# Complete DB Architecture

```txt id="f03f1d"
Application
    ↓
DBMS
    ↓
Buffer Pool
    ↓
OS Page Cache
    ↓
DMA
    ↓
SSD/HDD
```

---

# 45. Most Important Interview-Level Insight

Most beginners think:

```txt id="05f7c9"
Database performance = CPU speed
```

Wrong.

Usually:

# Database performance = Memory + Disk Optimization

That is why:

* Redis exists
* Buffer pools exist
* mmap exists
* Page cache exists
* Slot arrays exist
* SSD optimizations exist

---

# 46. Final Key Concepts to Remember

## Buffer Pool

Database-controlled memory cache.

---

## Page Cache

OS-controlled disk cache.

---

## Slot Array

Array of row pointers/offsets.

---

## mmap

Maps file pages directly into process memory.

---

## Page Header

Contains:

* checksum
* metadata
* pointers

---

## SQLite

Embedded library database.

---

## PostgreSQL

Separate DB server process.

---

# 47. One Very Important Real-World Insight

Modern databases are basically:

```txt id="df7355"
Highly optimized memory-management systems
that happen to store data
```

Most of their engineering effort goes into:

* caching
* memory layouts
* page management
* write optimization
* reducing disk access
* concurrency control
* buffer management

NOT just SQL parsing.
