# Architecture Design

## System Overview

A containerized microservice architecture with three services communicating over a Docker/Podman bridge network.

## Architecture Diagram

```
                              ┌─────────────────────────────────────┐
                              │            Host Machine              │
                              │                                      │
                              │    Exposed Ports:                    │
                              │    localhost:3000 (API Gateway)      │
                              │    localhost:3001 (User Service)     │
                              │    localhost:3002 (Product Service)  │
                              └─────────────┬────────────────────────┘
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        │                                   │                                   │
        │                    Container Network (microservice-net)               │
        │                                   │                                   │
┌───────┴───────────┐           ┌───────────┴───────────┐         ┌─────────────┴───────┐
│                   │           │                       │         │                     │
│   API Gateway     │           │    User Service       │         │   Product Service   │
│   Container       │◄─────────►│    Container          │         │   Container         │
│                   │   HTTP    │                       │         │                     │
│   Port: 3000      │           │   Port: 3001          │         │   Port: 3002        │
│                   │◄──────────┼───────────────────────┼────────►│                     │
│   Node.js 18      │           │   Node.js 18          │         │   Node.js 18        │
│   Express.js      │           │   Express.js          │         │   Express.js        │
│                   │           │                       │         │                     │
└───────────────────┘           └───────────────────────┘         └─────────────────────┘
```

## Request Flow

```
Client
   │
   │  HTTP Request (e.g., GET /api/users)
   ▼
┌──────────────┐
│ API Gateway  │
│  :3000       │
└──────┬───────┘
       │
       │  Routes to appropriate service
       ▼
┌──────────────┐     ┌──────────────┐
│ User Service │     │Product Service│
│  :3001       │     │  :3002       │
└──────────────┘     └──────────────┘
```

## Components

### API Gateway

- **Purpose:** Single entry point for all client requests
- **Responsibilities:**
  - Request routing
  - Service discovery
  - Health monitoring
  - API aggregation

### User Service

- **Purpose:** User management
- **Data:** In-memory user store
- **Operations:** CRUD for users

### Product Service

- **Purpose:** Product catalog management
- **Data:** In-memory product store
- **Operations:** CRUD for products

## Technology Stack

| Component | Technology |
|-----------|------------|
| Container Runtime | Podman / Docker |
| Orchestration | podman-compose / docker-compose |
| Runtime | Node.js 18 Alpine |
| Framework | Express.js |
| HTTP Client | Axios |

## Network Configuration

| Service | Internal Hostname | Port |
|---------|-------------------|------|
| API Gateway | api-gateway | 3000 |
| User Service | user-service | 3001 |
| Product Service | product-service | 3002 |

Services communicate using internal hostnames (e.g., `http://user-service:3001`).
