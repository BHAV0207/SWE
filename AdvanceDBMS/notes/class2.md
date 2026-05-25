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

# 21. Redis and Shared Memory

Redis itself:
- it stays on ram therefore its very fast that is very less latency roughly 100 nano sec
- all the processses can read data through redis's heap using the shared memory
- mainly runs as a single main process
- stores data structures inside heap memory
- but as we know redis is on ram , there fore DATA PERSISTANCE becomes an issue 


=> how do we solve that ???
->we need disc based database 
-> suppose we have a program that reads from the disc and writes to the disc 

=> in ram there are several comperthments that is , several processes and the operating system or kernel 
-> when a process is going on and there is a command like open a file or etc...which the process does not know how to perform it goes to the kernel and asks it do it for him , this type of call is called the sys call or the system call
-> Suppose if the kernel or the operating system themselves don't know about the file that needs to be opened, then they directly contact with the hard disk, that is the storage disk.
->Okay, so the copying that happens from the disk to the RAM, that usually does not go through CPU. The instructions are not given by the CPU. That happens through DMA, that is drivers, because if all the copying from the hard disk to the RAM will go through CPU, then it will make the CPU very slow and increase a lot of load on CPU. Only generally the RAM to RAM, that is internally if anything is being copied, then that goes through CPU. As you know that if, suppose, for example, if you take the full picture, then process A sees something like open a file or something, it tells CPU that, okay, I have got this open a file, then the CPU tells the kernel or the OS, whatever we say it, to perform the operation. If the kernel OS does not have that file or they don't know about that file, they contact the hard drive and copy that file from the hard drive. And that is happened through with the help of drivers. That is not something that CPU take care of.
-> dma = direct mempry access

=> this time we will see how the file is read 
->  In the case of reading, suppose there is a file that we need to read. What will happen? The same process, the process going on in RAM, will tell the CPU that I need to read the file. The CPU will tell the kernel of the OS. The kernel or the OS, with the help of driver, will contact the hard drive and will copy the data that we want to read from the hard drive to the RAM. But the thing is that its kernel is not responsible for copying the data to the process's memory. It will copy the data then for the process to read that data. I mean, to get that data, there will be another copy made in that from the RAMs, basically the memory where kernel has stored the data to the storage of the process, where the process can read or perform any operation on that data.
->When reading the data, suppose the process requests for the first three bytes, but as there is a hardware limit that we cannot get random three bytes, so there are concepts of blocks and pages in the hardware where it's standard page size that the industry standard is 4 KB, there form the harddirve the full page is coied to the ram via the driver and the place where its copied is called the page cache 
-> though inside the page cache, the complete page is stored, but if the process requires only the first three bytes, then only the first three bytes are given to the process after it is copied inside the RAM. But getting from the hard drive, you get the complete page, not the desired three bytes or four bytes, whatever you ask for. You get that, but when the data is copied or stored in the page cache inside the RAM, then the kernel or the CPU or whatever gives you the desired result your process asked for.

=> Writing data 
->Now suppose we have to write data, that is basically in other terms is edit the data, then what happens, suppose we want to edit the first three bytes. Suppose the data in the page cache was HELLO, that is five bytes, hello. We wanted to uh update or write the first four bytes, that is BYLEO. So what will happen is, first the process will write it and then the kernel will send that updated data to the page cache inside the RAM. And then the thing is that all after that, with the help of drivers, the hard drive will see that updated data and will update that inside the hard drive. But the fun thing is that this operation is not synchronous. the os schedules the task depending on the load , and meanwhile markd the page cache as dirty 


=> disk
-> Well, SSD, we know that hard drive has a clockwise mechanism which helps in reading and writing the data. So it generally takes 5 to 10 milliseconds.
->Yes, basically it has a kind of a section wise division in which there are pages numbered like for section there are 1 to 12 pages, for example, and second section 12 to 24, etc. So basically, if we want to directly get the 20th page, we can directly go to the second block rather than first going through the first block and then the second. No, we skip a lot of iterations. Basically, it's kind of a binary search, but not exactly. Therefore, it's much more faster than HDD.
-> so you have noticed one thing our main optimisation is where we fetch data from the disc as ssd
->Now, suppose now that we have an intelligent box database, now, we know that page cache is there. Now, suppose the page cache has the ability to store two pages, and first page is user 0 to 100, second page is user 100 to 200. Suppose the user wants the user 40. So page cache has page 1 and page 2. So it will see that, yeah, page 1 has 0 to 100, so it will find 40 and give the result that is the cam operation that will be very fast. Now, suppose the user wants ID 300, that is in page 3, but we only have page 1 and page 2 in the page cache. So what will happen? Eviction will happen. Page 1 will be removed or page 2, depending upon the eviction policy, and from the disk, page 3 will be gathered and will be stored, will be brought via the driver to the page cache, and then the details for the user 3, whatever was asked, will be given. So one of very, very, very important point is, whenever you are designing a database, design your own eviction policy.