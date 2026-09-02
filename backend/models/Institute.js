import mongoose from 'mongoose';

const instituteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Institute name is required'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Institute code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  website: {
    type: String,
    trim: true
  },
  logo: {
    type: String // Cloudinary URL
  },
  
  // Configuration
  configuration: {
    sessionTimeout: {
      type: Number,
      default: 30 // minutes
    },
    backupSchedule: {
      type: String,
      default: '0 2 * * *' // Daily at 2 AM (cron format)
    },
    eligibilityThreshold: {
      type: Number,
      default: 75 // percentage
    },
    maxFileSize: {
      type: Number,
      default: 10485760 // 10 MB in bytes
    }
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
  deletedAt: Date // Soft delete
}, {
  timestamps: true
});

// Indexes
instituteSchema.index({ code: 1 });

// Pre-save middleware to update updatedAt
instituteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find active institutes
instituteSchema.statics.findActive = function(filter = {}) {
  return this.find({ ...filter, deletedAt: null });
};

// Static method to soft delete
instituteSchema.statics.softDelete = async function(id) {
  return this.findByIdAndUpdate(id, { deletedAt: Date.now() }, { new: true });
};

const Institute = mongoose.model('Institute', instituteSchema);

export default Institute;
