# Implementation Guide

## Prerequisites

- Docker or Podman installed
- docker-compose or podman-compose

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd vcc
```

### 2. Start the Services

```bash
# Using Podman
podman-compose up --build -d

# Using Docker
docker-compose up --build -d
```

### 3. Verify Services are Running

```bash
# Check container status
podman ps

# Test health endpoints
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002/health
```

## Service Details

### API Gateway (Port 3000)

The entry point for all client requests. Routes traffic to backend services.

**Environment Variables:**
- `PORT`: Service port (default: 3000)
- `USER_SERVICE_URL`: URL of user service
- `PRODUCT_SERVICE_URL`: URL of product service

### User Service (Port 3001)

Handles user management operations.

**Endpoints:**
- `GET /users` - List all users
- `POST /users` - Create user
- `GET /users/:id` - Get user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Product Service (Port 3002)

Manages product catalog.

**Endpoints:**
- `GET /products` - List all products
- `POST /products` - Create product
- `GET /products/:id` - Get product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

## Container Network

All services communicate via the `microservice-net` bridge network created by docker-compose/podman-compose.

```
┌─────────────────────────────────────┐
│       microservice-net              │
│                                     │
│  api-gateway ◄──► user-service      │
│       │                             │
│       └──────► product-service      │
└─────────────────────────────────────┘
```

## Troubleshooting

### Services won't start

```bash
# Check logs
podman-compose logs

# Rebuild images
podman-compose down
podman-compose up --build
```

### Port already in use

```bash
# Find process using port
lsof -i :3000

# Kill process or use different port
```

### Container network issues

```bash
# Recreate network
podman-compose down
podman network prune
podman-compose up -d
```
