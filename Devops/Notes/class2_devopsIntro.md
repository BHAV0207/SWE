# Class 2 – Introduction to DevOps

## 1. Overview of DevOps
**DevOps = Development + Operations**  
A combination of practices, tools, and culture aimed at faster and more reliable software delivery.  
It brings development and operations teams together to improve collaboration, automation, and efficiency.

## 2. Challenges in DevOps
The biggest challenge is **cultural change**.  
Teams often resist new workflows, requiring a mindset shift, shared responsibility, and strong teamwork.

## 3. Key Concepts in DevOps

### DevOps Philosophy
- Breaks silos between development and operations
- Promotes collaboration, automation, and ownership across teams

### Shift Left Approach
- Testing and security are introduced early in the development lifecycle
- Helps detect bugs and vulnerabilities sooner
- Reduces cost and effort of fixing issues later

## 4. Security Testing in DevOps

### Types of Security Testing
- **SAST (Static Application Security Testing)**  
  Analyzes source code without executing it
- **DAST (Dynamic Application Security Testing)**  
  Tests a running application for runtime vulnerabilities
- **SCA (Software Composition Analysis)**  
  Scans third-party libraries for known vulnerabilities

### Example of Code Vulnerability
- SQL Injection is a common security issue
- Using `Statement` in Java can allow injection attacks
- Using `PreparedStatement` prevents SQL injection by safely handling inputs

## 5. Continuous Integration (CI)

### CI Pipeline Steps
- Code checkout
- Install dependencies
- Linting
- Build application
- Run unit tests
- Security checks (SAST and SCA)
- Create artifacts (Docker images or binaries)
- Deploy to staging environment

## 6. Continuous Deployment (CD)
- Triggered after successful CI
- Deployment is fully automated
- Manual intervention only on failure
- Enables fast and frequent releases

## 7. Communication and Coordination in DevOps

### API Gateway
- Single entry point for client requests
- Handles routing, authentication, and throttling

### Microservices Communication
- **Synchronous**: Real-time, blocking communication
- **Asynchronous**: Non-blocking, event-driven communication
- Message brokers such as RabbitMQ and Kafka are commonly used

## 8. Conclusion
DevOps integrates development, operations, testing, and security.  
It enhances collaboration, automation, delivery speed, efficiency, and overall software reliability.