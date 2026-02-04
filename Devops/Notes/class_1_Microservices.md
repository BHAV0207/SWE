# Class 1 – Microservices

### 1. What is a Microservice?
A **microservice** is a small, independent service that performs a single business function and communicates with other services over a network. It is loosely coupled and can be developed, deployed, and scaled independently.

### Key Characteristics
- **Single Responsibility**: One clear business function per service  
- **Independent Deployability**: Deploy/update without impacting others  
- **Database per Service**: Own data storage (polyglot persistence)  
- **Technology Agnostic**: Different languages, frameworks, databases  
- **Decentralized Governance**: Teams own and manage their services  

### Example
E-commerce platform:
- User Service – registration/login  
- Product Service – product catalog  
- Order Service – orders & payments  
- Notification Service – email/SMS  


## 2. Components of Microservice Architecture

### A. Core Service Components
- **API Gateway**
  - Entry point for clients
  - Handles routing, auth, rate-limiting  
  - Examples: NGINX, Kong, AWS API Gateway  

- **Business Logic Layer**
  - Core service functionality  
  - Example: Order validation, pricing logic  

- **Database Layer**
  - Each service manages its own database  
  - Example: PostgreSQL, MongoDB  

- **Service Registry & Discovery**
  - Tracks service instances dynamically  
  - Examples: Eureka, Consul, etcd  

- **Messaging / Event Bus**
  - Asynchronous communication  
  - Examples: Kafka, RabbitMQ  

- **Configuration Service**
  - Centralized configuration management  
  - Examples: Spring Cloud Config, Consul  

### B. Supporting Components
- **Load Balancer**: Distributes traffic (NGINX, HAProxy)  
- **Monitoring & Logging**: Prometheus, Grafana, ELK  
- **Security**: JWT, OAuth2, API Keys, mTLS  
- **Resilience**: Circuit breakers (Hystrix), retries  
- **Caching**: Redis, Memcached  


## 3. Communication in Microservices

### A. Synchronous Communication
- Request–response model (REST, gRPC)
- Immediate response

**Pros**
- Simple
- Easy to debug

**Cons**
- Tight coupling
- Failure propagation

**Example**
```

GET /orders?userId=123

````

### B. Asynchronous Communication
- Event-driven / messaging-based
- Services publish and consume events

**Pros**
- Loose coupling
- High scalability
- Better resilience

**Cons**
- More complex
- Eventual consistency

**Example Event**
```json
{
  "event": "OrderPlaced",
  "orderId": 123,
  "userId": 456
}
````


## 4. Key Microservices Concepts

### A. Service Coupling

* **Tight Coupling**: Strong dependencies (avoid)
* **Loose Coupling**: Independent services (preferred)

### B. Data Management

* **Database per Service**
* **Eventual Consistency**
* **CQRS**: Separate read and write models

### C. API Design

* **REST**: HTTP-based APIs
* **gRPC**: High-performance RPC
* **GraphQL**: Client-defined data fetching

### D. Observability

* **Logging**: Centralized logs (ELK)
* **Monitoring**: Metrics (Prometheus, Grafana)
* **Tracing**: Distributed tracing (Jaeger, Zipkin)

### E. Deployment Patterns

* **Containerization**: Docker
* **Orchestration**: Kubernetes
* **CI/CD**: Jenkins, GitHub Actions

### F. Resilience Patterns

* **Circuit Breaker**
* **Retry with Backoff**
* **Bulkhead Isolation**


## 5. Microservices vs Monolithic Architecture

| Feature          | Monolith         | Microservices      |
| ---------------- | ---------------- | ------------------ |
| Size             | Single large app | Small services     |
| Scalability      | Whole app        | Per service        |
| Coupling         | Tight            | Loose              |
| Tech Flexibility | Limited          | High               |
| Fault Isolation  | Poor             | Good               |
| Deployment       | Slow             | Fast & independent |


## 6. Real-Life Example: E-commerce System

**Flow**

```
Client
  ↓
API Gateway
  ↓
User Service → User DB
Product Service → Product DB
Order Service → Order DB
Payment Service → Payment DB
Notification Service → Kafka/RabbitMQ
```

* Client accesses API Gateway
* Gateway routes to services
* Services communicate via REST/events
* Each service owns its database
* Centralized logging & monitoring enabled


## 7. Prerequisites for DevOps & Cloud with Microservices

* **Version Control**: Git, GitHub
* **Containers**: Docker
* **Orchestration**: Kubernetes
* **CI/CD**: Jenkins, GitHub Actions
* **Cloud Basics**: AWS, Azure, GCP
* **Monitoring & Logging**: Prometheus, Grafana, ELK
* **Networking**: Load balancing, DNS, HTTP/gRPC
* **Messaging Systems**: Kafka, RabbitMQ, SQS