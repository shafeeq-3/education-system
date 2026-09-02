import { errorResponse } from '../utils/response.js';
import { AppError } from '../utils/errors.js';
import config from '../config/env.js';

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Log error
  console.error('Error:', {
    message: err.message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.userId || 'unauthenticated'
  });
  
  // Operational errors (known errors)
  if (err.isOperational) {
    return errorResponse(
      res,
      err.statusCode,
      err.code,
      err.message,
      err.details
    );
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return errorResponse(
      res,
      400,
      'VAL_INVALID_FORMAT',
      'Validation failed',
      details
    );
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return errorResponse(
      res,
      409,
      'RES_ALREADY_EXISTS',
      `${field} already exists`
    );
  }
  
  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return errorResponse(
      res,
      400,
      'VAL_INVALID_FORMAT',
      `Invalid ${err.path}: ${err.value}`
    );
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(
      res,
      401,
      'AUTH_TOKEN_INVALID',
      'Invalid token'
    );
  }
  
  if (err.name === 'TokenExpiredError') {
    return errorResponse(
      res,
      401,
      'AUTH_TOKEN_EXPIRED',
      'Token has expired'
    );
  }
  
  // Default to 500 server error
  return errorResponse(
    res,
    500,
    'SYS_INTERNAL_ERROR',
    config.nodeEnv === 'development' ? err.message : 'An unexpected error occurred'
  );
};

/**
 * Handle 404 errors
 */
export const notFound = (req, res, next) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    'RES_NOT_FOUND'
  );
  next(error);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
