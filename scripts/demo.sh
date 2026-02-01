#!/bin/bash

# Demo script for video recording
# Run each section while explaining

clear
echo "==========================================="
echo "   MICROSERVICES DEMO - Video Recording"
echo "==========================================="
echo ""
read -p "Press Enter to start..."

# Section 1: Show running containers
clear
echo "📦 SECTION 1: Running Containers"
echo "==========================================="
echo ""
podman ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(NAMES|api-gateway|user-service|product-service)"
echo ""
read -p "Press Enter to continue..."

# Section 2: Health checks
clear
echo "🏥 SECTION 2: Health Checks"
echo "==========================================="
echo ""
echo "API Gateway Health:"
curl -s http://localhost:3000/health | python3 -m json.tool
echo ""
echo "User Service Health:"
curl -s http://localhost:3001/health | python3 -m json.tool
echo ""
echo "Product Service Health:"
curl -s http://localhost:3002/health | python3 -m json.tool
echo ""
read -p "Press Enter to continue..."

# Section 3: Service Discovery
clear
echo "🔍 SECTION 3: Service Discovery"
echo "==========================================="
echo ""
curl -s http://localhost:3000/services | python3 -m json.tool
echo ""
read -p "Press Enter to continue..."

# Section 4: Get Users
clear
echo "👥 SECTION 4: Get All Users (via API Gateway)"
echo "==========================================="
echo ""
curl -s http://localhost:3000/api/users | python3 -m json.tool
echo ""
read -p "Press Enter to continue..."

# Section 5: Get Products
clear
echo "📦 SECTION 5: Get All Products (via API Gateway)"
echo "==========================================="
echo ""
curl -s http://localhost:3000/api/products | python3 -m json.tool
echo ""
read -p "Press Enter to continue..."

# Section 6: Create User
clear
echo "➕ SECTION 6: Create New User"
echo "==========================================="
echo ""
echo "Creating user: Demo User (demo@video.com)"
echo ""
curl -s -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo User","email":"demo@video.com"}' | python3 -m json.tool
echo ""
read -p "Press Enter to continue..."

# Section 7: Create Product
clear
echo "➕ SECTION 7: Create New Product"
echo "==========================================="
echo ""
echo "Creating product: Demo Laptop"
echo ""
curl -s -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo Laptop","price":1499.99,"category":"electronics","stock":10}' | python3 -m json.tool
echo ""
read -p "Press Enter to continue..."

# Section 8: Dashboard
clear
echo "📊 SECTION 8: Dashboard (Aggregated Data)"
echo "==========================================="
echo ""
curl -s http://localhost:3000/api/dashboard | python3 -m json.tool
echo ""
read -p "Press Enter to continue..."

# Section 9: Architecture
clear
echo "🏗️ SECTION 9: Architecture"
echo "==========================================="
echo ""
echo "┌─────────────┐    ┌─────────────┐    ┌─────────────┐"
echo "│ API Gateway │───▶│User Service │    │Product Svc  │"
echo "│   :3000     │───▶│   :3001     │    │   :3002     │"
echo "└─────────────┘    └─────────────┘    └─────────────┘"
echo ""
echo "All services communicate over container network"
echo ""
read -p "Press Enter to finish..."

clear
echo "==========================================="
echo "        DEMO COMPLETE! 🎉"
echo "==========================================="
echo ""
echo "GitHub: https://github.com/adarshdubey-star/vcc-microservices"
echo ""
