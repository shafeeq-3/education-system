/**
 * Standard success response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Success message
 * @param {Object} data - Response data
 */
export const successResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
    ...(data && { data }),
    meta: {
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId || generateRequestId()
    }
  };
  
  return res.status(statusCode).json(response);
};

/**
 * Standard error response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} code - Error code
 * @param {String} message - Error message
 * @param {Array} details - Error details
 */
export const errorResponse = (res, statusCode, code, message, details = null) => {
  const response = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details })
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId || generateRequestId()
    }
  };
  
  return res.status(statusCode).json(response);
};

/**
 * Paginated response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {Array} items - Data items
 * @param {Object} pagination - Pagination info
 */
export const paginatedResponse = (res, statusCode, items, pagination) => {
  const response = {
    success: true,
    data: {
      items,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit),
        hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
        hasPrev: pagination.page > 1
      }
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId || generateRequestId()
    }
  };
  
  return res.status(statusCode).json(response);
};

/**
 * Generate unique request ID
 * @returns {String} Request ID
 */
const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
