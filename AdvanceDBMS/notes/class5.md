# Advanced DBMS Architecture + Storage Engine Notes

## Buffer Pool, Eviction Policies, Page Layouts, Indexing, mmap, fsync, PostgreSQL vs InnoDB

---

# 1. Storage Buffer / Buffer Pool and Eviction Policies

In previous discussions, we learned:

```txt
OS already has a Page Cache
```

But databases still create their own memory layer called:

* Buffer Pool
* Storage Buffer
* DB Cache

Why?

Because the OS eviction policy is generic and not optimized for database workloads.

---

# 2. Problem with OS Page Cache

Suppose:

```txt
OS Page Cache Capacity = 3 Pages
```

Currently loaded pages:

```txt
Page 1
Page 2
Page 3
```

And the database also copied those pages into its own:

```txt
Storage Buffer / Buffer Pool
```

Now a query requests:

```txt
Page 100
```

Since OS page cache only allows 3 pages:

```txt
OS evicts one old page
```

Suppose it removes:

```txt
Page 2
```

and loads:

```txt
Page 100
```

---

# Important Insight

Very important thing:

```txt
OS evicting a page from its page cache
DOES NOT mean
DB buffer pool also loses that page
```

Because DBMS has its own copy.

So database still may have:

```txt
Page 1
Page 2
Page 3
```

inside its own buffer pool.

This is one of the biggest advantages of DB-managed memory.

---

# 3. Why Databases Want Their Own Buffer Pool

Because databases understand:

* joins
* indexes
* hot pages
* frequently used data
* future query patterns

better than the OS.

The OS only sees:

```txt
"Some process is reading pages"
```

It does not understand SQL semantics.

---

# 4. Biggest DB Optimization Goal

The largest bottleneck in databases is usually:

# Disk I/O

NOT CPU.

Because:

| Component | Approx Latency |
| --------- | -------------- |
| CPU Cache | nanoseconds    |
| RAM       | ~100 ns        |
| SSD       | microseconds   |
| HDD       | milliseconds   |

Disk access is extremely slow compared to RAM.

Therefore databases are obsessed with:

```txt
Reducing disk reads and writes
```

---

# 5. Database Page Size vs OS Page Size

OS usually uses:

```txt
4 KB page size
```

But databases can choose their own page size.

Examples:

| Database       | Page Size |
| -------------- | --------- |
| PostgreSQL     | 8 KB      |
| InnoDB (MySQL) | 16 KB     |

---

# 6. Important Understanding

Suppose DB page size is:

```txt
8 KB
```

But OS page size is:

```txt
4 KB
```

That means:

```txt
1 DB Page = 2 OS Pages
```

---

# 7. PostgreSQL Heap Layout

PostgreSQL uses something called:

# Heap Layout

This DOES NOT mean heap memory.

It means:

```txt
Rows are stored without strict ordering
```

Data insertion is random.

Example:

```txt
Page 1:
Row 10
Row 2
Row 100
Row 55
```

Rows are NOT physically sorted.

---

# Benefits of Heap Layout

* Fast inserts
* Simpler storage
* Less row shifting

---

# Drawback

Reads may become less cache-friendly.

---

# 8. InnoDB Clustered Index Layout

InnoDB uses:

# Clustered Index Storage

Meaning:

```txt
Rows physically stored in primary key order
```

Example:

```txt
Page 1:
1
2
3
4

Page 2:
5
6
7
```

Now suppose:

```txt
Row 3 deleted
```

Then rows shift:

```txt
4 moves up
5 moves from page 2 to page 1
6 shifts
...
```

This keeps physical ordering maintained.

---

# Benefit of Clustered Layout

Range queries become very fast.

Example:

```sql
SELECT * FROM users
WHERE id BETWEEN 100 AND 200
```

because rows are physically close together.

---

# Drawback

Updates and deletes may cause:

* row shifting
* page splits
* fragmentation

which are expensive.

---

# 9. Write Optimization Problem

Suppose:

```txt
1000 rows updated
```

Naive approach:

```txt
1000 system calls
1000 disk operations
```

Very inefficient.

---

# 10. Solution — Batch Writes

Database batches updates.

Instead of:

```txt
write row 1
write row 2
write row 3
```

DB does:

```txt
Collect updates
Flush together
```

This dramatically reduces:

* syscall overhead
* disk overhead
* context switching

---

# 11. Dirty Pages

When DB modifies pages in memory:

```txt
RAM version ≠ Disk version
```

Those pages are marked:

# Dirty Pages

---

# 12. fsync()

You wrote:

> single flush call is called fsync

Partially correct.

Important clarification:

`fsync()` is a syscall that tells OS:

```txt
"Force all pending writes to disk NOW"
```

Meaning:

```txt
Dirty pages must actually reach storage
```

This is critical for:

* crash safety
* durability
* ACID guarantees

---

# 13. Large Page Size Tradeoff

Suppose DB page size:

```txt
2 MB
```

Benefits:

* fewer disk reads
* better sequential reads
* better throughput

Because:

```txt
1 large read > many tiny reads
```

