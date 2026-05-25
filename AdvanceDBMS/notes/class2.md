# DBMS Architecture + Storage Engine Notes

# Redis, Processes, Memory Mapping, Heap, Stack & Shared Memory

---

# 1. What is Redis?

Redis is an **in-memory database**.

This means:
- Data primarily lives inside RAM.
- Since RAM is very fast, Redis operations are extremely fast.

Redis is commonly used for:
- Caching
- Session storage
- Pub/Sub systems
- Queues
- Real-time analytics
- Rate limiting

---

# 2. Redis as a Key-Value Store

Redis is a:

# Key-Value (KV) Database

Example:

```json
{
  "name": "Bhavya",
  "age": 22
}
```

Internally Redis uses optimized data structures like:
- HashMaps
- Linked Lists
- Skip Lists
- Sets
- Streams
- Tries

For basic key-value storage:
- Redis heavily relies on HashMaps internally.

---

# 3. What is a Process?

Whenever a program runs:
- the Operating System creates a process.

Examples:
- Chrome
- VS Code
- Redis
- Spotify

Each process gets:
- CPU resources
- its own memory space
- virtual memory mapping

Example:

```text
Redis Process
Chrome Process
VS Code Process
```

All are isolated from each other.

---

# 4. Memory Layout of a Process

Every process generally contains:

```text
-------------------------
| Stack                |
-------------------------
|                       |
| Free Space            |
|                       |
-------------------------
| Heap                  |
-------------------------
| Data Segment          |
-------------------------
| Code/Text Segment     |
-------------------------
```

---

# 5. Stack Memory

The stack is:
- very fast
- temporary
- automatically managed

Used for:
- function calls
- local variables
- execution frames

Example:

```js
function add() {
   let x = 10;
}
```

`x` is usually stored in stack memory.

Characteristics:
- Fast allocation/deallocation
- Small in size
- LIFO (Last In First Out)

---

# 6. Heap Memory

Heap memory is:
- dynamic
- larger than stack
- slightly slower

Used for:
- objects
- arrays
- HashMaps
- dynamic data structures

Example:

```js
let user = {
   name: "Bhavya"
}
```

The object is stored in heap memory.

---

# 7. Important Correction About Heap

Incorrect statement:

```text
Heap is persistent
```

Correct understanding:

```text
Heap survives only while process is alive.
```

When process exits:
- heap memory is destroyed.

True persistence means:
- data survives after process shutdown.

Persistent storage examples:
- SSD
- HDD
- database files

Redis can also persist data using:
- RDB snapshots
- AOF logs

---

# 8. Physical Memory vs Virtual Memory

# Physical Memory
Actual RAM hardware.

Example:

```text
16 GB RAM installed in system
```

---

# Virtual Memory

An abstraction created by the OS.

Every process thinks:
> "I own my own memory."

Even though all processes share the same RAM physically.

---

# 9. Virtual Address Space

Every process has:
- its own virtual address space
- its own page tables

The OS maps:

```text
Virtual Address -> Physical RAM Address
```

using:
- page tables
- MMU (Memory Management Unit)

---

# 10. Example of Virtual Memory Mapping

Suppose:

## Process A

```text
Virtual Address 0x1000 -> Physical Address 5000
```

## Process B

```text
Virtual Address 0x1000 -> Physical Address 9000
```

Notice:
- same virtual address
- different physical memory

This creates:
# Process Isolation

---

# 11. Why Processes Cannot Access Each Other's Heap

Suppose:

```text
Process A -> has HashMap in heap
Process B -> wants to access it
```

Normally:
# NOT POSSIBLE ❌

Because:
- every process has isolated virtual memory
- page tables are different

Even if virtual addresses look same:
- physical mappings are different.

---

# 12. Why Process Isolation is Important

Without isolation:
- apps could corrupt each other
- security would break
- crashes would spread

Isolation gives:
- security
- stability
- fault tolerance

---

# 13. The Problem

Sometimes processes NEED to communicate.

Examples:
- databases
- browsers
- Redis clients
- IPC systems

Question:
> How can processes share data safely?

---

# 14. Shared Memory

Solution:
# Shared Memory

