import config from '../config/env.js';

/**
 * Request logging middleware
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Generate request ID
  req.id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.locals.requestId = req.id;
  
  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${req.ip}`);
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
    
    console.log(
      `[${new Date().toISOString()}] [${logLevel}] ${req.method} ${req.originalUrl} - ` +
      `Status: ${res.statusCode} - Duration: ${duration}ms - ` +
      `User: ${req.userId || 'anonymous'} - RequestID: ${req.id}`
    );
    
    // Log slow requests (> 1 second)
    if (duration > 1000) {
      console.warn(`⚠️  Slow request detected: ${req.method} ${req.originalUrl} took ${duration}ms`);
    }
  });
  
  next();
};

/**
 * Security headers middleware
 */
export const securityHeaders = (req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // CORS headers are handled by cors middleware
  
  next();
};

/**
 * Request ID middleware
 */
export const requestId = (req, res, next) => {
  req.id = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.id);
  res.locals.requestId = req.id;
  next();
};

/**
 * Campus ID middleware - automatically add campus filter for non-superadmin/admin
 */
export const campusFilter = (req, res, next) => {
  // Skip for superadmin and admin
  if (req.user && (req.user.role === 'superadmin' || req.user.role === 'admin')) {
    return next();
  }
  
  // Add campus filter to query
  if (req.user && req.user.campus) {
    req.campusFilter = { campus: req.user.campus };
  }
  
  next();
};
