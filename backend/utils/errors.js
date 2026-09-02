/**
 * Custom Error Classes for the application
 */

export class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VAL_INVALID_FORMAT');
    this.details = details;
  }
}

export class AuthenticationError extends AppError {
  constructor(message, code = 'AUTH_UNAUTHORIZED') {
    super(message, 401, code);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTH_FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'RES_NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message, code = 'RES_CONFLICT') {
    super(message, 409, code);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 500, 'SYS_DATABASE_ERROR');
  }
}

export class FileUploadError extends AppError {
  constructor(message, code = 'FILE_UPLOAD_FAILED') {
    super(message, 400, code);
  }
}

/**
 * Error code mappings
 */
export const ERROR_CODES = {
  // Authentication
  AUTH_INVALID_CREDENTIALS: 'Invalid email/username or password',
  AUTH_ACCOUNT_NOT_APPROVED: 'Account pending admin approval',
  AUTH_ACCOUNT_BLOCKED: 'Account has been blocked',
  AUTH_TOKEN_EXPIRED: 'Access token has expired',
  AUTH_TOKEN_INVALID: 'Invalid or malformed token',
  AUTH_REFRESH_TOKEN_INVALID: 'Invalid refresh token',
  AUTH_SESSION_EXPIRED: 'Session has expired due to inactivity',
  AUTH_TOO_MANY_ATTEMPTS: 'Too many failed login attempts',
  AUTH_UNAUTHORIZED: 'Authentication required',
  AUTH_FORBIDDEN: 'Insufficient permissions',
  
  // Validation
  VAL_REQUIRED_FIELD: 'Required field is missing',
  VAL_INVALID_EMAIL: 'Invalid email format',
  VAL_INVALID_FORMAT: 'Invalid data format',
  VAL_MIN_LENGTH: 'Value below minimum length',
  VAL_MAX_LENGTH: 'Value exceeds maximum length',
  VAL_INVALID_ENUM: 'Value not in allowed enum values',
  VAL_INVALID_DATE: 'Invalid date format or value',
  VAL_DATE_RANGE: 'Invalid date range',
  VAL_WEAK_PASSWORD: 'Password does not meet strength requirements',
  VAL_PASSWORD_MISMATCH: 'Passwords do not match',
  
  // Resource
  RES_NOT_FOUND: 'Resource not found',
  RES_ALREADY_EXISTS: 'Resource already exists',
  RES_CONFLICT: 'Resource conflict',
  RES_CANNOT_DELETE: 'Resource cannot be deleted',
  RES_INVALID_REFERENCE: 'Referenced resource does not exist',
  
  // Business Logic
  BIZ_ENROLLMENT_EXISTS: 'Student already enrolled in semester',
  BIZ_SUBMISSION_EXISTS: 'Assignment already submitted',
  BIZ_ATTENDANCE_EXISTS: 'Attendance already marked for date',
  BIZ_MARKSHEET_EXISTS: 'Marksheet already exists',
  BIZ_SALARY_EXISTS: 'Salary record already exists',
  BIZ_DEPARTMENT_MISMATCH: 'Department mismatch',
  BIZ_NOT_ENROLLED: 'Student not enrolled',
  BIZ_DEADLINE_PASSED: 'Deadline has passed',
  BIZ_INVALID_MARKS: 'Marks exceed total marks',
  BIZ_INSUFFICIENT_ATTENDANCE: 'Attendance below threshold',
  BIZ_TIMETABLE_CONFLICT: 'Timetable conflict detected',
  
  // File Upload
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  FILE_INVALID_TYPE: 'File type not allowed',
  FILE_UPLOAD_FAILED: 'File upload failed',
  FILE_NOT_FOUND: 'File not found',
  
  // System
  SYS_DATABASE_ERROR: 'Database operation failed',
  SYS_INTERNAL_ERROR: 'Internal server error',
  SYS_SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  SYS_BACKUP_FAILED: 'Backup operation failed',
  SYS_RESTORE_FAILED: 'Restore operation failed',
  SYS_NOTIFICATION_FAILED: 'Notification sending failed',
  
  // Rate Limit
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  RATE_LIMIT_AUTH: 'Authentication rate limit exceeded',
  RATE_LIMIT_UPLOAD: 'File upload rate limit exceeded',
  RATE_LIMIT_EXPORT: 'Export rate limit exceeded'
};
