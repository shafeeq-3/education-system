import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
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
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: [true, 'Semester is required']
  },
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Subject code is required'],
    uppercase: true,
    trim: true
  },
  credits: {
    type: Number,
    required: [true, 'Credits are required'],
    min: [1, 'Credits must be at least 1']
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
subjectSchema.index({ campus: 1 });
subjectSchema.index({ department: 1 });
subjectSchema.index({ semester: 1 });
subjectSchema.index({ code: 1, campus: 1 }, { unique: true });

// Pre-save middleware
subjectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static methods
subjectSchema.statics.findActive = function(filter = {}) {
  return this.find({ ...filter, deletedAt: null });
};

subjectSchema.statics.softDelete = async function(id) {
  return this.findByIdAndUpdate(id, { deletedAt: Date.now() }, { new: true });
};

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;
