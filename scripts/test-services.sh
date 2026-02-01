#!/bin/bash

#############################################################################
# Service Testing Script
# Tests all microservices and their connectivity
#############################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
API_GATEWAY_URL=${API_GATEWAY_URL:-"http://localhost:3000"}
USER_SERVICE_URL=${USER_SERVICE_URL:-"http://localhost:3001"}
PRODUCT_SERVICE_URL=${PRODUCT_SERVICE_URL:-"http://localhost:3002"}

log() {
    echo -e "${GREEN}[TEST]${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

fail() {
    echo -e "${RED}✗${NC} $1"
}

section() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

#############################################################################
# Test Functions
#############################################################################

test_health() {
    local service=$1
    local url=$2
    
    log "Testing health endpoint: $url/health"
    
    response=$(curl -s -w "\n%{http_code}" "$url/health" 2>/dev/null)
    http_code=$(echo "$response" | tail -1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" == "200" ]; then
        success "$service health check passed"
        echo "  Response: $body" | head -c 100
        echo ""
        return 0
    else
        fail "$service health check failed (HTTP $http_code)"
        return 1
    fi
}

test_crud() {
    local resource=$1
    local url=$2
    
    log "Testing CRUD operations for $resource"
    
    # GET all
    log "  GET all $resource..."
    response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null)
    http_code=$(echo "$response" | tail -1)
    if [ "$http_code" == "200" ]; then
        success "  GET all $resource"
    else
        fail "  GET all $resource (HTTP $http_code)"
    fi
    
    # POST (create)
    log "  POST (create) $resource..."
    if [ "$resource" == "users" ]; then
        post_data='{"name":"Test User","email":"test@example.com","role":"user"}'
    else
        post_data='{"name":"Test Product","price":99.99,"category":"test"}'
    fi
    
    response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$post_data" "$url" 2>/dev/null)
    http_code=$(echo "$response" | tail -1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" == "201" ]; then
        success "  POST $resource"
        # Extract ID from response
        id=$(echo "$body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo "    Created ID: $id"
    else
        fail "  POST $resource (HTTP $http_code)"
        id=""
    fi
    
    # GET by ID
    if [ -n "$id" ]; then
        log "  GET $resource by ID..."
        response=$(curl -s -w "\n%{http_code}" "$url/$id" 2>/dev/null)
        http_code=$(echo "$response" | tail -1)
        if [ "$http_code" == "200" ]; then
            success "  GET $resource by ID"
        else
            fail "  GET $resource by ID (HTTP $http_code)"
        fi
        
        # DELETE
        log "  DELETE $resource..."
        response=$(curl -s -w "\n%{http_code}" -X DELETE "$url/$id" 2>/dev/null)
        http_code=$(echo "$response" | tail -1)
        if [ "$http_code" == "200" ]; then
            success "  DELETE $resource"
        else
            fail "  DELETE $resource (HTTP $http_code)"
        fi
    fi
}

#############################################################################
# Main Tests
#############################################################################

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           MICROSERVICES TEST SUITE                         ║"
echo "╚════════════════════════════════════════════════════════════╝"

section "Service Health Checks"

gateway_ok=false
users_ok=false
products_ok=false

if test_health "API Gateway" "$API_GATEWAY_URL"; then
    gateway_ok=true
fi

if test_health "User Service" "$USER_SERVICE_URL"; then
    users_ok=true
fi

if test_health "Product Service" "$PRODUCT_SERVICE_URL"; then
    products_ok=true
fi

section "API Gateway Routing Tests"

if [ "$gateway_ok" = true ]; then
    log "Testing API Gateway routing to User Service..."
    response=$(curl -s -w "\n%{http_code}" "$API_GATEWAY_URL/api/users" 2>/dev/null)
    http_code=$(echo "$response" | tail -1)
    if [ "$http_code" == "200" ]; then
        success "Gateway -> User Service routing"
    else
        fail "Gateway -> User Service routing (HTTP $http_code)"
    fi
    
    log "Testing API Gateway routing to Product Service..."
    response=$(curl -s -w "\n%{http_code}" "$API_GATEWAY_URL/api/products" 2>/dev/null)
    http_code=$(echo "$response" | tail -1)
    if [ "$http_code" == "200" ]; then
        success "Gateway -> Product Service routing"
    else
        fail "Gateway -> Product Service routing (HTTP $http_code)"
    fi
    
    log "Testing service discovery endpoint..."
    response=$(curl -s -w "\n%{http_code}" "$API_GATEWAY_URL/services" 2>/dev/null)
    http_code=$(echo "$response" | tail -1)
    if [ "$http_code" == "200" ]; then
        success "Service discovery endpoint"
        echo "$response" | head -n -1 | head -c 200
        echo ""
    else
        fail "Service discovery endpoint (HTTP $http_code)"
    fi
    
    log "Testing dashboard aggregation..."
    response=$(curl -s -w "\n%{http_code}" "$API_GATEWAY_URL/api/dashboard" 2>/dev/null)
    http_code=$(echo "$response" | tail -1)
    if [ "$http_code" == "200" ]; then
        success "Dashboard aggregation"
        echo "$response" | head -n -1
        echo ""
    else
        fail "Dashboard aggregation (HTTP $http_code)"
    fi
else
    fail "Skipping Gateway routing tests - Gateway not available"
fi

section "Direct Service CRUD Tests"

if [ "$users_ok" = true ]; then
    test_crud "users" "$USER_SERVICE_URL/users"
else
    fail "Skipping User Service CRUD tests - Service not available"
fi

if [ "$products_ok" = true ]; then
    test_crud "products" "$PRODUCT_SERVICE_URL/products"
else
    fail "Skipping Product Service CRUD tests - Service not available"
fi

section "Test Summary"

echo ""
echo "Service Status:"
[ "$gateway_ok" = true ] && success "API Gateway: Online" || fail "API Gateway: Offline"
[ "$users_ok" = true ] && success "User Service: Online" || fail "User Service: Offline"
[ "$products_ok" = true ] && success "Product Service: Online" || fail "Product Service: Offline"
echo ""
echo "Tests completed!"
