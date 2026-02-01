/**
 * User Service
 * Handles user management operations
 * Deployed on VM2 (10.0.0.20:3001)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// In-memory database (for demonstration)
let users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'user',
    createdAt: '2024-01-16T14:20:00Z'
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob.wilson@example.com',
    role: 'user',
    createdAt: '2024-01-17T09:45:00Z'
  }
];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    service: 'user-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    totalUsers: users.length
  });
});

// Get all users
app.get('/users', (req, res) => {
  const { role, limit } = req.query;
  
  let result = [...users];
  
  // Filter by role if provided
  if (role) {
    result = result.filter(user => user.role === role);
  }
  
  // Limit results if provided
  if (limit) {
    result = result.slice(0, parseInt(limit));
  }
  
  res.json(result);
});

// Get user by ID
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  
  if (!user) {
    return res.status(404).json({
      error: 'User not found',
      id: req.params.id
    });
  }
  
  res.json(user);
});

// Create new user
app.post('/users', (req, res) => {
  const { name, email, role } = req.body;
  
  // Validation
  if (!name || !email) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Name and email are required'
    });
  }
  
  // Check for duplicate email
  if (users.find(u => u.email === email)) {
    return res.status(409).json({
      error: 'Conflict',
      message: 'User with this email already exists'
    });
  }
  
  const newUser = {
    id: uuidv4(),
    name,
    email,
    role: role || 'user',
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  console.log(`[USER SERVICE] Created user: ${newUser.id}`);
  
  res.status(201).json(newUser);
});

// Update user
app.put('/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      error: 'User not found',
      id: req.params.id
    });
  }
  
  const { name, email, role } = req.body;
  
  // Check for duplicate email (excluding current user)
  if (email && users.find(u => u.email === email && u.id !== req.params.id)) {
    return res.status(409).json({
      error: 'Conflict',
      message: 'User with this email already exists'
    });
  }
  
  users[index] = {
    ...users[index],
    name: name || users[index].name,
    email: email || users[index].email,
    role: role || users[index].role,
    updatedAt: new Date().toISOString()
  };
  
  console.log(`[USER SERVICE] Updated user: ${req.params.id}`);
  
  res.json(users[index]);
});

// Delete user
app.delete('/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      error: 'User not found',
      id: req.params.id
    });
  }
  
  const deletedUser = users.splice(index, 1)[0];
  
  console.log(`[USER SERVICE] Deleted user: ${req.params.id}`);
  
  res.json({
    message: 'User deleted successfully',
    user: deletedUser
  });
});

// Get user statistics
app.get('/stats', (req, res) => {
  const stats = {
    totalUsers: users.length,
    byRole: {
      admin: users.filter(u => u.role === 'admin').length,
      user: users.filter(u => u.role === 'user').length
    },
    lastCreated: users.length > 0 
      ? users.reduce((latest, user) => 
          new Date(user.createdAt) > new Date(latest.createdAt) ? user : latest
        )
      : null
  };
  
  res.json(stats);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'user-service',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      users: '/users',
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
║                     USER SERVICE                            ║
╠════════════════════════════════════════════════════════════╣
║  Status:    Running                                         ║
║  Port:      ${PORT}                                            ║
║  Host:      0.0.0.0                                         ║
║  Users:     ${users.length} loaded                                       ║
╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
