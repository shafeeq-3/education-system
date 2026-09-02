import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import { generateTokenPair, generateRandomToken, hashToken, verifyRefreshToken } from '../utils/jwt.js';
import { AuthenticationError, ConflictError, NotFoundError, ValidationError } from '../utils/errors.js';
import config from '../config/env.js';

class AuthService {
  /**
   * Register new user
   */
  async register(userData) {
    // Check if email already exists
    const existingEmail = await User.findOne({ email: userData.email });
    if (existingEmail) {
      throw new ConflictError('Email already exists', 'RES_ALREADY_EXISTS');
    }
    
    // Check if username already exists
    const existingUsername = await User.findOne({ username: userData.username });
    if (existingUsername) {
      throw new ConflictError('Username already exists', 'RES_ALREADY_EXISTS');
    }
    
    // Validate password strength
    this.validatePasswordStrength(userData.password);
    
    // Create user (password will be hashed by pre-save middleware)
    const user = await User.create({
      email: userData.email,
      username: userData.username,
      password: userData.password,
      role: userData.role,
      campus: userData.campusId,
      institute: userData.instituteId,
      profile: userData.profile,
      department: userData.departmentId,
      isApproved: false // Requires admin approval
    });
    
    // Remove password from response
    const userObject = user.toObject();
    delete userObject.password;
    
    return userObject;
  }
  
