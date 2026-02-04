# Class 16 – Kubernetes Services Deep Dive

## 1. Intra-Pod Communication
**Same Pod** → containers share:
- Network namespace
- **Same IP address**
- `localhost` + standard ports

**No networking overhead** - like multiple processes on one machine.

## 2. Same Node Pod Communication

**Virtual network** managed by **CNI plugins**:
- Each pod gets unique IP
- Virtual bridges + routes

**Popular CNI plugins**:
- Weave
- Calico  
- Flannel

## 3. Cross-Node Pod Communication
**Direct IP communication** between nodes.

**kube-proxy** manages:
- iptables/IPVS rules
- Traffic routing
- Service load balancing

**Key guarantee**: Any pod ↔ any pod (no NAT).

## 4. Services Overview
**Stable endpoint** for ephemeral pods.

| Service Type | Scope | Port Range |
|--------------|-------|------------|
| **ClusterIP** | Internal only | Dynamic |
| **NodePort** | Each node port | 30000-32767 |
| **LoadBalancer** | External (cloud) | Provider-defined |

## 5. Service Mechanics
1. **Cluster IP** assigned
2. **Label selector** finds matching pods
3. **Load balancing** across endpoints
4. **CoreDNS** enables name resolution

```
service-name.namespace.svc.cluster.local
```

## 6. Key Components

| Component | Role |
|-----------|------|
| **CoreDNS** | Service DNS resolution |
| **kube-proxy** | iptables/IPVS routing |
| **Endpoints** | Dynamic pod IP list |

## 7. kubectl Commands
```bash
kubectl get svc
kubectl describe svc my-service
kubectl get endpoints
kubectl get namespaces
```