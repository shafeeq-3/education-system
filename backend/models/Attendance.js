import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  // Multi-campus support
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus',
    required: [true, 'Campus is required'],
    index: true
  },
  
  // Session details
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required'],
    index: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required'],
    index: true
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: [true, 'Semester is required'],
    index: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required'],
    index: true
  },
  
  // Date and time
  date: {
    type: Date,
    required: [true, 'Attendance date is required'],
    index: true
  },
  startTime: {
    type: String,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format']
  },
  endTime: {
    type: String,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format']
  },
  
  // Attendance records
  records: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'leave'],
      required: true
    },
    markedAt: {
      type: Date,
      default: Date.now
    },
    remarks: String
  }],
  
  // Locking mechanism
  isLocked: {
    type: Boolean,
    default: false
  },
  lockedAt: Date,
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Statistics
  totalStudents: {
    type: Number,
    default: 0
  },
  presentCount: {
    type: Number,
    default: 0
  },
  absentCount: {
    type: Number,
    default: 0
  },
  leaveCount: {
    type: Number,
    default: 0
  },
  attendancePercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound unique index: one attendance session per class per date
attendanceSchema.index({ class: 1, date: 1 }, { unique: true });
attendanceSchema.index({ teacher: 1, date: 1 });
attendanceSchema.index({ subject: 1, semester: 1 });
attendanceSchema.index({ deletedAt: 1 });

// Method to calculate statistics
attendanceSchema.methods.calculateStatistics = function() {
  this.totalStudents = this.records.length;
  this.presentCount = this.records.filter(r => r.status === 'present').length;
  this.absentCount = this.records.filter(r => r.status === 'absent').length;
  this.leaveCount = this.records.filter(r => r.status === 'leave').length;
  
  if (this.totalStudents > 0) {
    this.attendancePercentage = Math.round((this.presentCount / this.totalStudents) * 100);
  } else {
    this.attendancePercentage = 0;
  }
  
  return {
    totalStudents: this.totalStudents,
    presentCount: this.presentCount,
    absentCount: this.absentCount,
    leaveCount: this.leaveCount,
    attendancePercentage: this.attendancePercentage
  };
};

// Method to lock attendance
attendanceSchema.methods.lock = function(userId) {
  this.isLocked = true;
  this.lockedAt = new Date();
  this.lockedBy = userId;
  return this.save();
};

// Method to unlock attendance
attendanceSchema.methods.unlock = function() {
  this.isLocked = false;
  this.lockedAt = null;
  this.lockedBy = null;
  return this.save();
};

// Soft delete query helper
attendanceSchema.query.notDeleted = function() {
  return this.where({ deletedAt: null });
};

// Pre-find middleware to exclude soft deleted
attendanceSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deletedAt: null });
  }
  next();
});

// Pre-save middleware to calculate statistics
attendanceSchema.pre('save', function(next) {
  if (this.isModified('records')) {
    this.calculateStatistics();
  }
  next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
