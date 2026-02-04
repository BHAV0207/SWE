# Class 15 – Kubernetes Services

## 1. Kubernetes Overview
**Container orchestration** platform for:
- Automated deployment/scaling
- Infrastructure abstraction
- Focus on app logic, not servers

## 2. Pods Deep Dive
**Smallest unit** = single running process.

**Shared resources**:
- Same **IP address**
- Same port space
- Storage volumes
- `localhost` communication

**Analogy**: House (pod) with rooms (containers).

## 3. ReplicaSets
**Ensures N identical pods running**.

**Self-healing**:
- Pod crash → auto-create new
- Node failure → reschedule

**Continuous**: Desired state vs actual state.

## 4. Deployments
**Manages ReplicaSets** for:
- Rolling updates (zero downtime)
- Scaling
- Rollbacks

**Recommended** for stateless apps.

## 5. Services
**Stable endpoint** for ephemeral pods (changing IPs).

| Service Type | Access | Port |
|--------------|--------|------|
| **ClusterIP** | Cluster-internal only | Dynamic |
| **NodePort** | Node static port + ClusterIP | 30000-32767 |

**Core functions**: Label-based discovery + load balancing.

**Analogy**: Cinema ticket counters (any works).

## 6. Load Balancers
**Traffic distribution** across pods.

| Type | Scope |
|------|-------|
| **Internal** | Cluster-only |
| **External** | Internet-facing (cloud) |

Ensures high availability + even distribution.

## 7. YAML Structure
```yaml
apiVersion: apps/v1
kind: Deployment  # ← Object type
metadata:
  name: my-app
spec:
  replicas: 3
```

**Essential** for declarative management.