---

# Drawback

Even tiny update causes:

```txt
Huge page rewrite
```

Example:

```txt
Change 10 bytes
Need to rewrite 2 MB page
```

Very expensive for writes.

---

# 14. Sequential Flooding Problem

VERY IMPORTANT INTERVIEW TOPIC.

---

## What is Sequential Flooding?

Suppose page cache capacity:

```txt
3 pages
```

Pages currently:

```txt
1
2
3
```

Now query scans huge table:

```txt
4 5 6 7 8 9 ...
```

Each new page replaces old pages.

Eventually:

```txt
1 2 3 all evicted
```

even though they may be important hot pages.

This is called:

# Sequential Flooding

Large sequential scans flood the cache and destroy useful cached data.

---

# Why It Is Dangerous

After flooding:

```txt
Important frequently-used pages lost
```

Future queries become slower.

---

# DB Solutions

Databases solve this using:

* smarter eviction
* scan-resistant caches
* separate buffer regions
* midpoint insertion
* CLOCK algorithms

---

# 15. PostgreSQL Clock Sweep Algorithm

PostgreSQL uses:

# CLOCK-SWEEP

an approximation of LRU.

---

# Basic Idea

Each page has:

```txt
Usage Counter
```

Suppose:

| Page | Usage Count |
| ---- | ----------- |
| P1   | 10          |
| P2   | 9           |
| P3   | 5           |
| P4   | 2           |
| P5   | 1           |

A circular pointer ("clock hand") moves continuously.

---

# Working

Clock hand checks pages one by one.

If page used recently:

```txt
Usage count decreases slowly
```

Unused pages eventually reach:

```txt
0
```

Then they become eviction candidates.

---

# Why CLOCK Better than Pure LRU

Pure LRU expensive to maintain.

CLOCK gives:

* near-LRU performance
* lower overhead
* better scalability

---

# 16. Indexing Problem

Without indexes:

```txt
Need full page scans
```

Example:

```sql
SELECT * FROM users
WHERE id = 5000
```

Without index:

```txt
Scan every page
Scan every row
```

Very slow.

---

# 17. Initial Indexing Idea

You mentioned:

```txt
key → page mapping
```

Excellent intuition.

Example:

```txt
100 → Page 5
200 → Page 8
300 → Page 12
```

This avoids scanning every page.

---

# Problem

Huge metadata storage.

Suppose:

```txt
1 billion records
```

Even tiny metadata becomes massive.

---

# 18. Better Solution — Trees

Databases needed:

* ordered structure
* fast search
* low memory
* balanced performance

Solution:

# Balanced Trees

especially:

* B Trees
* B+ Trees

NOT usually Red-Black Trees for disk indexes.

---

# 19. Important Correction

You wrote:

> best solution was red-black tree

Small correction:

In-memory structures often use:

* Red-Black Trees
* AVL Trees

BUT databases mostly use:

# B Trees / B+ Trees

because they are optimized for disks.

---

# 20. Why Red-Black Trees Not Ideal for Disk

Red-black trees:

```txt
Binary tree
2 children per node
```

This causes:

```txt
Too many disk reads
```

because tree height becomes large.

---

# 21. Why B+ Trees Are Powerful

B+ trees allow:

```txt
Hundreds/thousands of keys per node
```

So tree height stays very small.

Example:

```txt
1 Billion Rows
→ Height maybe only 3-4
```

Meaning:

```txt
Only 3-4 page reads
```

to find data.

Massive optimization.

---

# 22. B+ Tree Structure

Example:

```txt
                [100 | 200]
               /      |      \
        <100      100-200     >200
```

Each node corresponds to a page.

Leaf nodes contain:

* actual row pointers
* data references

---

# 23. Why B+ Trees Perfect for Databases

They optimize:

* disk seeks
* range scans
* sequential reads
* cache locality

---

# 24. mmap Memory Benefits

Traditional read flow:

```txt
Process
 ↓ syscall
Kernel
 ↓
Page Cache
 ↓
Copy to Process Buffer
```

Extra copy exists.

---

# 25. mmap Optimization

Using:

```c
mmap()
```

Kernel maps file pages directly into:

```txt
Process Virtual Memory
```

Now process accesses memory directly.

---

# Biggest Benefits

* fewer copies
* fewer syscalls
* reduced context switching
* faster reads

---

# Important Clarification

The initial:

```txt
mmap()
```

itself IS a syscall.

But after mapping:

```txt
Memory accesses behave like normal RAM reads
```

without repeated `read()` syscalls.

---

# 26. Final Architecture Summary

