# Class 9 – Docker Containers

## 1. Introduction to Docker Volumes
**Docker Volumes** provide persistent storage managed by Docker.
Data survives container lifecycle (stop, crash, removal).
Volumes can be shared across multiple containers.

## 2. Importance of Docker Volumes
Containers are ephemeral by default, but apps need permanent storage.

**Volumes solve**:
- Data preservation across restarts
- Decouples app logic from storage
- Essential for stateful apps (databases)

## 3. Core Concepts

### Ephemeral Containers
Containers are designed to be short-lived.
**Container removal = data loss** (without volumes).

### Writable Layer
Each container has a writable layer on top of image layers.
Changes stored here are **deleted with container**.

## 4. Types of Docker Storage

| Type | Managed By | Naming | Reusability | Storage Location | Best For |
|------|-------------|--------|-------------|------------------|----------|
| **Named Volumes** | Docker | User-defined | High | `/var/lib/docker/volumes/` | **Production** |
| **Anonymous Volumes** | Docker | Auto-generated | Low | Docker-managed | Temporary |
| **Bind Mounts** | User | Host path | High | Host filesystem | Development |

## 5. Use Cases

### Database Persistence
```bash
docker run -v db-data:/var/lib/postgresql/data postgres
```
Database files survive container restarts.

### Shared Data
Multiple containers mount same volume:
- Microservices sharing configs
- Centralized logs
- Shared assets between services

## 6. Volume Management Commands

### Create Volume
```bash
docker volume create myapp-data
```

### Inspect Volume
```bash
docker volume inspect myapp-data
```
Shows metadata + host storage location.

### Attach to Container
```bash
docker run -v myapp-data:/app/data myapp
```
Mounts volume at `/app/data` inside container.

### Read-Only Volume
```bash
docker run -v myapp-data:/app/data:ro myapp
```
Prevents container from modifying volume data.