# Class 17 – Horizontal Pod Autoscaler (HPA)

## 1. HPA Overview
**Automatically scales** Deployments/ReplicaSets based on:
- CPU utilization
- Memory utilization
- Custom metrics

**Purpose**: Handle load spikes, optimize costs.

## 2. Horizontal Scaling Concept
**More pods** = better load distribution.

```
High load → Add pods → Distribute traffic
Low load → Remove pods → Save resources
```

## 3. Prerequisites

### Kubernetes Cluster
```bash
kubeadm  # Cluster setup
kubectl  # Management
kubelet  # Node agent
```

### Metrics Server (MANDATORY)
Collects CPU/memory metrics from pods/nodes.
**Without it → HPA fails**.

## 4. Key Commands

```bash
# Deploy
kubectl apply -f deployment.yaml

# Manual scale
kubectl scale --replicas=5 deployment/myapp

# Monitor resources
kubectl top pods
kubectl top nodes
kubectl get hpa
```

## 5. HPA Deployment Steps

1. **Create Deployment** with resource requests/limits
2. **Install Metrics Server**
3. **Create HPA**:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  minReplicas: 1
  maxReplicas: 10
  targetCPUUtilizationPercentage: 50
```

## 6. Resource Requests vs Limits
| Type | Purpose | HPA Usage |
|------|---------|-----------|
| **Requests** | Guaranteed minimum | **Scaling basis** |
| **Limits** | Maximum allowed | Enforcement |

## 7. Scaling Behavior
```
Target: 50% CPU
Current: 80% → Add pods
Current: 30% → Remove pods (cooldown)
```

## 8. Troubleshooting
**"Metrics unavailable"** → Install Metrics Server
**HPA not scaling** → Check resource requests in deployment