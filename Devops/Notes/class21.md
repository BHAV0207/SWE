# Class 21 – Kubernetes CI/CD Implementation

## 1. CI/CD Fundamentals

### Continuous Integration (CI)
- Frequent code merges
- **Auto-build + auto-test**
- Early bug detection

### Continuous Deployment (CD)
- **Automatic production deploys**
- Zero-downtime focus
- Infrastructure automation

## 2. Kubernetes Environment

### VM Setup
**Tools**: VirtualBox + **Vagrant** (automated scripts).

### Installation Shortcut
**Pre-configured Kubernetes AMI** = faster setup.

## 3. GitHub Actions for CI/CD
**Complete pipeline**: Build → Test → Package → Release → Deploy.

## 4. Self-Hosted Runners
**Why use**:
- Direct Kubernetes access
- Custom environments
- Cost control

**Setup**:
```bash
./config.sh --url <repo> --token <token>
```

## 5. Project Workflow
```
CI: GitHub Actions → Build/Test → Docker Image
CD: K8s Runner → kubectl apply → Production
```

## 6. Testing Strategy

| Type | Purpose |
|------|---------|
| **SIT** | System integration |
| **Performance** | Load handling |
| **Security** | Vulnerability detection |

**Fully automated** in pipelines.

## 7. Practical Tips
- **Separate CI/CD** pipelines
- Customize per application needs
- Team presentations = individual role clarity