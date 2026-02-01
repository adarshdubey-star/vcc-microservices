/**
 * Product Service
 * Handles product catalog operations
 * Deployed on VM3 (10.0.0.30:3002)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// In-memory database (for demonstration)
let products = [
  {
    id: '1',
    name: 'Laptop Pro',
    description: 'High-performance laptop for professionals',
    price: 1299.99,
    category: 'electronics',
    stock: 50,
    createdAt: '2024-01-10T08:00:00Z'
  },
  {
    id: '2',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with long battery life',
    price: 49.99,
    category: 'electronics',
    stock: 200,
    createdAt: '2024-01-11T09:30:00Z'
  },
  {
    id: '3',
    name: 'Office Chair',
    description: 'Comfortable ergonomic office chair',
    price: 299.99,
    category: 'furniture',
    stock: 30,
    createdAt: '2024-01-12T11:15:00Z'
  },
  {
    id: '4',
    name: 'Standing Desk',
    description: 'Adjustable height standing desk',
    price: 599.99,
    category: 'furniture',
    stock: 25,
    createdAt: '2024-01-13T14:00:00Z'
  },
  {
    id: '5',
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with Cherry MX switches',
    price: 149.99,
    category: 'electronics',
    stock: 100,
    createdAt: '2024-01-14T16:45:00Z'
  }
];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    service: 'product-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    totalProducts: products.length
  });
});

// Get all products
app.get('/products', (req, res) => {
  const { category, minPrice, maxPrice, inStock, limit, sort } = req.query;
  
  let result = [...products];
  
  // Filter by category
  if (category) {
    result = result.filter(p => p.category === category);
  }
  
  // Filter by price range
  if (minPrice) {
    result = result.filter(p => p.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    result = result.filter(p => p.price <= parseFloat(maxPrice));
  }
  
  // Filter by stock availability
  if (inStock === 'true') {
    result = result.filter(p => p.stock > 0);
  }
  
  // Sort products
  if (sort) {
    const [field, order] = sort.split(':');
    result.sort((a, b) => {
      if (order === 'desc') {
        return b[field] > a[field] ? 1 : -1;
      }
      return a[field] > b[field] ? 1 : -1;
    });
  }
  
  // Limit results
  if (limit) {
    result = result.slice(0, parseInt(limit));
  }
  
  res.json(result);
});

// Get product by ID
app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  
  if (!product) {
    return res.status(404).json({
      error: 'Product not found',
      id: req.params.id
    });
  }
  
  res.json(product);
});

// Create new product
app.post('/products', (req, res) => {
  const { name, description, price, category, stock } = req.body;
  
  // Validation
  if (!name || price === undefined) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Name and price are required'
    });
  }
  
  if (price < 0) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Price must be a positive number'
    });
  }
  
  const newProduct = {
    id: uuidv4(),
    name,
    description: description || '',
    price: parseFloat(price),
    category: category || 'uncategorized',
    stock: parseInt(stock) || 0,
    createdAt: new Date().toISOString()
  };
  
  products.push(newProduct);
  
  console.log(`[PRODUCT SERVICE] Created product: ${newProduct.id}`);
  
  res.status(201).json(newProduct);
});

// Update product
app.put('/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      error: 'Product not found',
      id: req.params.id
    });
  }
  
  const { name, description, price, category, stock } = req.body;
  
  if (price !== undefined && price < 0) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Price must be a positive number'
    });
  }
  
  products[index] = {
    ...products[index],
    name: name || products[index].name,
    description: description !== undefined ? description : products[index].description,
    price: price !== undefined ? parseFloat(price) : products[index].price,
    category: category || products[index].category,
    stock: stock !== undefined ? parseInt(stock) : products[index].stock,
    updatedAt: new Date().toISOString()
  };
  
  console.log(`[PRODUCT SERVICE] Updated product: ${req.params.id}`);
  
  res.json(products[index]);
});

// Delete product
app.delete('/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      error: 'Product not found',
      id: req.params.id
    });
  }
  
  const deletedProduct = products.splice(index, 1)[0];
  
  console.log(`[PRODUCT SERVICE] Deleted product: ${req.params.id}`);
  
  res.json({
    message: 'Product deleted successfully',
    product: deletedProduct
  });
});

// Update stock (increment/decrement)
app.patch('/products/:id/stock', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      error: 'Product not found',
      id: req.params.id
    });
  }
  
  const { quantity } = req.body;
  
  if (quantity === undefined) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Quantity is required'
    });
  }
  
  const newStock = products[index].stock + parseInt(quantity);
  
  if (newStock < 0) {
    return res.status(400).json({
      error: 'Insufficient stock',
      currentStock: products[index].stock,
      requestedChange: quantity
    });
  }
  
  products[index].stock = newStock;
  products[index].updatedAt = new Date().toISOString();
  
  console.log(`[PRODUCT SERVICE] Updated stock for product ${req.params.id}: ${newStock}`);
  
  res.json(products[index]);
});

// Get product statistics
app.get('/stats', (req, res) => {
  const stats = {
    totalProducts: products.length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
    byCategory: {},
    lowStock: products.filter(p => p.stock < 10).length,
    outOfStock: products.filter(p => p.stock === 0).length
  };
  
  // Count by category
  products.forEach(p => {
    stats.byCategory[p.category] = (stats.byCategory[p.category] || 0) + 1;
  });
  
  res.json(stats);
});

// Get categories
app.get('/categories', (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];
  res.json(categories);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'product-service',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      products: '/products',
      categories: '/categories',
      stats: '/stats'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                    PRODUCT SERVICE                          ║
╠════════════════════════════════════════════════════════════╣
║  Status:    Running                                         ║
║  Port:      ${PORT}                                            ║
║  Host:      0.0.0.0                                         ║
║  Products:  ${products.length} loaded                                       ║
╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
