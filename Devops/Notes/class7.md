# Class 7 – Docker Images

## 1. Introduction to Docker
Docker automates:
- Deployment
- Management  
- Scaling
- Operation of application containers

**Focus**: Image creation, Dockerfiles, and container management commands.

## 2. Key Concepts

### Docker Images
- Packaged environment with everything needed to run an app
- Includes: code, runtime, libraries, dependencies
- **Blueprint** for creating containers
- Building blocks of containerization

### Docker Containers
- Running instance of a Docker image
- Lightweight alternative to VMs
- Shares host system kernel (faster, more efficient)

## 3. Basic Docker Commands

### Docker Build
Creates images from Dockerfile:
```bash
docker build -t image-name .
```
- `-t`: Assign name/tag (use lowercase)

### Docker Run
Starts containers from images:
```bash
docker run -d -p 8080:80 image-name
```
- `-d`: Detached (background) mode
- `-p`: Port mapping (host:container)

## 4. Dockerfile Essentials
Script with instructions to build Docker images.

### Key Dockerfile Instructions

#### FROM
```dockerfile
FROM node:18-alpine
```
Specifies base image (starting point).

#### RUN
```dockerfile
RUN apt-get update && apt-get install -y ...
```
Executes commands during build.  
**Each RUN = new layer** (avoid excess layers).

#### CMD
```dockerfile
CMD ["node", "app.js"]
```
Default command when container starts (overridable).

#### ENTRYPOINT
```dockerfile
ENTRYPOINT ["nginx"]
```
Main container command (harder to override).

## 5. Advanced Concepts

### Multi-stage Builds
```dockerfile
# Build stage
FROM maven:3.8 AS builder
COPY . /app
RUN mvn package

# Production stage  
FROM openjdk:11-jre-slim
COPY --from=builder /app/target/app.jar /app.jar
CMD ["java", "-jar", "/app.jar"]
```
- Reduces final image size
- Only keeps production components

### Copy-On-Write (CoW)
- Loads only required layers at runtime
- Improves efficiency and memory usage

## 6. Performance Optimization

### Reduce Image Layers
```dockerfile
# Good: Single layer
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Bad: Multiple layers
RUN apt-get update
RUN apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*
```

### Base Image Selection
**Java Example**:
- **Build stage**: Use JDK (full compiler)
- **Production stage**: Use JRE (smaller runtime)

## 7. Practical Example
**Multi-stage Java app**:
1. Stage 1: JDK → Compile `.jar`
2. Stage 2: JRE → Run production image

## 8. Tools & Environment
- Docker setup demonstrated
- Hands-on: Build images, run containers, deploy apps
- Emphasis on practical learning