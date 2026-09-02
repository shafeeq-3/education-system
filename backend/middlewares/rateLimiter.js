import { RateLimitError } from '../utils/errors.js';
import config from '../config/env.js';

/**
 * Simple in-memory rate limiter
 * For production, use Redis-based rate limiter
 */
class RateLimiter {
  constructor() {
    this.requests = new Map();
  }
  
  /**
   * Check if request should be rate limited
   * @param {String} key - Unique key for rate limiting (IP or user ID)
   * @param {Number} maxRequests - Maximum requests allowed
   * @param {Number} windowMs - Time window in milliseconds
   * @returns {Boolean} - True if rate limited
   */
  isRateLimited(key, maxRequests, windowMs) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    
    // Filter out requests outside the time window
    const recentRequests = userRequests.filter(timestamp => now - timestamp < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return true;
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    
    // Cleanup old entries periodically
    if (Math.random() < 0.01) { // 1% chance
      this.cleanup(windowMs);
    }
    
    return false;
  }
  
  /**
   * Get remaining requests
   */
  getRemaining(key, maxRequests, windowMs) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    const recentRequests = userRequests.filter(timestamp => now - timestamp < windowMs);
    return Math.max(0, maxRequests - recentRequests.length);
  }
  
  /**
   * Get reset time
   */
  getResetTime(key, windowMs) {
    const userRequests = this.requests.get(key) || [];
    if (userRequests.length === 0) return Date.now();
    return userRequests[0] + windowMs;
  }
  
  /**
   * Cleanup old entries
   */
  cleanup(windowMs) {
    const now = Date.now();
    for (const [key, timestamps] of this.requests.entries()) {
      const recentRequests = timestamps.filter(timestamp => now - timestamp < windowMs);
      if (recentRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recentRequests);
      }
    }
  }
  
  /**
   * Reset rate limit for a key
   */
  reset(key) {
    this.requests.delete(key);
  }
}

const rateLimiter = new RateLimiter();

/**
 * Rate limiting middleware factory
 * @param {Number} maxRequests - Maximum requests allowed
 * @param {Number} windowMinutes - Time window in minutes
 * @param {String} keyGenerator - Function to generate rate limit key
 */
export const rateLimit = (maxRequests, windowMinutes, keyGenerator = null) => {
  const windowMs = windowMinutes * 60 * 1000;
  
  return (req, res, next) => {
    try {
      // Generate key (IP address or user ID)
      const key = keyGenerator ? keyGenerator(req) : req.ip || req.connection.remoteAddress;
      
      // Check rate limit
      if (rateLimiter.isRateLimited(key, maxRequests, windowMs)) {
        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimiter.getResetTime(key, windowMs) / 1000));
        
        throw new RateLimitError('Too many requests, please try again later');
      }
      
      // Set rate limit headers
      const remaining = rateLimiter.getRemaining(key, maxRequests, windowMs);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimiter.getResetTime(key, windowMs) / 1000));
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Authentication rate limiter (5 requests per 15 minutes per IP)
 */
export const authRateLimiter = rateLimit(
  config.rateLimitAuth,
  15,
  (req) => req.ip || req.connection.remoteAddress
);

/**
 * General API rate limiter (100 requests per minute per user)
 */
export const apiRateLimiter = rateLimit(
  config.rateLimitGeneral,
  1,
  (req) => req.userId || req.ip || req.connection.remoteAddress
);

/**
 * File upload rate limiter (10 requests per minute per user)
 */
export const uploadRateLimiter = rateLimit(
  config.rateLimitUpload,
  1,
  (req) => req.userId || req.ip || req.connection.remoteAddress
);

/**
 * Export rate limiter (5 requests per minute per user)
 */
export const exportRateLimiter = rateLimit(
  5,
  1,
  (req) => req.userId || req.ip || req.connection.remoteAddress
);

export default rateLimiter;
