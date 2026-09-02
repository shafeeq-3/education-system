import express from 'express';
import cors from 'cors';
import config from './config/env.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import { requestLogger, securityHeaders, requestId } from './middlewares/logger.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import academicRoutes from './routes/academicRoutes.js';
import classRoutes from './routes/classRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import marksheetRoutes from './routes/marksheetRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

const app = express();

// CORS configuration
app.use(cors({
  origin: config.frontendUrl || '*',
  credentials: true,
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security and logging middlewares
app.use(securityHeaders);
app.use(requestId);
app.use(requestLogger);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Education System API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// API Routes - v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', academicRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1', classRoutes);
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

export default app;
