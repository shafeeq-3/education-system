import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  // Multi-campus support
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus',
    required: [true, 'Campus is required'],
    index: true
  },
  
  // References
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'Assignment is required'],
    index: true
  },
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
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required'],
    index: true
  },
  
  // Submission details
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  isLateSubmission: {
    type: Boolean,
    default: false
  },
  
  // Content
  content: {
    type: String,
    trim: true
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    uploadedAt: Date
  }],
  
  // Resubmission tracking
  submissionNumber: {
    type: Number,
    default: 1,
    min: 1
  },
  previousSubmissions: [{
    submittedAt: Date,
    content: String,
    attachments: [{
      fileName: String,
      fileUrl: String
    }]
  }],
  
  // Grading
  status: {
    type: String,
    enum: ['submitted', 'graded', 'returned', 'resubmit_required'],
    default: 'submitted'
  },
  marksObtained: {
    type: Number,
    min: 0,
    default: null
  },
  adjustedMarks: {
    type: Number,
    min: 0,
    default: null
  },
  latePenaltyApplied: {
    type: Number,
    default: 0
  },
  
  // Teacher feedback
  feedback: {
    type: String,
    trim: true
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gradedAt: Date,
  
  // Plagiarism check (placeholder for future)
  plagiarismScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
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

// Compound unique index: student can only have one active submission per assignment
submissionSchema.index({ assignment: 1, student: 1, deletedAt: 1 }, { unique: true });
submissionSchema.index({ status: 1 });
submissionSchema.index({ deletedAt: 1 });

// Method to calculate adjusted marks with late penalty
submissionSchema.methods.calculateAdjustedMarks = function(assignment) {
  if (!this.marksObtained) return null;
  
  let adjusted = this.marksObtained;
  
  if (this.isLateSubmission && assignment.latePenaltyType !== 'none') {
    if (assignment.latePenaltyType === 'percentage') {
      const penalty = (this.marksObtained * assignment.latePenaltyValue) / 100;
      adjusted = Math.max(0, this.marksObtained - penalty);
      this.latePenaltyApplied = penalty;
    } else if (assignment.latePenaltyType === 'fixed') {
      adjusted = Math.max(0, this.marksObtained - assignment.latePenaltyValue);
      this.latePenaltyApplied = assignment.latePenaltyValue;
    }
  }
  
  this.adjustedMarks = Math.round(adjusted * 100) / 100; // Round to 2 decimals
  return this.adjustedMarks;
};

// Method to grade submission
submissionSchema.methods.grade = function(marks, feedback, gradedBy) {
  this.marksObtained = marks;
  this.feedback = feedback;
  this.gradedBy = gradedBy;
  this.gradedAt = new Date();
  this.status = 'graded';
  return this.save();
};

// Soft delete query helper
submissionSchema.query.notDeleted = function() {
  return this.where({ deletedAt: null });
};

// Pre-find middleware to exclude soft deleted
submissionSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deletedAt: null });
  }
  next();
});

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
