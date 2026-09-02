import ActivityLog from '../models/ActivityLog.js';

/**
 * Log activity for create/update/delete operations
 * @param {String} action - Action type (create, update, delete)
 * @param {String} resource - Resource name (User, Department, etc.)
 * @param {Object} resourceData - Resource data
 * @param {Object} changes - Changes made (for updates)
 */
export const logActivity = async (req, action, resource, resourceData, changes = null) => {
  try {
    await ActivityLog.create({
      campus: req.campusId || null,
      user: req.userId,
      action,
      resource,
      resourceId: resourceData?._id || resourceData?.id,
      changes,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: 200
    });
  } catch (error) {
    // Don't fail the request if logging fails
    console.error('Activity logging failed:', error.message);
  }
};

/**
 * Middleware to automatically log activities
 */
export const activityLoggerMiddleware = (resource) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;
    
    // Override send function
    res.send = function(data) {
      // Determine action based on method
      let action = null;
      if (req.method === 'POST') action = 'create';
      else if (req.method === 'PUT' || req.method === 'PATCH') action = 'update';
      else if (req.method === 'DELETE') action = 'delete';
      
      // Log activity if action is create/update/delete and response is successful
      if (action && res.statusCode >= 200 && res.statusCode < 300) {
        logActivity(req, action, resource, { id: req.params.id }, null)
          .catch(err => console.error('Activity logging error:', err));
      }
      
      // Call original send
      return originalSend.call(this, data);
    };
    
    next();
  };
};

export default logActivity;
