import mongoose from 'mongoose';

const marksheetSchema = new mongoose.Schema({
  // Multi-campus support
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus',
    required: [true, 'Campus is required'],
    index: true
  },
  
  // Student and enrollment references
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required'],
    index: true
  },
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: [true, 'Enrollment is required'],
    index: true
  },
  
  // Academic references
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
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: [true, 'Academic year is required'],
    index: true
  },
  
  // Marks breakdown
  assignmentMarks: {
    totalAssignments: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    obtainedMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 }
  },
  
  examMarks: {
    midtermMarks: { type: Number, default: 0 },
    finalMarks: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    obtainedMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 }
  },
  
  // Total marks
  totalMarks: {
    type: Number,
    required: [true, 'Total marks is required'],
    min: 0
  },
  obtainedMarks: {
    type: Number,
    required: [true, 'Obtained marks is required'],
    min: 0
  },
  percentage: {
    type: Number,
    required: [true, 'Percentage is required'],
    min: 0,
    max: 100
  },
  
  // Grading
  letterGrade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', null],
    default: null
  },
  gradePoints: {
    type: Number,
    min: 0,
    max: 4,
    default: null
  },
  
  // Pass/Fail status
  isPassed: {
    type: Boolean,
    default: false
  },
  passingMarks: {
    type: Number,
    default: 40
  },
  
  // Attendance
  attendancePercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalClasses: {
    type: Number,
    default: 0
  },
  attendedClasses: {
    type: Number,
    default: 0
  },
  
  // Eligibility
  isEligible: {
    type: Boolean,
    default: true
  },
  eligibilityReason: String,
  
  // Remarks
  remarks: String,
  teacherRemarks: String,
  
  // Locking mechanism
  isLocked: {
    type: Boolean,
    default: false,
    index: true
  },
  lockedAt: Date,
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Finalization
  isFinalized: {
    type: Boolean,
    default: false,
    index: true
  },
  finalizedAt: Date,
  finalizedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Compound unique index: one marksheet per enrollment per subject
marksheetSchema.index({ enrollment: 1, subject: 1, semester: 1 }, { unique: true });
marksheetSchema.index({ student: 1, semester: 1 });
marksheetSchema.index({ deletedAt: 1 });

// Method to calculate letter grade and grade points
marksheetSchema.methods.calculateGrade = function() {
  const percentage = this.percentage;
  
  if (percentage >= 90) {
    this.letterGrade = 'A+';
    this.gradePoints = 4.0;
  } else if (percentage >= 85) {
    this.letterGrade = 'A';
    this.gradePoints = 3.7;
  } else if (percentage >= 80) {
    this.letterGrade = 'A-';
    this.gradePoints = 3.3;
  } else if (percentage >= 75) {
    this.letterGrade = 'B+';
    this.gradePoints = 3.0;
  } else if (percentage >= 70) {
    this.letterGrade = 'B';
    this.gradePoints = 2.7;
  } else if (percentage >= 65) {
    this.letterGrade = 'B-';
    this.gradePoints = 2.3;
  } else if (percentage >= 60) {
    this.letterGrade = 'C+';
    this.gradePoints = 2.0;
  } else if (percentage >= 55) {
    this.letterGrade = 'C';
    this.gradePoints = 1.7;
  } else if (percentage >= 50) {
    this.letterGrade = 'C-';
    this.gradePoints = 1.3;
  } else if (percentage >= 40) {
    this.letterGrade = 'D';
    this.gradePoints = 1.0;
  } else {
    this.letterGrade = 'F';
    this.gradePoints = 0.0;
  }
  
  return { letterGrade: this.letterGrade, gradePoints: this.gradePoints };
};

// Method to determine pass/fail
marksheetSchema.methods.determinePassFail = function() {
  this.isPassed = this.obtainedMarks >= this.passingMarks && this.isEligible;
  return this.isPassed;
};

// Method to lock marksheet
marksheetSchema.methods.lock = function(userId) {
  this.isLocked = true;
  this.lockedAt = new Date();
  this.lockedBy = userId;
  return this.save();
};

// Method to unlock marksheet
marksheetSchema.methods.unlock = function() {
  this.isLocked = false;
  this.lockedAt = null;
  this.lockedBy = null;
  return this.save();
};

// Method to finalize marksheet
marksheetSchema.methods.finalize = function(userId) {
  this.isFinalized = true;
  this.finalizedAt = new Date();
  this.finalizedBy = userId;
  this.isLocked = true;
  this.lockedAt = new Date();
  this.lockedBy = userId;
  return this.save();
};

// Soft delete query helper
marksheetSchema.query.notDeleted = function() {
  return this.where({ deletedAt: null });
};

// Pre-find middleware to exclude soft deleted
marksheetSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deletedAt: null });
  }
  next();
});

const Marksheet = mongoose.model('Marksheet', marksheetSchema);

export default Marksheet;
