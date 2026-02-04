# Class 18 – CI/CD Introduction

## 1. The CI/CD Problem
**Before CI/CD**:
- Manual code → test → build → deploy
- Slow releases + human errors
- Bugs in production

**CI/CD automates** the entire flow.

## 2. CI/CD Breakdown

### Continuous Integration (CI)
- Frequent code integration
- **Auto-build + auto-test** on Git push

### Continuous Delivery vs Deployment
| Type | Deployment |
|------|------------|
| **Delivery** | Deployable state (manual approval) |
| **Deployment** | **Fully automatic** |

## 3. CI/CD Benefits
- Faster releases
- Automated testing
- Reduced errors
- Rapid feedback

## 4. Pipeline Flow
```
Code → Build → Test → Scan → Package → Deploy
```

**Tools**: Git, GitHub Actions, Docker, Kubernetes

## 5. GitHub Actions
**Built-in CI/CD** with **YAML workflows**.

**Location**: `.github/workflows/`

## 6. Core Concepts

| Concept | Purpose |
|---------|---------|
| **Workflow** | Complete automation pipeline |
| **Event** | Trigger (`push`, `pull_request`) |
| **Job** | Set of steps |
| **Runner** | Execution machine |
| **Step** | Individual task |

## 7. Simple CI Example
```yaml
name: CI Pipeline
on:
  push:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Build Docker
      run: docker build -t myapp .
```

## 8. Security Scanning

### SAST (Static Analysis)
- Analyzes **source code** (SonarQube, CodeQL)
- Early vulnerability detection

### SCA (Dependency Check)
- Scans **third-party libraries** (Snyk, OWASP)
- Open-source risk identification

**Enhanced pipeline**: Code → Build → Test → **SAST → SCA** → Package

## 9. Kubernetes Self-Hosted Runner
**Register K8s cluster** as GitHub Actions runner for:
- Direct cluster access
- Secure/faster CD

**CD Flow**:
```
GitHub → CI (build image) → Docker Registry → K8s Runner → kubectl apply
```