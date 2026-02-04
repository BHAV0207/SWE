# Class 10 – Docker Volume & Networking

## 1. Docker Networking Overview
Docker networking enables communication:
- Between containers
- Container ↔ host
- Containers ↔ external networks

**Core for microservices and distributed apps.**

## 2. Key Networking Concepts

### IP Addresses
Each container gets a **unique IP** within its Docker network.
Containers communicate directly using these IPs.

### Subnetting (CIDR)
Divides networks into smaller segments:
```
192.168.10.0/24
- Total bits: 32
- Network bits: 24  
- Host bits: 8
- Total IPs: 2⁸ = 256
```

**Network ID**: First IP (network identifier)  
**Broadcast ID**: Last IP (all devices)

## 3. Docker0 Bridge Network
Docker creates **docker0** virtual bridge on installation:
- Acts as virtual network switch
- Connects containers + host
- Each container has `eth0` ↔ `veth` pair to docker0

## 4. Docker Network Types

### Default Bridge (docker0)
```bash
docker run -d nginx
```
Containers communicate via IP addresses.

### Custom Bridge Networks
```bash
docker network create -d bridge my_bridge
```
**Benefits**:
- Better isolation
- **DNS name resolution** (container names work)

## 5. Practical Subnet Example
```
Engineering: 192.168.10.0/26  (64 IPs)
HR:         192.168.10.64/26 (64 IPs) 
Reception:  192.168.10.128/26 (64 IPs)
```

## 6. Troubleshooting
```bash
docker inspect <container_name>
```
Shows IP, network mode, connectivity details.