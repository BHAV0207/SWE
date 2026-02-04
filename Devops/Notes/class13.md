# Class 13 – Kubernetes ReplicaSets

## 1. Kubernetes YAML Structure
Common YAML components:

| Field | Purpose |
|-------|---------|
| **apiVersion** | Kubernetes API version |
| **kind** | Object type (Pod, ReplicaSet) |
| **metadata** | Name, labels, annotations |
| **spec** | Desired state definition |

## 2. Pod Fundamentals
**Pod** = 1+ containers sharing:
- Network namespace
- Storage volumes
- Same node

**Self-healing**: Auto-restart crashed containers.

## 3. YAML Syntax Basics
```yaml
# Key-value
key: value

# List
- item1
- item2

# Nested
parent:
  child: value
```

## 4. ReplicaSets
**Purpose**: Maintain specified number of identical pods.
**Auto-creates replacements** on failure/crash.

## 5. ReplicaSet YAML Structure
```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: my-rs
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: app
        image: nginx
```

**Critical**: Label-selector matching.

## 6. Internal Workflow

| Component | Role |
|-----------|------|
| **API Server** | Request handling + etcd |
| **etcd** | State storage |
| **Scheduler** | Node assignment |
| **Kubelet** | Pod lifecycle |
| **Controllers** | State reconciliation |

## 7. Pod Lifecycle Recovery
**Continuous loop**:
1. Compare desired vs current state
2. Detect mismatch (crashed pod)
3. Controller creates replacement

## 8. kubectl Commands
```bash
kubectl apply -f file.yaml     # Create/update
kubectl delete -f file.yaml    # Delete
kubectl get pods               # List pods
kubectl get replicasets        # List ReplicaSets
```