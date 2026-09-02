import mongoose from 'mongoose';

const campusSchema = new mongoose.Schema({
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institute',
    required: [true, 'Institute is required']
  },
  name: {
    type: String,
    required: [true, 'Campus name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Campus code is required'],
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
  location: {
    latitude: Number,
    longitude: Number
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
campusSchema.index({ institute: 1 });
campusSchema.index({ code: 1 });

// Pre-save middleware
campusSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static methods
campusSchema.statics.findActive = function(filter = {}) {
  return this.find({ ...filter, deletedAt: null });
};

campusSchema.statics.softDelete = async function(id) {
  return this.findByIdAndUpdate(id, { deletedAt: Date.now() }, { new: true });
};

const Campus = mongoose.model('Campus', campusSchema);

export default Campus;
