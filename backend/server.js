import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import config from './config/env.js';
import connectDB from './config/database.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import { requestLogger, securityHeaders, requestId } from './middlewares/logger.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import academicRoutes from './routes/academicRoutes.js';
import classRoutes from './routes/classRoutes.js';
// enrollmentRoutes removed - using classRoutes for enrollments
import assignmentRoutes from './routes/assignmentRoutes.js';
import marksheetRoutes from './routes/marksheetRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// Connect to database
connectDB();

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: config.frontendUrl,
    credentials: true,
  },
});

// CORS configuration
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security and logging middlewares
app.use(securityHeaders);
app.use(requestId);
app.use(requestLogger);

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

// Make io accessible in routes
app.set('io', io);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// API Routes - v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', academicRoutes); // Move before userRoutes to ensure public routes work
app.use('/api/v1', userRoutes);
app.use('/api/v1', classRoutes); // Includes classes, timetables, and enrollments
app.use('/api/v1', assignmentRoutes);
app.use('/api/v1', marksheetRoutes);
app.use('/api/v1', dashboardRoutes);
app.use('/api/v1', financeRoutes);
app.use('/api/v1', notificationRoutes);
app.use('/api/v1', analyticsRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
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

// Export app for Vercel
export default app;
export { io };
