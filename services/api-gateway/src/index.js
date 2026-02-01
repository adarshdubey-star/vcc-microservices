/**
 * API Gateway Service
 * Routes incoming requests to the appropriate microservice
 * Deployed on VM1 (10.0.0.10:3000)
 */

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Service URLs - configured for VM deployment
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://10.0.0.20:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://10.0.0.30:3002';

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    service: 'api-gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Service discovery endpoint
app.get('/services', async (req, res) => {
  const services = {
    gateway: { url: `http://10.0.0.10:${PORT}`, status: 'online' },
    users: { url: USER_SERVICE_URL, status: 'unknown' },
    products: { url: PRODUCT_SERVICE_URL, status: 'unknown' }
  };

  // Check service health
  try {
    await axios.get(`${USER_SERVICE_URL}/health`, { timeout: 2000 });
    services.users.status = 'online';
  } catch (error) {
    services.users.status = 'offline';
  }

  try {
    await axios.get(`${PRODUCT_SERVICE_URL}/health`, { timeout: 2000 });
    services.products.status = 'online';
  } catch (error) {
    services.products.status = 'offline';
  }

  res.json(services);
});

// ==================== USER SERVICE ROUTES ====================

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/users`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(error.response?.status || 503).json({
      error: 'User service unavailable',
      details: error.message
    });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/users/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(error.response?.status || 503).json({
      error: 'User service unavailable',
      details: error.message
    });
  }
});

// Create user
app.post('/api/users', async (req, res) => {
  try {
    const response = await axios.post(`${USER_SERVICE_URL}/users`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(error.response?.status || 503).json({
      error: 'User service unavailable',
      details: error.message
    });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const response = await axios.put(`${USER_SERVICE_URL}/users/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(error.response?.status || 503).json({
      error: 'User service unavailable',
      details: error.message
    });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${USER_SERVICE_URL}/users/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(error.response?.status || 503).json({
      error: 'User service unavailable',
      details: error.message
    });
  }
});

// ==================== PRODUCT SERVICE ROUTES ====================

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const response = await axios.get(`${PRODUCT_SERVICE_URL}/products`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(error.response?.status || 503).json({
      error: 'Product service unavailable',
      details: error.message
    });
  }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const response = await axios.get(`${PRODUCT_SERVICE_URL}/products/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching product:', error.message);
    res.status(error.response?.status || 503).json({
      error: 'Product service unavailable',
      details: error.message
    });
  }
});

// Create product
app.post('/api/products', async (req, res) => {
  try {
    const response = await axios.post(`${PRODUCT_SERVICE_URL}/products`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(error.response?.status || 503).json({
      error: 'Product service unavailable',
      details: error.message
    });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const response = await axios.put(`${PRODUCT_SERVICE_URL}/products/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error updating product:', error.message);
    res.status(error.response?.status || 503).json({
      error: 'Product service unavailable',
      details: error.message
    });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${PRODUCT_SERVICE_URL}/products/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(error.response?.status || 503).json({
      error: 'Product service unavailable',
      details: error.message
    });
  }
});

// ==================== AGGREGATION ENDPOINTS ====================

// Get dashboard data (aggregates from multiple services)
app.get('/api/dashboard', async (req, res) => {
  try {
    const [usersResponse, productsResponse] = await Promise.allSettled([
      axios.get(`${USER_SERVICE_URL}/users`),
      axios.get(`${PRODUCT_SERVICE_URL}/products`)
    ]);

    res.json({
      users: {
        count: usersResponse.status === 'fulfilled' ? usersResponse.value.data.length : 0,
        status: usersResponse.status === 'fulfilled' ? 'available' : 'unavailable'
      },
      products: {
        count: productsResponse.status === 'fulfilled' ? productsResponse.value.data.length : 0,
        status: productsResponse.status === 'fulfilled' ? 'available' : 'unavailable'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to aggregate dashboard data' });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Microservices API Gateway',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      services: '/services',
      users: '/api/users',
      products: '/api/products',
      dashboard: '/api/dashboard'
    },
    documentation: 'https://github.com/your-repo/vcc'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                    API GATEWAY SERVICE                      ║
╠════════════════════════════════════════════════════════════╣
║  Status:    Running                                         ║
║  Port:      ${PORT}                                            ║
║  Host:      0.0.0.0                                         ║
╠════════════════════════════════════════════════════════════╣
║  Connected Services:                                        ║
║  - User Service:    ${USER_SERVICE_URL.padEnd(30)}║
║  - Product Service: ${PRODUCT_SERVICE_URL.padEnd(30)}║
╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
