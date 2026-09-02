import { ValidationError } from '../utils/errors.js';

/**
 * Validation middleware factory
 * @param {Object} schema - Zod or custom validation schema
 * @param {String} source - Source of data to validate ('body', 'query', 'params')
 */
export const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const dataToValidate = req[source];
      
      // If using Zod schema
      if (schema.parse) {
        try {
          const validated = await schema.parseAsync(dataToValidate);
          req[source] = validated;
          next();
        } catch (error) {
          const details = error.errors?.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }));
          
          throw new ValidationError('Validation failed', details);
        }
      }
      // Custom validation function
      else if (typeof schema === 'function') {
        const result = await schema(dataToValidate);
        if (result.error) {
          throw new ValidationError(result.error.message, result.error.details);
        }
        req[source] = result.value || dataToValidate;
        next();
      }
      else {
        next();
      }
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Validate ObjectId
 */
export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new ValidationError(`Invalid ${paramName} format`));
    }
    
    next();
  };
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Max 100
    
    if (page < 1) {
      throw new ValidationError('Page must be greater than 0');
    }
    
    if (limit < 1) {
      throw new ValidationError('Limit must be greater than 0');
    }
    
    req.pagination = {
      page,
      limit,
      skip: (page - 1) * limit
    };
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validate sort parameters
 */
export const validateSort = (allowedFields = []) => {
  return (req, res, next) => {
    try {
      const sortBy = req.query.sortBy || 'createdAt';
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      
      if (allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
        throw new ValidationError(`Invalid sort field. Allowed: ${allowedFields.join(', ')}`);
      }
      
      req.sort = {
        [sortBy]: sortOrder
      };
      
      next();
    } catch (error) {
      next(error);
    }
  };
};