The OS allows creation of:
- shared memory regions

Here:
- multiple processes map the SAME physical memory pages.

---

# 15. mmap (Memory Mapping)

`mmap()` is a system call.

It is used to:
- map files into memory
- create shared memory regions
- map anonymous memory

---

# 16. Shared mmap Region Example

Normally:

```text
Process A Heap != Process B Heap
```

But with shared memory:

```text
Process A Virtual Address 0x2000 ----\
                                       -> SAME Physical RAM
Process B Virtual Address 0x9000 ----/
```

Both virtual addresses point to:
# same physical memory

Now:
- both processes can read/write same memory.

---

# 17. Important Clarification About mmap

Incorrect:

```text
mmap = shared memory
```

Correct:

```text
mmap is a mechanism/system call
used to create memory mappings.
```

Shared memory is:
- the result/concept.

mmap is:
- one way to implement it.

---

# 18. Memory Map

A memory map is:
> the layout of memory regions for a process.

Example:

```text
----------------------
| Stack              |
----------------------
| Shared mmap region |
----------------------
| Heap               |
----------------------
| Data Segment       |
----------------------
| Code Segment       |
----------------------
```

Every region has:
- start address
- end address
- permissions

Example permissions:
- Read
- Write
- Execute

---

# 19. Memory Map Regions

Memory regions are specific blocks of memory.

Examples:
- Stack region
- Heap region
- Shared memory region
- Code region

Each region serves different purposes.

---

# 20. Real-World Uses of mmap

mmap is heavily used in:
- Redis
- PostgreSQL
- MongoDB
- Kafka
- Browsers
- Operating Systems

Benefits:
- fast file access
- zero-copy optimizations
- shared memory communication
- efficient caching

---

Your notes are going in a very strong direction.
Most of the concepts are correct, but there are:

* a few wording issues
* some technical inaccuracies
* some missing low-level explanations

The biggest thing:
You are now entering:

# Operating Systems + DB Internals + Storage Engine territory

which is excellent for backend/system design interviews.

Your uploaded notes are here: 

Below are the important corrections and clarifications you should add to your notes.

---

# 1. Redis Shared Memory Part → Slightly Incorrect

You wrote:

```text
all the processes can read data through redis's heap using the shared memory
```

This is NOT how Redis normally works.

Correct version:

```md
Redis clients do NOT directly access Redis heap memory.

Clients communicate with Redis using:
- TCP sockets
- Unix sockets
- Redis protocol

Redis itself stores data inside its own process heap.
```

Why?

Because:

* Redis is a separate process
* process isolation prevents direct heap sharing

So normally:

```text
Client Process ---> Socket ---> Redis Process
```

NOT:

```text
Client Process ---> Redis Heap directly
```

---

# 2. Redis Latency

You wrote:

```text
roughly 100 nano sec
```

More accurate:

```md
RAM access latency is typically:
- ~50ns to 150ns

Redis operations are usually:
- microseconds level
```

Because:

* networking
* parsing
* scheduling
* CPU execution

also take time.

---

# 3. System Calls (Syscalls)

Your understanding is GOOD.

Cleaner version:

```md
Processes cannot directly interact with hardware.

Whenever a process wants to:
- open a file
- read from disk
- create a socket
- allocate memory

it asks the kernel using a System Call (syscall).
```

Examples:

* open()
* read()
* write()
* mmap()

---

# 4. CPU Does NOT Talk Directly to Disk

Your idea is correct but wording should improve.

Correct flow:

```text
Process
   ↓
System Call
   ↓
Kernel
   ↓
Device Driver
   ↓
SSD/HDD
```

---

# 5. DMA (Direct Memory Access)

Your understanding is GOOD.

Cleaner explanation:

```md
DMA allows devices like SSDs/NICs to copy data directly into RAM
without constantly involving the CPU.

Without DMA:
- CPU would become bottlenecked
- copying large files would heavily waste CPU cycles
```

Important:
CPU still:

* initiates operation
* configures DMA

But actual bulk copying:

* handled by DMA controller/hardware.

---

# 6. File Read Flow → Very Important

Your understanding is VERY GOOD here.

Proper flow:

# File Read Flow

