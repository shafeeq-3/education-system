import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  // Multi-campus support
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus',
    required: [true, 'Campus is required'],
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
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required'],
    index: true
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: [true, 'Semester is required'],
    index: true
  },
  
  // Assignment details
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required']
  },
  
  // Assignment type
  type: {
    type: String,
    enum: ['quiz', 'homework', 'project', 'exam'],
    required: [true, 'Assignment type is required'],
    index: true
  },
  
  // Marks
  totalMarks: {
    type: Number,
    required: [true, 'Total marks is required'],
    min: [1, 'Total marks must be at least 1']
  },
  
  // Due date
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    index: true
  },
  
  // Late submission rules
  lateSubmissionAllowed: {
    type: Boolean,
    default: false
  },
  latePenaltyType: {
    type: String,
    enum: ['percentage', 'fixed', 'none'],
    default: 'none'
  },
  latePenaltyValue: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Visibility control
  isVisible: {
    type: Boolean,
    default: true
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  
  // Submission settings
  allowResubmission: {
    type: Boolean,
    default: false
  },
  maxResubmissions: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Attachments
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    uploadedAt: Date
  }],
  
  // Statistics (denormalized for performance)
  totalSubmissions: {
    type: Number,
    default: 0
  },
  gradedSubmissions: {
    type: Number,
    default: 0
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
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

// Indexes
assignmentSchema.index({ class: 1, dueDate: 1 });
assignmentSchema.index({ teacher: 1, type: 1 });
assignmentSchema.index({ subject: 1, semester: 1 });
assignmentSchema.index({ deletedAt: 1 });

// Virtual for checking if assignment is overdue
assignmentSchema.virtual('isOverdue').get(function() {
  return new Date() > this.dueDate;
});

// Virtual for checking if assignment is published
assignmentSchema.virtual('isPublished').get(function() {
  return this.isVisible && new Date() >= this.publishDate;
});

// Ensure virtuals are included in JSON
assignmentSchema.set('toJSON', { virtuals: true });
assignmentSchema.set('toObject', { virtuals: true });

// Soft delete query helper
assignmentSchema.query.notDeleted = function() {
  return this.where({ deletedAt: null });
};

// Pre-find middleware to exclude soft deleted
assignmentSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deletedAt: null });
  }
  next();
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;