  /**
   * Login user
   */
  async login(emailOrUsername, password, deviceInfo) {
    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername }
      ]
    }).select('+password');
    
    if (!user) {
      throw new AuthenticationError('Invalid credentials', 'AUTH_INVALID_CREDENTIALS');
    }
    
    // Check if account is locked
    if (user.isAccountLocked()) {
      const minutesLeft = Math.ceil((user.loginAttempts.blockedUntil - Date.now()) / 60000);
      throw new AuthenticationError(
        `Account locked. Try again in ${minutesLeft} minutes`,
        'AUTH_TOO_MANY_ATTEMPTS'
      );
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      throw new AuthenticationError('Invalid credentials', 'AUTH_INVALID_CREDENTIALS');
    }
    
    // Check if user is approved
    if (!user.isApproved) {
      throw new AuthenticationError('Account pending approval', 'AUTH_ACCOUNT_NOT_APPROVED');
    }
    
    // Check if user is blocked
    if (user.isBlocked) {
      throw new AuthenticationError('Account has been blocked', 'AUTH_ACCOUNT_BLOCKED');
    }
    
    // Check if user is deleted
    if (user.deletedAt) {
      throw new AuthenticationError('Account not found', 'AUTH_INVALID_CREDENTIALS');
    }
    
    // Reset login attempts on successful login
    await user.resetLoginAttempts();
    
    // Generate tokens
    const tokens = generateTokenPair(user);
    
    // Store refresh token in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await RefreshToken.create({
      user: user._id,
      token: hashToken(tokens.refreshToken),
      expiresAt,
      device: deviceInfo.device,
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent
    });
    
    // Update last activity
    await user.updateLastActivity();
    
    // Remove password from response
    const userObject = user.toObject();
    delete userObject.password;
    
    return {
      user: userObject,
      tokens
    };
  }
  
  /**
   * Refresh access token
   */
  async refreshToken(refreshTokenString) {
    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshTokenString);
    } catch (error) {
      throw new AuthenticationError('Invalid refresh token', 'AUTH_REFRESH_TOKEN_INVALID');
    }
    
    // Check if refresh token exists in database
    const hashedToken = hashToken(refreshTokenString);
    const tokenDoc = await RefreshToken.findOne({
      token: hashedToken,
      user: decoded.userId,
      isRevoked: false
    });
    
    if (!tokenDoc) {
      throw new AuthenticationError('Invalid refresh token', 'AUTH_REFRESH_TOKEN_INVALID');
    }
    
    // Check if token is expired
    if (tokenDoc.expiresAt < Date.now()) {
      throw new AuthenticationError('Refresh token expired', 'AUTH_REFRESH_TOKEN_INVALID');
    }
    
    // Get user
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isApproved || user.isBlocked || user.deletedAt) {
      throw new AuthenticationError('User not found or inactive', 'AUTH_UNAUTHORIZED');
    }
    
    // Generate new tokens
    const tokens = generateTokenPair(user);
    
    // Update refresh token in database
    tokenDoc.token = hashToken(tokens.refreshToken);
    tokenDoc.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await tokenDoc.save();
    
    return tokens;
  }
  
  /**
   * Logout user
   */
  async logout(userId, refreshTokenString) {
    if (refreshTokenString) {
      const hashedToken = hashToken(refreshTokenString);
      await RefreshToken.findOneAndUpdate(
        { token: hashedToken, user: userId },
        { isRevoked: true }
      );
    }
    
    return true;
  }
  
  /**
   * Logout from all devices
   */
  async logoutAll(userId) {
    await RefreshToken.revokeAllForUser(userId);
    return true;
  }
  
  /**
   * Request password reset
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If email exists, reset link will be sent' };
    }
    
    // Generate reset token
    const resetToken = generateRandomToken();
    const hashedToken = hashToken(resetToken);
    
    // Store token in database
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await PasswordResetToken.create({
      user: user._id,
      token: hashedToken,
      expiresAt
    });
    
    return {
      message: 'Password reset token generated',
      resetToken: config.nodeEnv === 'development' ? resetToken : undefined // Only in dev mode
    };
  }
  
  /**
   * Reset password
   */
  async resetPassword(token, newPassword) {
    const hashedToken = hashToken(token);
    
    // Find valid token
    const tokenDoc = await PasswordResetToken.findOne({
      token: hashedToken,
      isUsed: false,
      expiresAt: { $gt: Date.now() }
    });
    
    if (!tokenDoc) {
      throw new AuthenticationError('Invalid or expired reset token', 'AUTH_TOKEN_INVALID');
    }
    
    // Validate password strength
    this.validatePasswordStrength(newPassword);
    
    // Get user
    const user = await User.findById(tokenDoc.user);
    
    if (!user) {
      throw new NotFoundError('User');
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    // Mark token as used
    tokenDoc.isUsed = true;
    tokenDoc.usedAt = Date.now();
    await tokenDoc.save();
    
    // Revoke all refresh tokens
    await RefreshToken.revokeAllForUser(user._id);
    
    return { message: 'Password reset successful' };
  }
  
  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      throw new NotFoundError('User');
    }
    
    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      throw new AuthenticationError('Current password is incorrect', 'AUTH_INVALID_CREDENTIALS');
    }
    
    // Validate new password strength
    this.validatePasswordStrength(newPassword);
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    // Revoke all refresh tokens except current
    await RefreshToken.revokeAllForUser(user._id);
    
    return { message: 'Password changed successfully' };
  }
  
  /**
   * Get active sessions
   */
  async getActiveSessions(userId) {
    const sessions = await RefreshToken.find({
      user: userId,
      isRevoked: false,
      expiresAt: { $gt: Date.now() }
    }).sort({ createdAt: -1 });
    
    return sessions.map(session => ({
      id: session._id,
      device: session.device,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt
    }));
  }
  
  /**
   * Terminate session
   */
  async terminateSession(userId, sessionId) {
    const session = await RefreshToken.findOne({
      _id: sessionId,
      user: userId
    });
    
    if (!session) {
      throw new NotFoundError('Session');
    }
    
    session.isRevoked = true;
    await session.save();
    
    return { message: 'Session terminated successfully' };
  }
  
  /**
   * Validate password strength
   */
  validatePasswordStrength(password) {
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      throw new ValidationError('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      throw new ValidationError('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      throw new ValidationError('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new ValidationError('Password must contain at least one special character');
    }
  }
}

export default new AuthService();
