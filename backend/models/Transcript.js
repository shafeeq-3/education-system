import mongoose from 'mongoose';

const transcriptSchema = new mongoose.Schema({
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
  
  // Academic references
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: [true, 'Program is required'],
    index: true
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: [true, 'Academic year is required'],
    index: true
  },
  
  // Semester-wise records
  semesters: [{
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: true
    },
    semesterName: String,
    subjects: [{
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
      },
      subjectName: String,
      subjectCode: String,
      credits: Number,
      totalMarks: Number,
      obtainedMarks: Number,
      percentage: Number,
      letterGrade: String,
      gradePoints: Number,
      isPassed: Boolean
    }],
    totalCredits: { type: Number, default: 0 },
    earnedCredits: { type: Number, default: 0 },
    semesterGPA: { type: Number, default: 0, min: 0, max: 4 },
    semesterPercentage: { type: Number, default: 0 },
    isPassed: { type: Boolean, default: false }
  }],
  
  // Cumulative statistics
  totalCredits: {
    type: Number,
    default: 0
  },
  earnedCredits: {
    type: Number,
    default: 0
  },
  cumulativeGPA: {
    type: Number,
    default: 0,
    min: 0,
    max: 4
  },
  cumulativePercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Academic status
  academicStatus: {
    type: String,
    enum: ['active', 'probation', 'passed', 'failed', 'suspended'],
    default: 'active',
    index: true
  },
  
  // Probation tracking
  isProbation: {
    type: Boolean,
    default: false
  },
  probationReason: String,
  probationSemesters: {
    type: Number,
    default: 0
  },
  
  // Completion tracking
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  
  // Degree information
  degreeAwarded: String,
  degreeAwardedDate: Date,
  
  // Remarks
  remarks: String,
  
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

// Unique index: one transcript per student per program
transcriptSchema.index({ student: 1, program: 1, academicYear: 1 }, { unique: true });
transcriptSchema.index({ deletedAt: 1 });

// Method to calculate cumulative GPA
transcriptSchema.methods.calculateCumulativeGPA = function() {
  let totalGradePoints = 0;
  let totalCredits = 0;
  let earnedCredits = 0;
  
  this.semesters.forEach(semester => {
    semester.subjects.forEach(subject => {
      if (subject.gradePoints !== null && subject.credits) {
        totalGradePoints += subject.gradePoints * subject.credits;
        totalCredits += subject.credits;
        if (subject.isPassed) {
          earnedCredits += subject.credits;
        }
      }
    });
  });
  
  this.totalCredits = totalCredits;
  this.earnedCredits = earnedCredits;
  this.cumulativeGPA = totalCredits > 0 ? Math.round((totalGradePoints / totalCredits) * 100) / 100 : 0;
  
  return this.cumulativeGPA;
};

// Method to calculate cumulative percentage
transcriptSchema.methods.calculateCumulativePercentage = function() {
  let totalMarks = 0;
  let obtainedMarks = 0;
  
  this.semesters.forEach(semester => {
    semester.subjects.forEach(subject => {
      if (subject.totalMarks && subject.obtainedMarks !== null) {
        totalMarks += subject.totalMarks;
        obtainedMarks += subject.obtainedMarks;
      }
    });
  });
  
  this.cumulativePercentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;
  
  return this.cumulativePercentage;
};

// Method to determine academic status
transcriptSchema.methods.determineAcademicStatus = function() {
  // Calculate current GPA
  this.calculateCumulativeGPA();
  
  // Check for probation (GPA < 2.0)
  if (this.cumulativeGPA < 2.0 && this.cumulativeGPA > 0) {
    this.isProbation = true;
    this.academicStatus = 'probation';
    this.probationReason = `Cumulative GPA ${this.cumulativeGPA} is below 2.0`;
  } else {
    this.isProbation = false;
    this.probationReason = null;
  }
  
  // Check for completion
  if (this.isCompleted) {
    this.academicStatus = 'passed';
  }
  
  return this.academicStatus;
};

// Method to add semester record
transcriptSchema.methods.addSemester = function(semesterData) {
  // Check if semester already exists
  const existingIndex = this.semesters.findIndex(
    s => s.semester.toString() === semesterData.semester.toString()
  );
  
  if (existingIndex >= 0) {
    // Update existing semester
    this.semesters[existingIndex] = semesterData;
  } else {
    // Add new semester
    this.semesters.push(semesterData);
  }
  
  // Recalculate cumulative stats
  this.calculateCumulativeGPA();
  this.calculateCumulativePercentage();
  this.determineAcademicStatus();
  
  return this.save();
};

// Method to lock transcript
transcriptSchema.methods.lock = function(userId) {
  this.isLocked = true;
  this.lockedAt = new Date();
  this.lockedBy = userId;
  return this.save();
};

// Method to unlock transcript
transcriptSchema.methods.unlock = function() {
  this.isLocked = false;
  this.lockedAt = null;
  this.lockedBy = null;
  return this.save();
};

// Soft delete query helper
transcriptSchema.query.notDeleted = function() {
  return this.where({ deletedAt: null });
};

// Pre-find middleware to exclude soft deleted
transcriptSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deletedAt: null });
  }
  next();
});

const Transcript = mongoose.model('Transcript', transcriptSchema);

export default Transcript;
