/**
 * Local Development Server with Socket.IO Support
 * 
 * NOTE: This file is used ONLY for local development.
 * For Vercel deployment, see api/index.js
 * 
 * SOCKET.IO LIMITATION ON VERCEL:
 * Socket.IO requires a persistent WebSocket connection, which is NOT supported
 * by Vercel Serverless Functions. For production Socket.IO, you need:
 * - Separate WebSocket server (Railway, Render, DigitalOcean, AWS EC2, etc.)
 * - Or use a managed service like Pusher, Ably, or Socket.IO's managed platform
 * 
 * The REST API will work fine on Vercel, but real-time features need alternative hosting.
 */

import { createServer } from 'http';
import { Server } from 'socket.io';
import config from './config/env.js';
import connectDB from './config/database.js';
import app from './app.js';

// Connect to database
connectDB();

const httpServer = createServer(app);

// Socket.io setup (LOCAL DEVELOPMENT ONLY)
const io = new Server(httpServer, {
  cors: {
    origin: config.frontendUrl,
    credentials: true,
  },
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// Make io accessible in routes (for local development)
app.set('io', io);

// Start server (LOCAL DEVELOPMENT ONLY)
const PORT = config.port;

httpServer.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api/v1`);
  console.log('='.repeat(50));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  httpServer.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Export for testing purposes
export { io };
export default app;
