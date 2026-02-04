# Class 20 – DevSecOps Introduction

## 1. Git Repository Setup
**Clone + structure**:
```bash
git clone <repo-url>
# Ensure: src/ + pom.xml
git add .
git commit -m "Initial setup"
git push
```

**Best practice**: Create GitHub repo first, then clone.

## 2. GitHub Actions Basics
**Built-in CI/CD** with **YAML workflows** in `.github/workflows/`.

**Triggers**: `push`, `pull_request`

**Multi-job** support across Ubuntu/Windows/macOS runners.

## 3. Maven Build + Test
**pom.xml** defines dependencies + plugins.

**CI automation**:
```bash
mvn clean package
```
**Output**: `.jar`/`.war` files.

## 4. Docker Integration

### Dockerfile
Stored with project code (Java-independent).

### Docker Hub
**Versioned images** with tags.

### Secrets Management
**GitHub Secrets** for credentials (never hardcode).

### Build + Push Flow
```
GitHub Actions → docker build → docker push → Docker Hub
```

## 5. Security Scanning

| Type | Tool | Purpose |
|------|------|---------|
| **SAST** | CodeQL | Source code analysis |
| **DAST** | - | Running app testing |
| **Container** | **Trivy** | Docker image vulnerabilities |

**Fail builds** on critical issues.