import mongoose from 'mongoose';

const academicYearSchema = new mongoose.Schema({
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus',
    required: [true, 'Campus is required']
  },
  year: {
    type: String,
    required: [true, 'Academic year is required'] // e.g., "2024-2025"
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
academicYearSchema.index({ campus: 1, isCurrent: 1 });
academicYearSchema.index({ year: 1, campus: 1 }, { unique: true });

// Validation: endDate must be after startDate
academicYearSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware: Only one current academic year per campus
academicYearSchema.pre('save', async function(next) {
  if (this.isCurrent && !this.isNew) {
    // If setting this as current, unset others
    await mongoose.model('AcademicYear').updateMany(
      { campus: this.campus, _id: { $ne: this._id } },
      { isCurrent: false }
    );
  }
  next();
});

// Static methods
academicYearSchema.statics.findActive = function(filter = {}) {
  return this.find({ ...filter, deletedAt: null });
};

academicYearSchema.statics.softDelete = async function(id) {
  return this.findByIdAndUpdate(id, { deletedAt: Date.now() }, { new: true });
};

// Static method to get current academic year for a campus
academicYearSchema.statics.getCurrentYear = function(campusId) {
  return this.findOne({ campus: campusId, isCurrent: true, deletedAt: null });
};

const AcademicYear = mongoose.model('AcademicYear', academicYearSchema);

export default AcademicYear;
