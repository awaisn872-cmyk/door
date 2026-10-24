import dns from 'node:dns';
import mongoose from 'mongoose';

// Ensure DNS fallback resolver on Windows and restrictive ISP DNS networks
// This resolves the common 'querySrv ECONNREFUSED' issue when connecting to MongoDB Atlas SRV URIs
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (err) {
  console.warn('Notice: Unable to set custom DNS servers, using system default:', err.message);
}

/**
 * Safely masks database credentials from connection strings for logging
 */
export function sanitizeMongoUri(uri = '') {
  if (!uri) return '[not configured]';
  return uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
}

/**
 * Connect to MongoDB with predictable timeout and database name
 */
export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables.');
  }

  const sanitized = sanitizeMongoUri(uri);

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'doordash',
      serverSelectionTimeoutMS: 8000,
      retryWrites: true,
      w: 'majority'
    });

    console.log(`MongoDB connected successfully to database: "${conn.connection.name}" on ${sanitized}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:');
    console.error(`- Target: ${sanitized}`);
    console.error(`- Error Code: ${error.code || 'UNKNOWN'}`);
    console.error(`- Reason: ${error.message}`);

    if (error.message.includes('querySrv') || error.code === 'ECONNREFUSED') {
      console.error('- DNS SRV Resolution hint: DNS query was refused. Check your internet connection or local DNS settings.');
    } else if (error.message.includes('Authentication failed') || error.code === 8000) {
      console.error('- Authentication hint: Check your MongoDB username and password in backend/.env.');
    } else if (error.message.includes('bad auth') || error.name === 'MongoServerSelectionError') {
      console.error('- Network hint: Ensure your IP is whitelisted in MongoDB Atlas Network Access (e.g. 0.0.0.0/0 for live dev/render).');
    }

    throw error;
  }
}

/**
 * Returns current database health status
 */
export function getDatabaseHealth() {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  return {
    status: states[state] || 'unknown',
    connected: state === 1,
    databaseName: mongoose.connection.name || 'doordash',
    readyState: state
  };
}
