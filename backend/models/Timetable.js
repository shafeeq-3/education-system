import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
  // Multi-campus support
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus',
    required: [true, 'Campus is required'],
    index: true
  },
  
  // Class reference
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required'],
    index: true
  },
  
  // Teacher reference
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required'],
    index: true
  },
  
  // Subject reference
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required'],
    index: true
  },
  
  // Day and time
  dayOfWeek: {
    type: String,
    required: [true, 'Day of week is required'],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    index: true
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format']
  },
  
  // Location
  room: {
    type: String,
    required: [true, 'Room is required'],
    trim: true,
    index: true
  },
  building: {
    type: String,
    trim: true
  },
  
  // Type
  type: {
    type: String,
    enum: ['lecture', 'lab', 'tutorial', 'seminar'],
    default: 'lecture'
  },
  
  // Semester reference
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: [true, 'Semester is required'],
    index: true
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

// Compound indexes for conflict detection
timetableSchema.index({ teacher: 1, dayOfWeek: 1, startTime: 1, endTime: 1, semester: 1 });
timetableSchema.index({ room: 1, dayOfWeek: 1, startTime: 1, endTime: 1, semester: 1 });
timetableSchema.index({ class: 1, dayOfWeek: 1, startTime: 1, endTime: 1 });
timetableSchema.index({ deletedAt: 1 });

// Validation: End time must be after start time
timetableSchema.pre('validate', function(next) {
  if (this.startTime && this.endTime) {
    const start = this.startTime.split(':').map(Number);
    const end = this.endTime.split(':').map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    
    if (endMinutes <= startMinutes) {
      this.invalidate('endTime', 'End time must be after start time');
    }
  }
  next();
});

// Method to check time overlap
timetableSchema.methods.hasTimeOverlap = function(otherStartTime, otherEndTime) {
  const thisStart = this.startTime.split(':').map(Number);
  const thisEnd = this.endTime.split(':').map(Number);
  const otherStart = otherStartTime.split(':').map(Number);
  const otherEnd = otherEndTime.split(':').map(Number);
  
  const thisStartMinutes = thisStart[0] * 60 + thisStart[1];
  const thisEndMinutes = thisEnd[0] * 60 + thisEnd[1];
  const otherStartMinutes = otherStart[0] * 60 + otherStart[1];
  const otherEndMinutes = otherEnd[0] * 60 + otherEnd[1];
  
  return (
    (otherStartMinutes >= thisStartMinutes && otherStartMinutes < thisEndMinutes) ||
    (otherEndMinutes > thisStartMinutes && otherEndMinutes <= thisEndMinutes) ||
    (otherStartMinutes <= thisStartMinutes && otherEndMinutes >= thisEndMinutes)
  );
};

// Soft delete query helper
timetableSchema.query.notDeleted = function() {
  return this.where({ deletedAt: null });
};

// Pre-find middleware to exclude soft deleted
timetableSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deletedAt: null });
  }
  next();
});

const Timetable = mongoose.model('Timetable', timetableSchema);

export default Timetable;
