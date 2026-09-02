import { verifyAccessToken } from '../utils/jwt.js';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';
import User from '../models/User.js';

/**
 * Authenticate user using JWT token
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided', 'AUTH_UNAUTHORIZED');
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      if (error.message === 'TOKEN_EXPIRED') {
        throw new AuthenticationError('Token has expired', 'AUTH_TOKEN_EXPIRED');
      }
      throw new AuthenticationError('Invalid token', 'AUTH_TOKEN_INVALID');
    }
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      throw new AuthenticationError('User not found', 'AUTH_UNAUTHORIZED');
    }
    
    // Check if user is approved
    if (!user.isApproved) {
      throw new AuthenticationError('Account not approved', 'AUTH_ACCOUNT_NOT_APPROVED');
    }
    
    // Check if user is blocked
    if (user.isBlocked) {
      throw new AuthenticationError('Account is blocked', 'AUTH_ACCOUNT_BLOCKED');
    }
    
    // Check if user is deleted (soft delete)
    if (user.deletedAt) {
      throw new AuthenticationError('Account not found', 'AUTH_UNAUTHORIZED');
    }
    
    // Attach user to request
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    req.campusId = user.campus;
    req.instituteId = user.institute;
    
    // Update last activity (async, don't wait)
    user.updateLastActivity().catch(err => console.error('Failed to update last activity:', err));
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorize user based on roles
 * @param  {...String} allowedRoles - Allowed roles
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required', 'AUTH_UNAUTHORIZED');
      }
      
      if (!allowedRoles.includes(req.user.role)) {
        throw new AuthorizationError('Insufficient permissions');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user can access resource based on campus
 */
export const checkCampusAccess = (req, res, next) => {
  try {
    // SuperAdmin can access all campuses
    if (req.user.role === 'superadmin') {
      return next();
    }
    
    // Get campus ID from request (query, params, or body)
    const requestedCampusId = req.query.campusId || req.params.campusId || req.body.campusId;
    
    // If no campus ID in request, use user's campus
    if (!requestedCampusId) {
      req.campusId = req.user.campus;
      return next();
    }
    
    // Check if user's campus matches requested campus
    if (req.user.campus.toString() !== requestedCampusId.toString()) {
      throw new AuthorizationError('Cannot access resources from different campus');
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isApproved && !user.isBlocked && !user.deletedAt) {
        req.user = user;
        req.userId = user._id;
        req.userRole = user.role;
        req.campusId = user.campus;
      }
    } catch (error) {
      // Ignore token errors for optional auth
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
