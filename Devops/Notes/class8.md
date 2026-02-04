# Class 8 – Creating Your Own Docker Images

## 1. What is a Container?
A Docker container is a lightweight, standalone, executable package containing:
- Application code
- Runtime environment
- Libraries
- System tools

**Key difference**: Shares host OS kernel (unlike VMs with full OS).

## 2. Containers vs Virtual Machines

### Weight & Performance
| Aspect | Containers | Virtual Machines |
|--------|------------|------------------|
| **Size** | Lightweight | Heavy (full OS) |
| **Startup** | Seconds | Minutes |
| **Resources** | Efficient | High overhead |

Containers don't bundle complete OS, leading to better resource utilization.

### Isolation Mechanisms
- **Containers**: Linux namespaces + cgroups
- **VMs**: Hypervisor-based isolation

## 3. How Containers Work

### Namespace Isolation
Linux namespaces separate:
- Process IDs (PIDs)
- Hostnames
- Network stacks
- User IDs (UIDs)
- Inter-process communication (IPC)
- File systems

### Control Groups (Cgroups)
- Limit CPU, memory, I/O usage
- Prevent resource monopolization
- Ensure fair distribution across containers

## 4. Docker's Kernel Interaction

**Linux**: Native execution using host kernel.

**Windows/macOS**: 
- Docker runs Linux VM underneath
- Containers execute within this Linux VM

```
Host (macOS) → Linux VM → Docker → Containers
```

## 5. Running Containers Across Systems

| Platform | Execution Method |
|----------|------------------|
| **Linux** | Native kernel support |
| **Windows/macOS** | Linux VM required |

## 6. Ephemeral Nature of Containers
Containers are designed to be:
- Easily created/destroyed
- **No persistent state** by default

**Implications**:
- Applications must be **stateless**, or
- Use **external volumes** for persistence

**Benefits**: Scalability + fault tolerance.

## 7. Port Mapping & Networking
Containers have isolated network stacks by default.

**Port mapping** connects:
```
Host Port → Container Port
docker run -p 8080:80 nginx
```

**Communication flow**:
```
Host:8080 → Container:80 (nginx)
```

Maintains isolation while enabling external access.