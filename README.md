# Microservices Deployment with Containers

A containerized microservice application with API Gateway, User Service, and Product Service.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Container Network                          │
│                                                                 │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│   │ API Gateway │───▶│User Service │    │Product Svc  │        │
│   │   :3000     │───▶│   :3001     │    │   :3002     │        │
│   └─────────────┘    └─────────────┘    └─────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Using Podman Compose
```bash
podman-compose up --build -d
```

### Using Docker Compose
```bash
docker-compose up --build -d
```

### Test the Services
```bash
# Health checks
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002/health

# API endpoints
curl http://localhost:3000/api/users
curl http://localhost:3000/api/products
curl http://localhost:3000/api/dashboard
```

## 📁 Project Structure

```
vcc/
├── docker-compose.yml          # Container orchestration
├── services/
│   ├── api-gateway/            # API Gateway (Port 3000)
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/index.js
│   ├── user-service/           # User Service (Port 3001)
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/index.js
│   └── product-service/        # Product Service (Port 3002)
│       ├── Dockerfile
│       ├── package.json
│       └── src/index.js
├── docs/
│   ├── ARCHITECTURE.md
│   └── IMPLEMENTATION_GUIDE.md
└── scripts/
    └── test-services.sh
```

## 🔌 API Endpoints

### API Gateway (localhost:3000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |
| GET | `/services` | Service discovery |
| GET | `/api/users` | List all users |
| POST | `/api/users` | Create user |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create product |
| GET | `/api/products/:id` | Get product by ID |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/dashboard` | Aggregated data |

## 🛠️ Management Commands

```bash
# Start services
podman-compose up -d

# View logs
podman-compose logs -f

# Stop services
podman-compose down

# Restart services
podman-compose restart

# Rebuild and restart
podman-compose up --build -d
```

## 📊 Example Requests

```bash
# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'

# Create a product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","price":999.99,"category":"electronics"}'

# Get dashboard
curl http://localhost:3000/api/dashboard
```

## License

MIT License
