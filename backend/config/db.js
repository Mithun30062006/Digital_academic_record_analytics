const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mydatabase';

async function testConnection() {
  const maskedUri = MONGO_URI.replace(/\/\/.*@/, "//***:***@");
  console.log(`Attempting to connect to MongoDB: ${maskedUri}`);
  
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000 // Timeout after 5 seconds instead of 30
    });
    console.log('MongoDB Connected Successfully');

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error after initial connect:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
  } catch (err) {
    console.error('CRITICAL: MongoDB connection failed!');
    console.error('URI Attempted:', maskedUri);
    console.error('Error Details:', err.message);
    throw err;
  }
}

async function closeConnection() {
  try {
    await mongoose.connection.close(false);
    console.log('MongoDB connection closed');
  } catch (err) {
    console.error('Error closing MongoDB connection:', err.message);
  }
}

process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeConnection();
  process.exit(0);
});

module.exports = { testConnection, mongoose, closeConnection };
