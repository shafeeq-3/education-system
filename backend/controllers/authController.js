import authService from '../services/authService.js';
import User from '../models/User.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { ValidationError } from '../utils/errors.js';

class AuthController {
  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  register = asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);
    
    successResponse(
      res,
      201,
      'Registration successful. Awaiting admin approval.',
      {
        userId: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        isApproved: user.isApproved
      }
    );
  });
  
  /**
   * Login user
   * POST /api/v1/auth/login
   */
  login = asyncHandler(async (req, res) => {
    const { emailOrUsername, password } = req.body;
    
    const deviceInfo = {
      device: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    };
    
    const result = await authService.login(emailOrUsername, password, deviceInfo);
    
    successResponse(
      res,
      200,
      'Login successful',
      result
    );
  });
  
  /**
   * Refresh access token
   * POST /api/v1/auth/refresh-token
   */
  refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    
    const tokens = await authService.refreshToken(refreshToken);
    
    successResponse(
      res,
      200,
      'Token refreshed successfully',
      tokens
    );
  });
  
  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    
    await authService.logout(req.userId, refreshToken);
    
    successResponse(
      res,
      200,
      'Logout successful'
    );
  });
  
  /**
   * Logout from all devices
   * POST /api/v1/auth/logout-all
   */
  logoutAll = asyncHandler(async (req, res) => {
    await authService.logoutAll(req.userId);
    
    successResponse(
      res,
      200,
      'Logged out from all devices successfully'
    );
  });
  
  /**
   * Request password reset
   * POST /api/v1/auth/forgot-password
   */
  forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    const result = await authService.forgotPassword(email);
    
    successResponse(
      res,
      200,
      result.message,
      result.resetToken ? { resetToken: result.resetToken } : null
    );
  });
  
  /**
   * Reset password
   * POST /api/v1/auth/reset-password/:token
   */
  resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
    
    if (password !== confirmPassword) {
      throw new ValidationError('Passwords do not match');
    }
    
    const result = await authService.resetPassword(token, password);
    
    successResponse(
      res,
      200,
      result.message
    );
  });
  
  /**
   * Change password
   * POST /api/v1/auth/change-password
   */
  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    if (newPassword !== confirmPassword) {
      throw new ValidationError('Passwords do not match');
    }
    
    const result = await authService.changePassword(
      req.userId,
      currentPassword,
      newPassword
    );
    
    successResponse(
      res,
      200,
      result.message
    );
  });
  
  /**
   * Get current user
   * GET /api/v1/auth/me
   */
  getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user.toObject();
    delete user.password;
    
    successResponse(
      res,
      200,
      'User retrieved successfully',
      user
    );
  });
  
  /**
   * Update profile
   * PATCH /api/v1/auth/profile
   */
  updateProfile = asyncHandler(async (req, res) => {
    const { profile } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { profile },
      { new: true, runValidators: true }
    ).select('-password');
    
    successResponse(
      res,
      200,
      'Profile updated successfully',
      user
    );
  });
  
  /**
   * Get active sessions
   * GET /api/v1/auth/sessions
   */
  getActiveSessions = asyncHandler(async (req, res) => {
    const sessions = await authService.getActiveSessions(req.userId);
    
    successResponse(
      res,
      200,
      'Sessions retrieved successfully',
      { sessions }
    );
  });
  
  /**
   * Terminate session
   * DELETE /api/v1/auth/sessions/:sessionId
   */
  terminateSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    
    const result = await authService.terminateSession(req.userId, sessionId);
    
    successResponse(
      res,
      200,
      result.message
    );
  });
}

export default new AuthController();
