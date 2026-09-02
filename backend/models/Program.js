import mongoose from 'mongoose';

const programSchema = new mongoose.Schema({
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus',
    required: [true, 'Campus is required']
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  name: {
    type: String,
    required: [true, 'Program name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Program code is required'],
    uppercase: true,
    trim: true
  },
  duration: {
    type: Number, // in years
    required: [true, 'Program duration is required'],
    min: [1, 'Duration must be at least 1 year']
  },
  description: {
    type: String,
    trim: true
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
programSchema.index({ campus: 1 });
programSchema.index({ department: 1 });
programSchema.index({ code: 1, campus: 1 }, { unique: true });

// Pre-save middleware
programSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static methods
programSchema.statics.findActive = function(filter = {}) {
  return this.find({ ...filter, deletedAt: null });
};

programSchema.statics.softDelete = async function(id) {
  return this.findByIdAndUpdate(id, { deletedAt: Date.now() }, { new: true });
};

const Program = mongoose.model('Program', programSchema);

export default Program;
