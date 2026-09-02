import Notification from '../models/Notification.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

class NotificationService {
  // ==================== CORE NOTIFICATION OPERATIONS ====================
  
  /**
   * Create a notification
   */
  async createNotification(data, userId) {
    const notificationData = {
      campus: data.campusId,
      title: data.title,
      message: data.message,
      type: data.type,
      priority: data.priority || 'medium',
      targetRoles: data.targetRoles || [],
      targetUsers: data.targetUsers || [],
      relatedEntity: data.relatedEntity || {},
      actionLink: data.actionLink,
      scheduledFor: data.scheduledFor,
      expiresAt: data.expiresAt,
      createdBy: userId
    };
    
    const notification = await Notification.create(notificationData);
    return await Notification.findById(notification._id)
      .populate('campus', 'name code')
      .populate('targetUsers', 'profile.firstName profile.lastName email')
      .populate('createdBy', 'profile.firstName profile.lastName');
  }
  
  /**
   * Get notifications with filters
   */
  async getNotifications(filters, pagination, sort) {
    const query = Notification.find(filters);
    
    const total = await Notification.countDocuments(filters);
    
    const notifications = await query
      .populate('campus', 'name code')
      .populate('targetUsers', 'profile.firstName profile.lastName email')
      .populate('createdBy', 'profile.firstName profile.lastName')
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    return { notifications, total };
  }
  
  /**
   * Get notifications for a specific user
   */
  async getNotificationsForUser(userId, campusId, role, filters, pagination, sort) {
    const query = await Notification.getForUser(userId, campusId, role, filters);
    
    const total = await Notification.countDocuments(query);
    
    const notifications = await Notification.find(query)
      .populate('campus', 'name code')
      .populate('createdBy', 'profile.firstName profile.lastName')
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean();
    
    // Add isRead flag for each notification
    const notificationsWithReadStatus = notifications.map(notification => ({
      ...notification,
      isRead: notification.readBy.some(
        read => read.user.toString() === userId.toString()
      )
    }));
    
    return { notifications: notificationsWithReadStatus, total };
  }
  
  /**
   * Get notification by ID
   */
  async getNotificationById(id) {
    const notification = await Notification.findById(id)
      .populate('campus', 'name code')
      .populate('targetUsers', 'profile.firstName profile.lastName email')
      .populate('readBy.user', 'profile.firstName profile.lastName')
      .populate('createdBy', 'profile.firstName profile.lastName');
    
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }
    
