const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const recordRoutes = require('./routes/records');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { generalLimiter, authLimiter, mutationLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files (API documentation)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rate limiting
app.use('/api/', generalLimiter); // General API rate limit
app.use('/api/auth/', authLimiter); // Stricter limit on auth endpoints
app.use('/api/records', mutationLimiter); // Limit on record mutations

// Health check endpoint (no rate limit)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Documentation route
app.get('/api/docs', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'api-docs.html'));
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔑 API Base URL: http://localhost:${PORT}/api`);
  });
}

module.exports = app;
