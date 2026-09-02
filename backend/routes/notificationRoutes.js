import express from 'express';
import notificationController from '../controllers/notificationController.js';
import { authenticate, authorize, checkCampusAccess } from '../middlewares/auth.js';
import { validate, validateObjectId, validatePagination, validateSort } from '../middlewares/validate.js';
import { apiRateLimiter } from '../middlewares/rateLimiter.js';
import {
  createNotificationSchema,
  createAnnouncementSchema,
  bulkDeleteSchema
} from '../validations/notificationValidation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// ==================== USER NOTIFICATION ROUTES ====================

// Get my notifications (for logged-in user)
router.get(
  '/notifications/me',
  validatePagination,
  validateSort(['createdAt', 'priority']),
  notificationController.getMyNotifications
);

// Get unread count
router.get(
  '/notifications/me/unread-count',
  notificationController.getUnreadCount
);

// Mark notification as read
router.post(
  '/notifications/:id/read',
  validateObjectId('id'),
  notificationController.markAsRead
);

// Mark notification as unread
router.post(
  '/notifications/:id/unread',
  validateObjectId('id'),
  notificationController.markAsUnread
);

// Mark all notifications as read
router.post(
  '/notifications/me/read-all',
  notificationController.markAllAsRead
);

// ==================== ADMIN NOTIFICATION ROUTES ====================

// Create notification (admin only)
router.post(
  '/notifications',
  authorize('superadmin', 'admin'),
  checkCampusAccess,
  validate(createNotificationSchema),
  apiRateLimiter,
  notificationController.createNotification
);

// Get all notifications (admin only)
router.get(
  '/notifications',
  authorize('superadmin', 'admin'),
  checkCampusAccess,
  validatePagination,
  validateSort(['createdAt', 'priority', 'type']),
  notificationController.getAllNotifications
);

// Get notification by ID
router.get(
  '/notifications/:id',
  validateObjectId('id'),
  notificationController.getNotificationById
);

// Delete notification (admin only)
router.delete(
  '/notifications/:id',
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  notificationController.deleteNotification
);

// Bulk delete notifications (admin only)
router.post(
  '/notifications/bulk-delete',
  authorize('superadmin', 'admin'),
  validate(bulkDeleteSchema),
  apiRateLimiter,
  notificationController.deleteMultipleNotifications
);

// ==================== ANNOUNCEMENT ROUTES ====================

// Create system announcement (admin only)
router.post(
  '/announcements',
  authorize('superadmin', 'admin'),
  validate(createAnnouncementSchema),
  apiRateLimiter,
  notificationController.createAnnouncement
);

export default router;
