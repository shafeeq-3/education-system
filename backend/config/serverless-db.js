import mongoose from 'mongoose';
import config from './env.js';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in serverless environments. This prevents creating a new connection on every request.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(config.mongoUri, opts).then((mongoose) => {
      console.log('✅ MongoDB Connected (Serverless)');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
