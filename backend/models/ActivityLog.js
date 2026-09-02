import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true // 'create', 'update', 'delete', 'login', 'logout'
  },
  resource: {
    type: String,
    required: true // 'User', 'Assignment', 'Fee', etc.
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  changes: {
    type: Object // Before/after values for updates
  },
  ipAddress: String,
  userAgent: String,
  method: String, // HTTP method
  endpoint: String, // API endpoint
  statusCode: Number,
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
}, {
  timestamps: false // Only createdAt needed
});

// Indexes
activityLogSchema.index({ campus: 1 });
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, resource: 1 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ resource: 1, resourceId: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
