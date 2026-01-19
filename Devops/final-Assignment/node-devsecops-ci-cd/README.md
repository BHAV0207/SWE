# Node DevSecOps CI/CD Project

## Overview
This project implements a complete DevSecOps CI/CD pipeline for a Node.js application. It integrates automated builds, testing, security scanning (SAST, SCA, Container Scan), and Kubernetes deployment.

## CI/CD Pipeline Architecture

### 1. CI Pipeline (`.github/workflows/ci.yml`)
The CI pipeline is triggered on every push and pull request to the `main` branch. It ensures that only secure and tested code moves forward.

- **Linting**: Uses ESLint to enforce coding standards.
- **Unit Testing**: Runs tests using Jest and Supertest.
- **SCA (Software Composition Analysis)**: Uses `npm audit` to detect vulnerable dependencies.
- **SAST (Static Application Security Testing)**: Integrates GitHub CodeQL to detect security flaws in the source code.
- **Dockerization**: Builds a multi-stage Docker image for production.
- **Container Scanning**: Uses **Trivy** to scan the built Docker image for OS and library vulnerabilities.
- **Docker Push**: Pushes the trusted image to DockerHub.

### 2. CD Pipeline (`.github/workflows/cd.yml`)
The CD pipeline is triggered upon the successful completion of the CI pipeline.

- **Kubernetes Deployment**: Deploys the application to a K8s cluster using the manifests in `k8s/`.
- **Smoke Test / Dummy DAST**: Performs a runtime validation check on the `/health` endpoint to ensure the application is running correctly in the production-like environment.

## Secrets Configuration
To run this pipeline, the following GitHub Secrets must be configured:
- `DOCKERHUB_USERNAME`: Your DockerHub username.
- `DOCKERHUB_TOKEN`: Your DockerHub personal access token.
- `KUBECONFIG`: The kubeconfig file content for your Kubernetes cluster.

## How to Run Locally

### Prerequisites
- Node.js 18+
- Docker

### Installation
1. Clone the repository.
2. Run `npm install`.

### Run Tests
```bash
npm test
```

### Run Linting
```bash
npm run lint
```

### Build and Run Docker Image
```bash
docker build -t node-app .
docker run -p 8080:8080 node-app
```

## Security Gate Logic
- **Fail Fast**: Linting and tests run before security scans.
- **Security Gates**: `npm audit` and `trivy` are configured to fail the build if high or critical vulnerabilities are found.
- **Trusted Images**: Only images passing the Trivy scan are pushed to DockerHub.
