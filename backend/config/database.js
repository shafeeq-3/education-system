import mongoose from 'mongoose';
import config from './env.js';

const connectDB = async () => {
  try {
    // Prevent multiple connections in serverless environment
    if (mongoose.connection.readyState >= 1) {
      console.log('✅ MongoDB already connected');
      return mongoose.connection;
    }

    const conn = await mongoose.connect(config.mongoUri, {
      // Optimized for serverless
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    // Graceful shutdown (only in non-serverless environment)
    if (process.env.VERCEL !== '1') {
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      });
    }

    return conn;

  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    // Don't exit in serverless environment
    if (process.env.VERCEL !== '1') {
      process.exit(1);
    }
    throw error;
  }
};

export default connectDB;