```txt
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

# 27. Most Important Interview Insight

Modern databases are basically:

```txt
Highly optimized memory-management systems
that happen to store data
```

Most complexity exists because of:

* minimizing disk I/O
* caching efficiently
* balancing reads/writes
* concurrency
* crash recovery
* indexing
* page management

NOT because SQL is difficult.




=> Storage Buffer + eviction policy 
-> In the previous classes, we have discussed several times about the eviction policies of OS and the storage buffer that a database should have so that we can design our own eviction policies. In this class, we will see that how we can design or we basically will see examples of how things currently are not in our favor as the page cache that is managed by OS, the eviction policies are, can be good or most of the time are not as suited for the database.
-> Suppose you have three pages, 1, 2, 3 in page cache, and you have those three pages copied to your storage buffer. So now suppose we have a query in which we need the page 100, but this page cache only had the limit of three pages. So suppose it evicts the second page. That doesn't mean that the second page from the storage buffer will be evicted. That is our own separate memory that we have copied, that doesn't matter how kernel is operating. So now what will happen, kernel will get page 100 in the page cache, then that page 100 will be copied to the storage buffer, including the three previous pages. So this is one method.


=>  
Now suppose that we are building our own database and we want to make the storage buffer. So the one thing that is that we can have our own page size in that. That is, it can be 8KB, it can be 16KB, it can be 2MB, it can be whatever we want. But as we know that OS page size is fixed, that is 4KB, so technically suppose if we have a page size of 8KB in our storage buffer, that will mean that it is two pages of OS in one pages of our database.
-> postgres 8kb page size
-> Your data inside a Postgres page is random, that is, it will be inserted at random and is also deleted at random. that is called theheap layout  ie there in no order 

-> InnoDB :16 kb page size 
-> InnoDB follows a clustered index-based layout. This type of work, what happens, suppose there are two pages, page 1 and 2. Page 1 contains row 1 to 4, and page 2 contains row 5 to 7. Suppose row 3 is deleted, then all the rows will be shifted one ahead. That is, row 4 will come to row 3's place The row 3 is deleted, row 4 will come to row 3's place, rows, row 5 from page 2 will go to page 1 at row 4 place, and similarly, all the rows will be shifted.

-> Now, suppose we are updating things. Now suppose we want to update something in a particular row, and that was inside a page in the DB's buffer pool or food storage. Now, if there are hundreds of updates, we know that for updating one row, we need to make a system call to the kernel, then kernel will update in the page cache, then page cache will communicate via DM to the disk, and then it will be updated. Suppose there are thousand queries, thousand rows update, that is one query, and there are thousand rows that need to be updated. Now there will be thousand system calls, which is very bad. So from that, a solution can be we can do batch update. that is batch our writes  That is, suppose if the database has updated around 500 or 700 or any N number of rows, we can after that make a single system call to the kernel and say if that update all of this and in that single call, the kernel will update all the pages and while marking them dirty, and then after asynchronously, it will update the disk via DMA.
-> In the end, when the data is flushed to the OS, that is, all the write updates are flushed in a single call, that is called fsync.
-> So if we make our database page size 2 MB rather than 4 KB, 8 KB, then what can be the benefits of it? Like, the only benefits that we can see is the reading read will become much more efficient because we'll have a lot of data into 1 MB, that is around 512 pages of 4 KB, 512 OS pages. So the reading will be easy, but when it comes to writing, then even if a very small change occurs, then we'll have to write around 512 pages in the OS. That will be very difficult.


=> problems with eviction 
-> Sequencial flooding , gpt explin this topic while making the notes

=> Understanding the eviction algorithm of PSQL.
-> Clock sweep 
->Clock sweep is the eviction algorithm used by the page-based SMLPSQL. Basically what happens, there is supposed five pages, and suppose one of them are used 10 times and one of them is used five times. Let's suppose. Now what clock sweep will do, in clock sweep, there is a clock that runs one again from page 1 to 5, you know, 5 to 1, 5, 1 to 5, and checks if the page is being used currently. Suppose if the page with frequency 10 was one of the pages with frequency 10 is used, then it will remain 10, others will be decremented by 1, that is 9, 9, 4, 9. And similarly, every second that will happen, and suppose the page with 10, used full of 10 is being used, eventually the page with 5 will become 0, and once it hits 0, it will be evicted. Thus, that is how we use the clock sweep algorithm.


=> Indexing 
-> One of the biggest challenges that we face is with all the algorithms that we've heard till now, everything, we couldn't find a proper way to optimize the reader and write lookup or read lookup, especially that every time we'll have to index or we have to iterate through the pages. So for that, we got the solution of indexing.
->few ideas that poped up were , we can keep a seperate page where we can keep key value pair that is key = page no. and value = its range that is row 10-20 etc... , This method helps to keep all the data in one file, so we'll only have to iterate one file to find the details, better than iterating each page and going through all the pages. But the only issue will be the storage.
-> And that idea popped up that we can keep a number 1, 2, 3, 4, 5 on pages, for example, page 200, page 3, page 5, page 6, are in sequence. So, one will be given to 200, two will be given to 300, and then 3 to 5, 4 to 6. But those indexes, the primary keys that we are going to keep, are all gonna be of 4 to 8 bytes. So, suppose we have a billion records, then it will consume around 10 GB extra data, which we don't have to keep in our RAM, so that idea was also discovered.
->The best solution that we came up was red-black tree to solve all of this problem.Hey GPT, please add proper details about the red-black tree in that how it solved the problem while making the notes.