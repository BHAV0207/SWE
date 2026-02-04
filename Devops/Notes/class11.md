# Class 11 – Kubernetes Orchestration

## 1. Kubernetes (K8s) Introduction
**Open-source container orchestration** platform that:
- Automates deployment + scaling
- Manages containerized workloads
- Runs reliably across machine clusters

## 2. Core Kubernetes Concepts

### Pods
**Smallest deployable unit**:
- Contains 1+ containers
- Shared network namespace + storage
- Always run on same node

### Pod Scheduling
- Users create pods
- **Control Plane** decides node placement
- Workloads execute on **worker nodes**

## 3. Kubernetes Architecture

### Control Plane Components
| Component | Role |
|-----------|------|
| **API Server** | REST entry point for all operations |
| **etcd** | Cluster state store (source of truth) |
| **Controller Manager** | Ensures desired = actual state |
| **Scheduler** | Places pods on optimal nodes |

### Worker Node Components
| Component | Role |
|-----------|------|
| **Kubelet** | Ensures pod containers run |
| **Container Runtime** | Executes containers (containerd/CRI-O) |
| **Kube-Proxy** | Pod networking + load balancing |

## 4. Key Kubernetes Features

### Self-Healing
- Auto-restarts failed containers
- Reschedules pods on node failure
- Removes unhealthy containers

### Horizontal Scaling
Scale replicas based on:
- CPU/memory usage
- Custom metrics

### Service Discovery
- Pods get unique IPs
- **Services** provide stable DNS + load balancing

## 5. Scaling Mechanisms

| Autoscaler | Purpose |
|------------|---------|
| **HPA** | Adjusts pod replicas |
| **VPA** | Tunes CPU/memory limits |
| **Cluster Autoscaler** | Adds/removes worker nodes |

## 6. Practical Benefits
- **Zero-downtime rollouts** + auto-rollback
- Secure **secrets management**
- Automated **certificate rotation**
- Clean **pod lifecycle management**