    return notification;
  }
  
  /**
   * Mark notification as read
   */
  async markAsRead(id, userId) {
    const notification = await Notification.findById(id);
    
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }
    
    await notification.markAsRead(userId);
    
    return await this.getNotificationById(id);
  }
  
  /**
   * Mark notification as unread
   */
  async markAsUnread(id, userId) {
    const notification = await Notification.findById(id);
    
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }
    
    await notification.markAsUnread(userId);
    
    return await this.getNotificationById(id);
  }
  
  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId, campusId, role) {
    const query = await Notification.getForUser(userId, campusId, role, { isRead: false });
    
    const notifications = await Notification.find(query);
    
    const updatePromises = notifications.map(notification => 
      notification.markAsRead(userId)
    );
    
    await Promise.all(updatePromises);
    
    return { count: notifications.length };
  }
  
  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId, campusId, role) {
    const count = await Notification.getUnreadCount(userId, campusId, role);
    return { count };
  }
  
  /**
   * Delete notification (soft delete)
   */
  async deleteNotification(id) {
    const notification = await Notification.findById(id);
    
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }
    
    notification.deletedAt = new Date();
    await notification.save();
    
    return notification;
  }
  
  /**
   * Delete multiple notifications (bulk soft delete)
   */
  async deleteMultipleNotifications(ids) {
    const result = await Notification.updateMany(
      { _id: { $in: ids } },
      { deletedAt: new Date() }
    );
    
    return { deletedCount: result.modifiedCount };
  }
  
  // ==================== EVENT-DRIVEN NOTIFICATION TRIGGERS ====================
  
  /**
   * Trigger: Assignment published
   */
  async notifyAssignmentPublished(assignment, classData, campusId, createdBy) {
    try {
      await this.createNotification({
        campusId,
        title: 'New Assignment Published',
        message: `Assignment "${assignment.title}" has been published for ${classData.name}. Due date: ${new Date(assignment.dueDate).toLocaleDateString()}`,
        type: 'academic',
        priority: 'medium',
        targetRoles: ['student'],
        relatedEntity: {
          entityType: 'Assignment',
          entityId: assignment._id
        },
        actionLink: `/assignments/${assignment._id}`,
        expiresAt: assignment.dueDate
      }, createdBy);
    } catch (error) {
      console.error('Failed to send assignment published notification:', error);
      // Don't throw - notifications should not block core workflows
    }
  }
  
  /**
   * Trigger: Assignment deadline approaching (24 hours before)
   */
  async notifyAssignmentDeadlineApproaching(assignment, students, campusId, systemUserId) {
    try {
      const studentIds = students.map(s => s._id);
      
      await this.createNotification({
        campusId,
        title: 'Assignment Deadline Approaching',
        message: `Assignment "${assignment.title}" is due in 24 hours. Please submit before ${new Date(assignment.dueDate).toLocaleString()}`,
        type: 'academic',
        priority: 'high',
        targetRoles: ['student'],
        targetUsers: studentIds,
        relatedEntity: {
          entityType: 'Assignment',
          entityId: assignment._id
        },
        actionLink: `/assignments/${assignment._id}`,
        expiresAt: assignment.dueDate
      }, systemUserId);
    } catch (error) {
      console.error('Failed to send deadline approaching notification:', error);
    }
  }
  
  /**
   * Trigger: Late submission penalty applied
   */
  async notifyLateSubmissionPenalty(submission, assignment, student, campusId, systemUserId) {
    try {
      await this.createNotification({
        campusId,
        title: 'Late Submission Penalty Applied',
        message: `Your submission for "${assignment.title}" was late. A penalty of ${assignment.latePenalty}% has been applied.`,
        type: 'academic',
        priority: 'medium',
        targetRoles: ['student'],
        targetUsers: [student._id],
        relatedEntity: {
          entityType: 'Submission',
          entityId: submission._id
        },
        actionLink: `/submissions/${submission._id}`
      }, systemUserId);
    } catch (error) {
      console.error('Failed to send late penalty notification:', error);
    }
  }
  
  /**
   * Trigger: Attendance below threshold
   */
  async notifyAttendanceBelowThreshold(enrollment, student, subject, campusId, systemUserId) {
    try {
      await this.createNotification({
        campusId,
        title: 'Low Attendance Alert',
        message: `Your attendance in ${subject.name} is ${enrollment.attendancePercentage}%, which is below the required threshold. This may affect your exam eligibility.`,
        type: 'academic',
        priority: 'high',
        targetRoles: ['student'],
        targetUsers: [student._id],
        relatedEntity: {
          entityType: 'Enrollment',
          entityId: enrollment._id
        },
        actionLink: `/enrollments/${enrollment._id}`
      }, systemUserId);
    } catch (error) {
      console.error('Failed to send attendance alert notification:', error);
    }
  }
  
  /**
   * Trigger: Ineligibility detected
   */
  async notifyIneligibilityDetected(enrollment, student, subject, reason, campusId, systemUserId) {
    try {
      await this.createNotification({
        campusId,
        title: 'Exam Ineligibility Alert',
        message: `You are currently ineligible for exams in ${subject.name}. Reason: ${reason}`,
        type: 'academic',
        priority: 'critical',
        targetRoles: ['student'],
        targetUsers: [student._id],
        relatedEntity: {
          entityType: 'Enrollment',
          entityId: enrollment._id
        },
        actionLink: `/enrollments/${enrollment._id}`
      }, systemUserId);
    } catch (error) {
      console.error('Failed to send ineligibility notification:', error);
    }
  }
  
  /**
   * Trigger: Marksheet published
   */
  async notifyMarksheetPublished(marksheet, student, subject, campusId, createdBy) {
    try {
      await this.createNotification({
        campusId,
        title: 'Marksheet Published',
        message: `Your marksheet for ${subject.name} has been published. Grade: ${marksheet.letterGrade}`,
        type: 'academic',
        priority: 'medium',
        targetRoles: ['student'],
        targetUsers: [student._id],
        relatedEntity: {
          entityType: 'Marksheet',
          entityId: marksheet._id
        },
        actionLink: `/marksheets/${marksheet._id}`
      }, createdBy);
    } catch (error) {
      console.error('Failed to send marksheet published notification:', error);
    }
  }
  
  /**
   * Trigger: Fee invoice generated
   */
  async notifyFeeInvoiceGenerated(studentFee, student, campusId, createdBy) {
    try {
      await this.createNotification({
        campusId,
        title: 'Fee Invoice Generated',
        message: `A new fee invoice of ₹${studentFee.totalAmount} has been generated. Due date: ${new Date(studentFee.dueDate).toLocaleDateString()}`,
        type: 'financial',
        priority: 'high',
        targetRoles: ['student'],
        targetUsers: [student._id],
        relatedEntity: {
          entityType: 'StudentFee',
          entityId: studentFee._id
        },
        actionLink: `/fees/${studentFee._id}`,
        expiresAt: studentFee.dueDate
      }, createdBy);
    } catch (error) {
      console.error('Failed to send fee invoice notification:', error);
    }
  }
  
  /**
   * Trigger: Fee payment received
   */
  async notifyFeePaymentReceived(studentFee, student, amount, campusId, createdBy) {
    try {
      await this.createNotification({
        campusId,
        title: 'Payment Received',
        message: `Your payment of ₹${amount} has been received. Remaining balance: ₹${studentFee.remainingAmount}`,
        type: 'financial',
        priority: 'medium',
        targetRoles: ['student'],
        targetUsers: [student._id],
        relatedEntity: {
          entityType: 'StudentFee',
          entityId: studentFee._id
        },
        actionLink: `/fees/${studentFee._id}`
      }, createdBy);
    } catch (error) {
      console.error('Failed to send payment received notification:', error);
    }
  }
  
  /**
   * Trigger: Fee overdue
   */
  async notifyFeeOverdue(studentFee, student, campusId, systemUserId) {
    try {
      await this.createNotification({
        campusId,
        title: 'Fee Payment Overdue',
        message: `Your fee payment of ₹${studentFee.remainingAmount} is overdue. Please make payment immediately to avoid penalties.`,
        type: 'financial',
        priority: 'critical',
        targetRoles: ['student'],
        targetUsers: [student._id],
        relatedEntity: {
          entityType: 'StudentFee',
          entityId: studentFee._id
        },
        actionLink: `/fees/${studentFee._id}`
      }, systemUserId);
    } catch (error) {
      console.error('Failed to send fee overdue notification:', error);
    }
  }
  
  /**
   * Trigger: Fee clearance blocked actions
   */
  async notifyFeeClearanceBlocked(student, action, campusId, systemUserId) {
    try {
      await this.createNotification({
        campusId,
        title: 'Action Blocked - Fee Clearance Required',
        message: `You cannot ${action} due to pending fee clearance. Please clear your dues to proceed.`,
        type: 'financial',
        priority: 'critical',
        targetRoles: ['student'],
        targetUsers: [student._id],
        actionLink: '/fees'
      }, systemUserId);
    } catch (error) {
      console.error('Failed to send fee clearance blocked notification:', error);
    }
  }
  
  /**
   * Trigger: Salary generated
   */
  async notifySalaryGenerated(salaryPayment, staff, campusId, createdBy) {
    try {
      await this.createNotification({
        campusId,
        title: 'Salary Generated',
        message: `Your salary for ${salaryPayment.month}/${salaryPayment.year} has been generated. Net amount: ₹${salaryPayment.netSalary}`,
        type: 'financial',
        priority: 'medium',
        targetRoles: ['teacher'],
        targetUsers: [staff._id],
        relatedEntity: {
          entityType: 'SalaryPayment',
          entityId: salaryPayment._id
        },
        actionLink: `/salary/${salaryPayment._id}`
      }, createdBy);
    } catch (error) {
      console.error('Failed to send salary generated notification:', error);
    }
  }
  
  /**
   * Trigger: Salary paid
   */
  async notifySalaryPaid(salaryPayment, staff, campusId, createdBy) {
    try {
      await this.createNotification({
        campusId,
        title: 'Salary Paid',
        message: `Your salary of ₹${salaryPayment.netSalary} for ${salaryPayment.month}/${salaryPayment.year} has been paid.`,
        type: 'financial',
        priority: 'high',
        targetRoles: ['teacher'],
        targetUsers: [staff._id],
        relatedEntity: {
          entityType: 'SalaryPayment',
          entityId: salaryPayment._id
        },
        actionLink: `/salary/${salaryPayment._id}`
      }, createdBy);
    } catch (error) {
      console.error('Failed to send salary paid notification:', error);
    }
  }
  
  /**
   * Trigger: System announcement
   */
  async notifySystemAnnouncement(title, message, targetRoles, campusId, createdBy, priority = 'medium') {
    try {
      await this.createNotification({
        campusId,
        title,
        message,
        type: 'announcement',
        priority,
        targetRoles,
        relatedEntity: {
          entityType: 'System'
        }
      }, createdBy);
    } catch (error) {
      console.error('Failed to send system announcement:', error);
    }
  }
}

export default new NotificationService();
