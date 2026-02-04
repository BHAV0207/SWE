# Class 12 – Kubernetes Pods Deep Dive

## 1. Kubernetes Cluster Architecture
**Cluster** = multiple nodes working together.

| Node Type | Role |
|-----------|------|
| **Master (Control Plane)** | Manages cluster, scheduling, desired state |
| **Worker (Data Plane)** | Runs application pods |

**Demo setup**: 1 master + 2 workers.

## 2. Master Node Setup

### Initialization
```bash
sudo su
kubeadm init
```

**What happens**:
- Downloads API Server, etcd, Controller Manager, Scheduler
- Creates YAML manifests
- Control plane becomes operational

## 3. Understanding Pods
**Pod** = smallest deployable unit (1+ containers).

**Characteristics**:
- **Co-located**: Share network + storage
- **Co-scheduled**: Always same node
- Acts as container wrapper

## 4. Architecture Components

### Control Plane
- **API Server**: Communication hub
- **etcd**: Cluster data store
- **Controller Manager**: State enforcement
- **Scheduler**: Pod placement

### Worker Nodes
- Application pods
- Kubelet (pod management)
- Networking

## 5. API Server & kubectl
**kubectl**: CLI → API Server requests.

**API Server handles**:
- Authentication/authorization
- Request validation
- etcd communication

## 6. Hands-On Deployment
```bash
kubectl get pods
```
**Essential for**: Debugging, monitoring, management.

## 7. Namespaces
**Purpose**: Logical resource isolation.

**Defaults**:
- `default` (user apps)
- `kube-system` (system components)
- `kube-public`

## 8. Networking
- **CoreDNS**: Service DNS resolution
- **Network plugins** (Weave): Pod-to-pod communication

## 9. Scheduling
Pods scheduled by **available CPU/RAM**.
**Pending state** = insufficient resources.