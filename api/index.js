import express from 'express';
import cors from 'cors';
import config from '../backend/config/env.js';
import connectDB from '../backend/config/database.js';
import { errorHandler, notFound } from '../backend/middlewares/errorHandler.js';
import { requestLogger, securityHeaders, requestId } from '../backend/middlewares/logger.js';
import authRoutes from '../backend/routes/authRoutes.js';
import userRoutes from '../backend/routes/userRoutes.js';
import academicRoutes from '../backend/routes/academicRoutes.js';
import classRoutes from '../backend/routes/classRoutes.js';
import assignmentRoutes from '../backend/routes/assignmentRoutes.js';
import marksheetRoutes from '../backend/routes/marksheetRoutes.js';
import dashboardRoutes from '../backend/routes/dashboardRoutes.js';
import financeRoutes from '../backend/routes/financeRoutes.js';
import notificationRoutes from '../backend/routes/notificationRoutes.js';
import analyticsRoutes from '../backend/routes/analyticsRoutes.js';

// Connect to database
connectDB();

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

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Education System API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

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

