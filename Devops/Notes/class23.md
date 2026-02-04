
# Class 23 – Terraform In Action

## 1. AWS Networking Basics

### Subnets
| Type | Internet Access |
|------|-----------------|
| **Public** | Via Internet Gateway |
| **Private** | No direct access |

### VPC
**Logically isolated network** containing:
- Subnets
- Route tables
- Resources

## 2. CIDR Blocks
**Defines IP range**:
```
10.0.0.0/16 → 65,536 IPs
10.0.1.0/24 → 256 IPs
```

## 3. Terraform File Structure
```
main.tf      # Core config
network.tf   # VPC + subnets
compute.tf   # EC2 + security groups
```

### State Management
**terraform.tfstate** + **Remote backend** (S3 + DynamoDB)

## 4. IP Address Types

| Type | Scope | Purpose |
|------|-------|---------|
| **Private** | VPC-internal | Internal communication |
| **Public** | Internet-facing | External access |
| **Elastic** | Static public | Failover/stability |

## 5. EC2 Launch Requirements
**AMI mandatory**:
- Amazon Linux
- Ubuntu
- Windows

## 6. Terraform Variables

### Input Variables
```hcl
variable "instance_type" {
  default = "t2.micro"
}
```

### Output Variables
```hcl
output "public_ip" {
  value = aws_instance.web.public_ip
}
```

### Local Variables
```hcl
locals {
  common_tags = {
    Project = "MyApp"
  }
}
```

**Dependencies**: Terraform auto-detects (no manual `depends_on` needed).
