import notificationService from '../services/notificationService.js';
import { successResponse, paginatedResponse } from '../utils/response.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import logActivity from '../middlewares/activityLogger.js';

class NotificationController {
  // ==================== ADMIN OPERATIONS ====================
  
  createNotification = asyncHandler(async (req, res) => {
    const notification = await notificationService.createNotification(req.body, req.userId);
    await logActivity(req, 'create', 'Notification', notification);
    
    successResponse(res, 201, 'Notification created successfully', notification);
  });
  
  getAllNotifications = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.campusId) filters.campus = req.query.campusId;
    if (req.query.type) filters.type = req.query.type;
    if (req.query.priority) filters.priority = req.query.priority;
    if (req.campusFilter) Object.assign(filters, req.campusFilter);
    
    const { notifications, total } = await notificationService.getNotifications(
      filters,
      req.pagination,
      req.sort
    );
    
    paginatedResponse(res, 200, notifications, { ...req.pagination, total });
  });
  
  getNotificationById = asyncHandler(async (req, res) => {
    const notification = await notificationService.getNotificationById(req.params.id);
    successResponse(res, 200, 'Notification retrieved successfully', notification);
  });
  
  deleteNotification = asyncHandler(async (req, res) => {
    const notification = await notificationService.deleteNotification(req.params.id);
    await logActivity(req, 'delete', 'Notification', notification);
    
    successResponse(res, 200, 'Notification deleted successfully');
  });
  
  deleteMultipleNotifications = asyncHandler(async (req, res) => {
    const { ids } = req.body;
    const result = await notificationService.deleteMultipleNotifications(ids);
    await logActivity(req, 'bulkDelete', 'Notification', { deletedCount: result.deletedCount });
    
    successResponse(res, 200, 'Notifications deleted successfully', result);
  });
  
  // ==================== USER OPERATIONS ====================
  
  getMyNotifications = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.type) filters.type = req.query.type;
    if (req.query.priority) filters.priority = req.query.priority;
    if (req.query.isRead !== undefined) {
      filters.isRead = req.query.isRead === 'true';
    }
    
    const { notifications, total } = await notificationService.getNotificationsForUser(
      req.userId,
      req.campusId,
      req.userRole,
      filters,
      req.pagination,
      req.sort
    );
    
    paginatedResponse(res, 200, notifications, { ...req.pagination, total });
  });
  
  markAsRead = asyncHandler(async (req, res) => {
    const notification = await notificationService.markAsRead(req.params.id, req.userId);
    
    successResponse(res, 200, 'Notification marked as read', notification);
  });
  
  markAsUnread = asyncHandler(async (req, res) => {
    const notification = await notificationService.markAsUnread(req.params.id, req.userId);
    
    successResponse(res, 200, 'Notification marked as unread', notification);
  });
  
  markAllAsRead = asyncHandler(async (req, res) => {
    const result = await notificationService.markAllAsRead(
      req.userId,
      req.campusId,
      req.userRole
    );
    
    successResponse(res, 200, 'All notifications marked as read', result);
  });
  
  getUnreadCount = asyncHandler(async (req, res) => {
    const result = await notificationService.getUnreadCount(
      req.userId,
      req.campusId,
      req.userRole
    );
    
    successResponse(res, 200, 'Unread count retrieved successfully', result);
  });
  
  // ==================== SYSTEM ANNOUNCEMENTS ====================
  
  createAnnouncement = asyncHandler(async (req, res) => {
    const { title, message, targetRoles, priority } = req.body;
    
    await notificationService.notifySystemAnnouncement(
      title,
      message,
      targetRoles,
      req.campusId,
      req.userId,
      priority
    );
    
    successResponse(res, 201, 'Announcement created successfully');
  });
}

export default new NotificationController();
