# Microservices Deployment Project Report

**Course:** Virtual and Cloud Computing  
**Project:** Containerized Microservices Application  
**GitHub Repository:** https://github.com/adarshdubey-star/vcc-microservices

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Objective](#2-objective)
3. [Architecture Design](#3-architecture-design)
4. [Technology Stack](#4-technology-stack)
5. [Implementation Details](#5-implementation-details)
6. [Deployment Instructions](#6-deployment-instructions)
7. [API Documentation](#7-api-documentation)
8. [Testing Results](#8-testing-results)
9. [Conclusion](#9-conclusion)

---

## 1. Executive Summary

This project demonstrates a microservices-based application deployed using container technology. The application consists of three independent services:

- **API Gateway** - Central entry point for all client requests
- **User Service** - Manages user data and operations
- **Product Service** - Handles product catalog management

The services communicate over a container network, showcasing distributed system principles including service discovery, load distribution, and API aggregation.

---

## 2. Objective

Create and configure multiple isolated environments, establish networking between them, and deploy a microservice-based application across connected services.

### Deliverables

| Deliverable | Status | Description |
|-------------|--------|-------------|
| Document Report | ✅ Complete | This document |
| Architecture Design | ✅ Complete | System diagrams and component details |
| Source Code Repository | ✅ Complete | GitHub repository with all code |
| Working Demo | ✅ Complete | Deployed and tested services |

---

## 3. Architecture Design

### 3.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HOST MACHINE                                 │
│                                                                      │
│    Exposed Ports:                                                    │
│    localhost:3000 (API Gateway)                                      │
│    localhost:3001 (User Service)                                     │
│    localhost:3002 (Product Service)                                  │
│                                                                      │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────┴──────────────────────────────────────┐
│                    CONTAINER NETWORK                                 │
│                   (microservice-net)                                 │
│                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │                 │  │                 │  │                 │      │
│  │   API GATEWAY   │  │  USER SERVICE   │  │ PRODUCT SERVICE │      │
│  │                 │  │                 │  │                 │      │
│  │   Container 1   │  │   Container 2   │  │   Container 3   │      │
│  │   Port: 3000    │  │   Port: 3001    │  │   Port: 3002    │      │
│  │                 │  │                 │  │                 │      │
│  │   Node.js 18    │  │   Node.js 18    │  │   Node.js 18    │      │
│  │   Express.js    │  │   Express.js    │  │   Express.js    │      │
│  │                 │  │                 │  │                 │      │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘      │
│           │                    │                    │                │
│           └────────────────────┴────────────────────┘                │
│                         HTTP Communication                           │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.2 Request Flow Diagram

```
    ┌──────────┐
    │  Client  │
    └────┬─────┘
         │
         │ HTTP Request
         ▼
    ┌──────────────┐
    │ API Gateway  │
    │   :3000      │
    └──────┬───────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
┌─────────┐  ┌─────────┐
│  User   │  │ Product │
│ Service │  │ Service │
│  :3001  │  │  :3002  │
└─────────┘  └─────────┘
```

### 3.3 Component Responsibilities

| Component | Port | Responsibilities |
|-----------|------|------------------|
| API Gateway | 3000 | Request routing, Service discovery, Health monitoring, API aggregation |
| User Service | 3001 | User CRUD operations, User validation, Role management |
| Product Service | 3002 | Product CRUD operations, Inventory management, Category management |

---

## 4. Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Container Runtime | Podman | 5.7.1 |
| Orchestration | podman-compose | 1.5.0 |
| Runtime | Node.js | 18 LTS |
| Framework | Express.js | 4.18.2 |
| HTTP Client | Axios | 1.6.2 |
| Base Image | Alpine Linux | Latest |

### 4.1 Why Containers?

| Aspect | Benefit |
|--------|---------|
| **Isolation** | Each service runs in its own container |
| **Portability** | Same containers work on any system |
| **Scalability** | Easy to scale individual services |
| **Resource Efficiency** | Lightweight compared to VMs |
| **Fast Deployment** | Seconds to start vs minutes for VMs |

---

## 5. Implementation Details

### 5.1 Project Structure

```
vcc-microservices/
├── docker-compose.yml          # Container orchestration
├── README.md                   # Project documentation
├── package.json                # Root package configuration
├── docs/
│   ├── ARCHITECTURE.md         # Architecture documentation
│   ├── IMPLEMENTATION_GUIDE.md # Setup instructions
│   └── PROJECT_REPORT.md       # This report
├── scripts/
│   ├── demo.sh                 # Demo script for video
│   └── test-services.sh        # Testing script
└── services/
    ├── api-gateway/
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/index.js
    ├── user-service/
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/index.js
    └── product-service/
        ├── Dockerfile
        ├── package.json
        └── src/index.js
```

### 5.2 Docker Compose Configuration

```yaml
version: '3.8'

services:
  api-gateway:
    build: ./services/api-gateway
    container_name: api-gateway
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - USER_SERVICE_URL=http://user-service:3001
      - PRODUCT_SERVICE_URL=http://product-service:3002
    depends_on:
      - user-service
      - product-service
    networks:
      - microservice-net

  user-service:
    build: ./services/user-service
    container_name: user-service
    ports:
      - "3001:3001"
    networks:
      - microservice-net

  product-service:
    build: ./services/product-service
    container_name: product-service
    ports:
      - "3002:3002"
    networks:
      - microservice-net

networks:
  microservice-net:
    driver: bridge
```

### 5.3 Service Implementation

#### API Gateway (Key Features)
- Routes `/api/users/*` to User Service
- Routes `/api/products/*` to Product Service
- Provides `/services` endpoint for service discovery
- Provides `/api/dashboard` for data aggregation

#### User Service (Key Features)
- In-memory user storage
- Full CRUD operations
- User validation and duplicate checking
- Statistics endpoint

#### Product Service (Key Features)
- In-memory product catalog
- Full CRUD operations
- Stock management
- Category filtering

---

## 6. Deployment Instructions

### 6.1 Prerequisites

- Docker or Podman installed
- docker-compose or podman-compose
- Git (to clone repository)

### 6.2 Deployment Steps

```bash
# Step 1: Clone the repository
git clone https://github.com/adarshdubey-star/vcc-microservices.git
cd vcc-microservices

# Step 2: Start all services
podman-compose up --build -d

# Step 3: Verify services are running
podman ps

# Step 4: Test the services
curl http://localhost:3000/health
```

### 6.3 Management Commands

| Command | Description |
|---------|-------------|
| `podman-compose up -d` | Start services |
| `podman-compose down` | Stop services |
| `podman-compose logs -f` | View logs |
| `podman-compose restart` | Restart services |

---

## 7. API Documentation

### 7.1 API Gateway Endpoints (Port 3000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | Health check |
| GET | `/services` | Service discovery |
| GET | `/api/dashboard` | Aggregated statistics |

### 7.2 User Endpoints (via Gateway)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### 7.3 Product Endpoints (via Gateway)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### 7.4 Sample API Requests

**Create User:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'
```

**Create Product:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","price":999.99,"category":"electronics"}'
```

---

## 8. Testing Results

### 8.1 Health Check Results

```json
// API Gateway
{"service":"api-gateway","status":"healthy","uptime":1234.56}

// User Service
{"service":"user-service","status":"healthy","totalUsers":3}

// Product Service
{"service":"product-service","status":"healthy","totalProducts":5}
```

### 8.2 Service Discovery Result

```json
{
  "gateway": {"url":"http://localhost:3000","status":"online"},
  "users": {"url":"http://user-service:3001","status":"online"},
  "products": {"url":"http://product-service:3002","status":"online"}
}
```

### 8.3 Dashboard Aggregation Result

```json
{
  "users": {"count": 4, "status": "available"},
  "products": {"count": 5, "status": "available"},
  "timestamp": "2026-02-01T10:08:34.243Z"
}
```

---

## 9. Conclusion

### 9.1 Achievements

- ✅ Successfully deployed 3 microservices in containers
- ✅ Established inter-service communication over container network
- ✅ Implemented RESTful APIs with full CRUD operations
- ✅ Created service discovery and health monitoring
- ✅ Documented architecture and deployment procedures
- ✅ Published source code to GitHub repository

### 9.2 Key Learnings

1. **Containerization** provides lightweight isolation compared to VMs
2. **Microservices** architecture enables independent scaling and deployment
3. **API Gateway pattern** centralizes routing and simplifies client access
4. **Service discovery** is essential for dynamic container environments
5. **Container networking** enables seamless inter-service communication

### 9.3 Future Enhancements

- Add database persistence (MongoDB/PostgreSQL)
- Implement authentication and authorization
- Add load balancing for horizontal scaling
- Implement circuit breaker pattern for resilience
- Add monitoring with Prometheus/Grafana

---

## References

- GitHub Repository: https://github.com/adarshdubey-star/vcc-microservices
- Docker Documentation: https://docs.docker.com/
- Podman Documentation: https://podman.io/
- Express.js Documentation: https://expressjs.com/

---