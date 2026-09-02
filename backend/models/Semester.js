import mongoose from 'mongoose';

const semesterSchema = new mongoose.Schema({
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus',
    required: [true, 'Campus is required']
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: [true, 'Academic year is required']
  },
  name: {
    type: String,
    required: [true, 'Semester name is required'] // e.g., "Fall 2024", "Spring 2025"
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  
  // Audit Fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: Date
}, {
  timestamps: true
});

// Indexes
semesterSchema.index({ campus: 1, isCurrent: 1 });
semesterSchema.index({ academicYear: 1 });

// Validation: endDate must be after startDate
semesterSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware: Only one current semester per campus
semesterSchema.pre('save', async function(next) {
  if (this.isCurrent && !this.isNew) {
    await mongoose.model('Semester').updateMany(
      { campus: this.campus, _id: { $ne: this._id } },
      { isCurrent: false }
    );
  }
  next();
});

// Static methods
semesterSchema.statics.findActive = function(filter = {}) {
  return this.find({ ...filter, deletedAt: null });
};

semesterSchema.statics.softDelete = async function(id) {
  return this.findByIdAndUpdate(id, { deletedAt: Date.now() }, { new: true });
};

// Static method to get current semester for a campus
semesterSchema.statics.getCurrentSemester = function(campusId) {
  return this.findOne({ campus: campusId, isCurrent: true, deletedAt: null });
};

const Semester = mongoose.model('Semester', semesterSchema);

export default Semester;
