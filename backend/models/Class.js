import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  // Multi-campus support
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus',
    required: [true, 'Campus is required'],
    index: true
  },
  
  // Academic structure
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required'],
    index: true
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: [true, 'Program is required'],
    index: true
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: [true, 'Semester is required'],
    index: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required'],
    index: true
  },
  
  // Class details
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Class code is required'],
    trim: true,
    uppercase: true
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    trim: true,
    uppercase: true
  },
  
  // Capacity
  maxStudents: {
    type: Number,
    required: [true, 'Maximum students capacity is required'],
    min: [1, 'Maximum students must be at least 1']
  },
  currentEnrollment: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Teacher assignment
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  
  // Room/Location
  room: {
    type: String,
    trim: true
  },
  building: {
    type: String,
    trim: true
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
classSchema.index({ code: 1, campus: 1 }, { unique: true });
classSchema.index({ subject: 1, section: 1, semester: 1 });
classSchema.index({ teacher: 1 });
classSchema.index({ deletedAt: 1 });

// Virtual for checking if class is full
classSchema.virtual('isFull').get(function() {
  return this.currentEnrollment >= this.maxStudents;
});

// Virtual for available seats
classSchema.virtual('availableSeats').get(function() {
  return Math.max(0, this.maxStudents - this.currentEnrollment);
});

// Ensure virtuals are included in JSON
classSchema.set('toJSON', { virtuals: true });
classSchema.set('toObject', { virtuals: true });

// Soft delete query helper
classSchema.query.notDeleted = function() {
  return this.where({ deletedAt: null });
};

// Pre-find middleware to exclude soft deleted
classSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deletedAt: null });
  }
  next();
});

const Class = mongoose.model('Class', classSchema);

export default Class;
