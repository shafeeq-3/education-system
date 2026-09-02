import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Multi-campus support
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus',
    required: [true, 'Campus is required'],
    index: true
  },
  
  // Notification details
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  
  // Notification type
  type: {
    type: String,
    enum: ['academic', 'financial', 'system', 'announcement'],
    required: [true, 'Type is required'],
    index: true
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  
  // Target roles
  targetRoles: [{
    type: String,
    enum: ['superadmin', 'admin', 'teacher', 'student', 'accounts']
  }],
  
  // Specific target users (optional - for individual notifications)
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Related entity references (for context)
  relatedEntity: {
    entityType: {
      type: String,
      enum: [
        'Assignment', 'Submission', 'Attendance', 'Enrollment',
        'Marksheet', 'StudentFee', 'SalaryPayment', 'Class',
        'Timetable', 'User', 'System', null
      ]
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  
  // Action link (optional - for navigation)
  actionLink: {
    type: String,
    trim: true
  },
  
  // Read tracking (array of user IDs who have read this notification)
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Scheduled delivery (optional)
  scheduledFor: {
    type: Date,
    default: null
  },
  
  // Delivery status
  isDelivered: {
    type: Boolean,
    default: true
  },
  
  deliveredAt: {
    type: Date,
    default: Date.now
  },
  
  // Email/SMS delivery flags (for future integration)
  emailSent: {
    type: Boolean,
    default: false
  },
  
  smsSent: {
    type: Boolean,
    default: false
  },
  
  // Expiry (optional - for time-sensitive notifications)
  expiresAt: {
    type: Date,
    default: null
  },
  
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ campus: 1, type: 1 });
notificationSchema.index({ campus: 1, priority: 1 });
notificationSchema.index({ targetRoles: 1 });
notificationSchema.index({ targetUsers: 1 });
notificationSchema.index({ 'readBy.user': 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ deletedAt: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ isDelivered: 1, scheduledFor: 1 });

// Method to mark as read by a user
notificationSchema.methods.markAsRead = function(userId) {
  // Check if already read
  const alreadyRead = this.readBy.some(
    read => read.user.toString() === userId.toString()
  );
  
  if (!alreadyRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
  }
  
  return this.save();
};

// Method to check if read by a user
notificationSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(
    read => read.user.toString() === userId.toString()
  );
};

// Method to mark as unread by a user
notificationSchema.methods.markAsUnread = function(userId) {
  this.readBy = this.readBy.filter(
    read => read.user.toString() !== userId.toString()
  );
  
  return this.save();
};

// Static method to get unread count for a user
notificationSchema.statics.getUnreadCount = async function(userId, campusId, role) {
  const query = {
    campus: campusId,
    deletedAt: null,
    isDelivered: true,
    'readBy.user': { $ne: userId },
    $or: [
      { targetRoles: role },
      { targetUsers: userId }
    ]
  };
  
  // Filter out expired notifications
  query.$and = [
    {
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    }
  ];
  
  return await this.countDocuments(query);
};

// Static method to get notifications for a user
notificationSchema.statics.getForUser = async function(userId, campusId, role, filters = {}) {
  const query = {
    campus: campusId,
    deletedAt: null,
    isDelivered: true,
    $or: [
      { targetRoles: role },
      { targetUsers: userId }
    ]
  };
  
  // Filter out expired notifications
  query.$and = [
    {
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    }
  ];
  
  // Apply additional filters
  if (filters.type) query.type = filters.type;
  if (filters.priority) query.priority = filters.priority;
  if (filters.isRead === true) {
    query['readBy.user'] = userId;
  } else if (filters.isRead === false) {
    query['readBy.user'] = { $ne: userId };
  }
  
  return query;
};

// Soft delete query helper
notificationSchema.query.notDeleted = function() {
  return this.where({ deletedAt: null });
};

// Pre-find middleware to exclude soft deleted
notificationSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deletedAt: null });
  }
  next();
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
