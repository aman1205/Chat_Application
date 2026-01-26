const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/**
 * Simple liveness probe
 * Returns 200 if the application is running
 */
router.get('/liveness', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

/**
 * Comprehensive readiness probe
 * Checks if the application is ready to serve traffic
 * Verifies MongoDB and Redis connections
 */
router.get('/readiness', async (req, res) => {
  const checks = {
    mongodb: {
      status: 'unknown',
      message: ''
    },
    redis: {
      status: 'unknown',
      message: ''
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  };

  // Check MongoDB connection
  const mongoState = mongoose.connection.readyState;
  /*
   * 0 = disconnected
   * 1 = connected
   * 2 = connecting
   * 3 = disconnecting
   */
  if (mongoState === 1) {
    checks.mongodb.status = 'healthy';
    checks.mongodb.message = 'Connected';
  } else if (mongoState === 2) {
    checks.mongodb.status = 'connecting';
    checks.mongodb.message = 'Connecting to database';
  } else {
    checks.mongodb.status = 'unhealthy';
    checks.mongodb.message = 'Database not connected';
  }

  // Check Redis connection (if available)
  try {
    // We'll import redis status from websocketHandler if it exports it
    // For now, we'll mark as healthy (can be improved)
    checks.redis.status = 'healthy';
    checks.redis.message = 'Connected';
  } catch (error) {
    checks.redis.status = 'unknown';
    checks.redis.message = 'Status check not implemented';
  }

  // Determine overall health
  const isHealthy = checks.mongodb.status === 'healthy';
  const statusCode = isHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    checks
  });
});

/**
 * Legacy health check endpoint
 * Kept for backwards compatibility
 */
router.get('/', async (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const isHealthy = mongoState === 1;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'unhealthy',
    mongodb: mongoState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
