import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  // Multi-campus support
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus',
    required: [true, 'Campus is required'],
    index: true
  },
  
  // Student reference
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required'],
    index: true
  },
  
  // Class reference
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required'],
    index: true
  },
  
  // Subject reference (denormalized for quick access)
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required'],
    index: true
  },
  
  // Semester reference
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: [true, 'Semester is required'],
    index: true
  },
  
  // Academic year reference
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: [true, 'Academic year is required'],
    index: true
  },
  
  // Enrollment status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'dropped', 'completed'],
    default: 'pending',
    index: true
  },
  
  // Enrollment date
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  
  // Approval workflow
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  
  // Drop workflow
  droppedAt: Date,
  dropReason: String,
  
  // Rejection workflow
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: Date,
  rejectionReason: String,
  
  // Completion
  completedAt: Date,
  
  // Grade (populated after semester completion)
  grade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'I', 'W', null],
    default: null
  },
  gradePoints: {
    type: Number,
    min: 0,
    max: 4,
    default: null
  },
  
  // Attendance tracking (summary)
  totalClasses: {
    type: Number,
    default: 0
  },
  attendedClasses: {
    type: Number,
    default: 0
  },
  attendancePercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Eligibility
  isEligibleForExam: {
    type: Boolean,
    default: true
  },
  eligibilityReason: String,
  
  // Fee clearance (for financial integrity)
  feeClearance: {
    type: Boolean,
    default: false
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

// Compound unique index: student can only enroll once per class
enrollmentSchema.index({ student: 1, class: 1, semester: 1 }, { unique: true });
enrollmentSchema.index({ student: 1, subject: 1, semester: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ deletedAt: 1 });

// Method to calculate attendance percentage
enrollmentSchema.methods.updateAttendancePercentage = function() {
  if (this.totalClasses > 0) {
    this.attendancePercentage = Math.round((this.attendedClasses / this.totalClasses) * 100);
  } else {
    this.attendancePercentage = 0;
  }
  return this.attendancePercentage;
};

// Method to check eligibility (e.g., minimum 75% attendance)
enrollmentSchema.methods.checkEligibility = function(minAttendance = 75) {
  this.updateAttendancePercentage();
  
  if (this.attendancePercentage < minAttendance) {
    this.isEligibleForExam = false;
    this.eligibilityReason = `Attendance ${this.attendancePercentage}% is below minimum ${minAttendance}%`;
  } else {
    this.isEligibleForExam = true;
    this.eligibilityReason = null;
  }
  
  return this.isEligibleForExam;
};

// Method to approve enrollment
enrollmentSchema.methods.approve = function(approvedBy) {
  this.status = 'approved';
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  return this.save();
};

// Method to reject enrollment
enrollmentSchema.methods.reject = function(rejectedBy, reason) {
  this.status = 'rejected';
  this.rejectedBy = rejectedBy;
  this.rejectedAt = new Date();
  this.rejectionReason = reason;
  return this.save();
};

// Method to drop enrollment
enrollmentSchema.methods.drop = function(reason) {
  this.status = 'dropped';
  this.droppedAt = new Date();
  this.dropReason = reason;
  return this.save();
};

// Method to complete enrollment
enrollmentSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Soft delete query helper
enrollmentSchema.query.notDeleted = function() {
  return this.where({ deletedAt: null });
};

// Pre-find middleware to exclude soft deleted
enrollmentSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deletedAt: null });
  }
  next();
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;
