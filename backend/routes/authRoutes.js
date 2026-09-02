import express from 'express';
import authController from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';
import { validate, validateObjectId } from '../middlewares/validate.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema, updateProfileSchema } from '../validations/authValidation.js';

const router = express.Router();

// Public routes with rate limiting
router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  authController.login
);

router.post(
  '/refresh-token',
  authController.refreshToken
);

router.post(
  '/forgot-password',
  authRateLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

router.post(
  '/reset-password/:token',
  validate(resetPasswordSchema),
  authController.resetPassword
);

// Protected routes
router.use(authenticate);

router.post(
  '/logout',
  authController.logout
);

router.post(
  '/logout-all',
  authController.logoutAll
);

router.post(
  '/change-password',
  validate(changePasswordSchema),
  authController.changePassword
);

router.get(
  '/me',
  authController.getCurrentUser
);

router.patch(
  '/profile',
  validate(updateProfileSchema),
  authController.updateProfile
);

router.get(
  '/sessions',
  authController.getActiveSessions
);

router.delete(
  '/sessions/:sessionId',
  validateObjectId('sessionId'),
  authController.terminateSession
);

export default router;
