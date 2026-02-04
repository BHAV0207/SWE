# Class 6 – Intro to Docker

## 1. Docker & Containerization Notes
**Docker** is an open platform to:
- Build, ship, and run applications
- Separate applications from infrastructure

## 2. Containers
Containers package:
- Application + all dependencies
- Run consistently everywhere
- Lightweight alternative to VMs
- Share host OS kernel

## 3. Running Containers

### Starting New Containers
```bash
docker run
```
Starts a new container from an image.

### Interactive Terminal Access
```bash
docker run -it ubuntu bash
```
- `-i`: Interactive mode
- `-t`: Allocate terminal

### Existing Containers
```bash
docker exec -it <container-id> bash
```
Run commands in a running container.

## 4. Inspecting Containers

- `docker ps` → List running containers
- `docker container inspect <id>` → Detailed info including IP address

## 5. Docker Images
- **Images** = read-only templates
- **Containers** = running instances of images

### Image Commands
- `docker images` → List local images
- `docker commit` → Create new image from container

## 6. Docker Hub
- Cloud-based image repository
- `docker push <image-name>`
- Image names start with `username/image`

## 7. Networking
- Each container gets its own IP address
- Use `docker inspect` to find container IP
- Containers can communicate via `curl <container-ip>`

## 8. Dockerfile
- Text file used to build Docker images
- Each instruction creates a new **layer**
- Layers enable efficient caching during builds

## 9. Detached Mode
```bash
docker run -d <image>
```
Runs container in background (detached mode).

## 10. Why Docker?
Compared to VMs:
- More efficient (no full OS overhead)
- Faster startup times
- Highly portable across environments

## 11. Conclusion
Docker:
- Simplifies development workflows
- Ensures environment consistency
- Foundation for modern deployment practices