```text
Process
   ↓
read() syscall
   ↓
Kernel
   ↓
Check Page Cache
   ↓
If page absent:
    SSD/HDD -> DMA -> RAM Page Cache
   ↓
Kernel copies requested bytes to process buffer
   ↓
Process receives data
```

---

# 7. Important Clarification About Page Cache

You understood this WELL.

Key concept:

```md
Disk IO happens in pages/blocks,
NOT individual bytes.
```

Industry standard:

* page size = 4KB (commonly)

Even if process asks:

```text
give me first 3 bytes
```

OS usually loads:

```text
entire 4KB page
```

into:

# Page Cache

Then only required bytes are returned.

This improves:

* performance
* locality
* future reads

---

# 8. Very Important Correction

You wrote:

```text
kernel is not responsible for copying data to process memory
```

This is incorrect.

Correct version:

```md
The kernel IS responsible for managing the copy operation.

Usually:
1. Disk -> Page Cache
2. Page Cache -> Process Buffer
```

This second copy is often performed by kernel-managed memory operations.

---

# 9. Page Cache

Excellent topic.

Definition:

```md
Page Cache is a RAM region used by the kernel
to cache disk pages.
```

Benefits:

* avoids repeated disk reads
* improves performance drastically

---

# 10. Writing Data Flow

Your understanding is mostly correct.

Cleaner version:

# File Write Flow

```text
Process
   ↓
write() syscall
   ↓
Kernel updates Page Cache
   ↓
Page marked DIRTY
   ↓
Later:
Kernel flushes dirty pages to SSD/HDD
```

Important:

# Writes are often asynchronous

Meaning:

* process may continue
* actual disk write happens later

---

# 11. Dirty Pages

VERY IMPORTANT DB concept.

Definition:

```md
Dirty Page:
A page in RAM whose contents differ from disk.
```

Meaning:

* RAM has latest version
* disk still has old version

Later:

* OS flushes dirty page to disk.

---

# 12. SSD Explanation Needs Correction

You mixed HDD and SSD.

---

# HDD (Hard Disk Drive)

Uses:

* spinning magnetic disk
* mechanical arm

Slow because:

* physical movement required

Latency:

* ~5ms to 10ms

---

# SSD (Solid State Drive)

NO spinning parts.

Uses:

* flash memory cells

Much faster because:

* electronic access
* no mechanical movement

Latency:

* microseconds

---

# 13. Block/Page Structure

You are conceptually right.

Storage devices operate in:

* blocks
* pages

OS reads:

* chunks/pages
  not individual bytes directly from disk.

---

# 14. Eviction Policy → VERY IMPORTANT

Excellent understanding.

Suppose Page Cache capacity:

```text
Page 1 -> users 0-100
Page 2 -> users 100-200
```

Request:

```text
User 40
```

FAST:

* already cached.

Request:

```text
User 300
```

MISS:

* must fetch new page from disk.

If cache full:

# eviction happens

One page removed.

New page inserted.

---

# 15. Eviction Policies

VERY IMPORTANT FOR DATABASES.

Common policies:

## LRU

Least Recently Used

## LFU

Least Frequently Used

## FIFO

First In First Out

## CLOCK

Efficient LRU approximation

---

# 16. Important Realization

You correctly identified:

```text
Database optimization is mostly:
minimizing disk access.
```

THIS IS HUGE.

Because:

# Disk IO is expensive.

Databases optimize:

* caching
* page locality
* indexing
* prefetching
* buffer pools

to avoid disk reads.

---

# 17. One Very Important Missing Concept

You are basically describing:

# Buffer Pool / Buffer Cache

This is core to DB storage engines.

Examples:

* InnoDB Buffer Pool
* PostgreSQL Shared Buffers

These are:

* intelligent RAM caches for database pages.

---

# 18. Most Important Big Picture

Your notes are slowly building toward:

# How Databases Actually Work Internally

Core ideas:

* RAM vs Disk
* Page Cache
* mmap
* Virtual Memory
* Syscalls
* DMA
* Buffer Pools
* Eviction Policies
* Storage Engines

This is literally:

* DBMS internals
* OS internals
* Systems engineering foundations.
