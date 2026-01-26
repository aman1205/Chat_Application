const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Database connection with retry logic and monitoring
 * Implements exponential backoff and connection event handlers
 */
const DataBaseConnection = async (retries = 5) => {
  const options = {
    maxPoolSize: 10,          // Maximum number of sockets
    minPoolSize: 2,           // Minimum number of sockets
    socketTimeoutMS: 45000,   // Close sockets after 45 seconds of inactivity
    serverSelectionTimeoutMS: 5000, // Timeout for server selection
    heartbeatFrequencyMS: 10000,    // Check server health every 10 seconds
  };

  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, options);
      console.log('✅ MongoDB connected successfully');
      return;
    } catch (error) {
      const attempt = i + 1;
      console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed:`, error.message);

      if (i < retries - 1) {
        // Exponential backoff: 5s, 10s, 20s, 40s, 80s
        const delay = 5000 * Math.pow(2, i);
        console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('💥 Failed to connect to MongoDB after all retry attempts');
        throw new Error('Failed to connect to MongoDB after multiple attempts');
      }
    }
  }
};

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  Mongoose disconnected from MongoDB');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 Mongoose reconnected to MongoDB');
});

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🛑 MongoDB connection closed through app termination (SIGINT)');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  try {
    await mongoose.connection.close();
    console.log('🛑 MongoDB connection closed through app termination (SIGTERM)');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

module.exports = DataBaseConnection;