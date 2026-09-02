import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus',
    required: [true, 'Campus is required']
  },
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Department code is required'],
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Must be a teacher
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
departmentSchema.index({ campus: 1 });
departmentSchema.index({ code: 1, campus: 1 });

// Unique constraint: name and code must be unique per campus
departmentSchema.index({ name: 1, campus: 1 }, { unique: true });
departmentSchema.index({ code: 1, campus: 1 }, { unique: true });

// Pre-save middleware
departmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static methods
departmentSchema.statics.findActive = function(filter = {}) {
  return this.find({ ...filter, deletedAt: null });
};

departmentSchema.statics.softDelete = async function(id) {
  return this.findByIdAndUpdate(id, { deletedAt: Date.now() }, { new: true });
};

const Department = mongoose.model('Department', departmentSchema);

export default Department;
