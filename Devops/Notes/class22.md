
# Class 22 – Terraform Introduction

## 1. Terraform Overview
**Infrastructure as Code (IaC)** tool for provisioning cloud infrastructure.

**Multi-cloud support**: AWS, Azure, Google Cloud.

**Key benefits**:
- Platform agnostic
- Repeatable configurations
- Version controlled

## 2. Terraform Lifecycle

| Command | Purpose |
|---------|---------|
| **init** | Download providers/modules |
| **plan** | Preview changes (no execution) |
| **apply** | Create/update infrastructure |
| **destroy** | Delete all resources |

## 3. Command Workflow
```
1. terraform init    # Setup
2. terraform plan    # Preview  
3. terraform apply   # Execute
4. terraform destroy # Cleanup
```

## 4. Advantages
- **Speed**: Automated provisioning
- **Consistency**: Same code = same infra
- **Version control**: Git for .tf files

## 5. Supporting Tools
**Configuration**: Ansible, Puppet, Chef
**Templating**: Vagrant, Docker

## 6. Practical Example
**EC2 Creation**:
```hcl
# main.tf
resource "aws_instance" "web" {
  ami           = "ami-12345678"
  instance_type = "t2.micro"
}
```

**Flow**: init → plan → apply

## 7. State Management
**terraform.tfstate** tracks:
- Created resources
- Configuration changes
- Collaboration history
