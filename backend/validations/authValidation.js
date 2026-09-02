import { ValidationError } from '../utils/errors.js';

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

/**
 * Validate username format
 */
const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

/**
 * Register validation schema
 */
export const registerSchema = (data) => {
  const errors = [];
  
  // Email validation
  if (!data.email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }
  
  // Username validation
  if (!data.username) {
    errors.push({ field: 'username', message: 'Username is required' });
  } else if (!isValidUsername(data.username)) {
    errors.push({ field: 'username', message: 'Username must be 3-30 characters and contain only letters, numbers, and underscores' });
  }
  
  // Password validation
  if (!data.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (data.password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  }
  
  // Role validation
  if (!data.role) {
    errors.push({ field: 'role', message: 'Role is required' });
  } else if (!['admin', 'teacher', 'student', 'accounts'].includes(data.role)) {
    errors.push({ field: 'role', message: 'Invalid role' });
  }
  
  // Campus validation
  if (!data.campusId) {
    errors.push({ field: 'campusId', message: 'Campus is required' });
  }
  
  // Profile validation
  if (!data.profile) {
    errors.push({ field: 'profile', message: 'Profile information is required' });
  } else {
    if (!data.profile.firstName) {
      errors.push({ field: 'profile.firstName', message: 'First name is required' });
    }
    if (!data.profile.lastName) {
      errors.push({ field: 'profile.lastName', message: 'Last name is required' });
    }
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

/**
 * Login validation schema
 */
export const loginSchema = (data) => {
  const errors = [];
  
  if (!data.emailOrUsername) {
    errors.push({ field: 'emailOrUsername', message: 'Email or username is required' });
  }
  
  if (!data.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

/**
 * Forgot password validation schema
 */
export const forgotPasswordSchema = (data) => {
  const errors = [];
  
  if (!data.email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

/**
 * Reset password validation schema
 */
export const resetPasswordSchema = (data) => {
  const errors = [];
  
  if (!data.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (data.password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  }
  
  if (!data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Confirm password is required' });
  }
  
  if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

/**
 * Change password validation schema
 */
export const changePasswordSchema = (data) => {
  const errors = [];
  
  if (!data.currentPassword) {
    errors.push({ field: 'currentPassword', message: 'Current password is required' });
  }
  
  if (!data.newPassword) {
    errors.push({ field: 'newPassword', message: 'New password is required' });
  } else if (data.newPassword.length < 8) {
    errors.push({ field: 'newPassword', message: 'Password must be at least 8 characters' });
  }
  
  if (!data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Confirm password is required' });
  }
  
  if (data.newPassword && data.confirmPassword && data.newPassword !== data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

/**
 * Update profile validation schema
 */
export const updateProfileSchema = (data) => {
  const errors = [];
  
  if (!data.profile) {
    errors.push({ field: 'profile', message: 'Profile information is required' });
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  if (data.profile.firstName && data.profile.firstName.trim().length === 0) {
    errors.push({ field: 'profile.firstName', message: 'First name cannot be empty' });
  }
  
  if (data.profile.lastName && data.profile.lastName.trim().length === 0) {
    errors.push({ field: 'profile.lastName', message: 'Last name cannot be empty' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};
