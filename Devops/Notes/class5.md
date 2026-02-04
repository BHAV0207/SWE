# Class 5 – Git Refresher and Introduction to Docker

## 1. Introduction to Docker
Docker is a platform used to create, manage, and run containers.  
It allows applications to be packaged along with all their dependencies into a single standardized unit called a container.

## 2. Docker Philosophy
**“If It Fits, It Ships”**  
If an application runs correctly inside a Docker container, it will run anywhere Docker is installed.  
This removes environment-specific issues and simplifies deployment.

## 3. Key Concepts in Docker

### Containers
Containers are lightweight, portable, and self-sufficient units that include:
- Application code
- Runtime
- System tools
- Libraries
- Configuration files

Containers are similar to virtual machines but more efficient because they share the host system’s kernel while remaining isolated.

### Docker Images
- Read-only templates used to create containers
- Contain the application and all required dependencies
- A container is a running instance of an image

### Docker Daemon
- Background service running on the host
- Listens to Docker API requests
- Manages containers, images, networks, and volumes

### Docker Client
- Command-line interface (CLI)
- Sends commands to the Docker daemon
- Can communicate with a local or remote daemon

## 4. Volumes and Networking

### Volumes
- Provide persistent storage for containers
- Prevent data loss when containers stop or are deleted
- Commonly used for databases and stateful applications

### Networking
- Built-in Docker networking support
- Enables container-to-container and container-to-external communication

## 5. Working with Docker

### Running Docker Containers
Containers are started using the `docker run` command.

Common flags:
- `-i` : Interactive mode
- `-t` : Allocate a terminal

These flags allow direct access to the container shell.

### Docker Hub
- Cloud-based repository for Docker images
- Default source for pulling images
- Supports pushing, pulling, and sharing images