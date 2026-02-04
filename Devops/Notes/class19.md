
# Class 19 – GitHub Actions CI

## 1. GitHub Actions Overview
**Built-in GitHub CI/CD** for:
- Build, test, deploy automation
- Runs inside your repository

**Features**:
- 10,000+ Marketplace actions
- Linux/Windows/macOS support

## 2. Repository Setup
```bash
git clone <repo-url>
# Add files (pom.xml, source code)
git add .
git commit -m "Initial commit"
git push
```

## 3. Workflow Structure
**Location**: `.github/workflows/*.yaml`

### Maven + Java Example
```yaml
name: Java CI with Maven
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-java@v3
      with:
        java-version: '17'
    - run: mvn package
```

## 4. Key Concepts

| Component | Role |
|-----------|------|
| **Trigger** | `push`, `pull_request` |
| **Job** | Group of steps |
| **Step** | Single command/action |
| **Runner** | `ubuntu-latest` (recommended) |

## 5. Popular Actions
```yaml
- uses: actions/checkout@v3      # Clone repo
- uses: actions/setup-java@v3    # Install JDK
```

## 6. Maven Workflow
1. **Setup Java** (`setup-java`)
2. **mvn package** → produces `.jar`/`.war`
3. **Cache** dependencies for speed

## 7. Cost Optimization
- Use **spot instances**
- Cache dependencies
- Avoid long-running jobs

## 8. Debugging Common Issues
| Problem | Fix |
|---------|-----|
| YAML indentation | Validate syntax |
| Wrong JDK | Check `java-version` |
| Permissions | Verify secrets/access |

**Always check workflow logs!**
