# Class 14 – Kubernetes Deployments Deep Dive

## 1. Kubernetes Object Hierarchy
```
Deployment → ReplicaSet → Pods → Containers
```

| Object | Purpose | Key Feature |
|--------|---------|-------------|
| **Pod** | Single app instance | Ephemeral |
| **ReplicaSet** | N pods running | Availability |
| **Deployment** | Manages ReplicaSets | **Updates + Rollbacks** |

## 2. Deployment vs ReplicaSet

| Feature | ReplicaSet | Deployment |
|---------|------------|------------|
| **Core Job** | Keep N pods alive | Manage ReplicaSets |
| **Updates** | Manual | **Rolling updates** |
| **Rollback** | No | **Instant rollback** |
| **History** | No | **Version history** |

**Deployment = ReplicaSet + superpowers**

## 3. Deployment YAML
**Same as ReplicaSet**, just change:
```yaml
kind: Deployment  # ← Only this changes
```

## 4. Scaling
```yaml
spec:
  replicas: 5  # Dynamic scaling
```

**More users** → increase replicas  
**Less traffic** → reduce replicas

## 5. Rolling Updates
**Default behavior**:
- Zero downtime
- Replaces old pods **one-by-one**
- Health checks ensure readiness

## 6. Rollback
```bash
kubectl rollout undo deployment/my-app
```
**Instant rollback** using revision history.

## 7. Best Practices
- ✅ **YAML declarative configs**
- ✅ **Git for configs**
- ✅ **Namespaces**
- ✅ **Avoid manual prod changes**
- ✅ **Monitor desired vs actual state**

**Memory trick**: Deployment = ReplicaSet + Rolling Updates + Rollbacks