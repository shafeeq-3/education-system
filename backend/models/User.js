import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Primary Identification
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },
  
  // Role & Permissions
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'teacher', 'student', 'accounts'],
    required: [true, 'Role is required']
  },
  
  // Multi-Campus Support
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institute'
  },
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus'
  },
  
  // Account Status
  isApproved: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  
  // Profile Information
  profile: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    avatar: String,
    dateOfBirth: Date,
    address: String,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    }
  },
  
  // Academic Association (for teachers & students)
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  
  // Session Management
  lastActivity: {
    type: Date,
    default: Date.now
  },
  activeSessions: [{
    token: String, // Hashed refresh token
    device: String,
    ipAddress: String,
    userAgent: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: Date
  }],
  
  // Security - Login Attempts
  loginAttempts: {
    count: {
      type: Number,
      default: 0
    },
    lastAttempt: Date,
    blockedUntil: Date
  },
  
  // Audit Fields
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ role: 1, campus: 1 });
userSchema.index({ isApproved: 1, isBlocked: 1 });
userSchema.index({ department: 1 });
userSchema.index({ lastActivity: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update updatedAt
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to check if account is locked
userSchema.methods.isAccountLocked = function() {
  if (this.loginAttempts.blockedUntil && this.loginAttempts.blockedUntil > Date.now()) {
    return true;
  }
  return false;
};

// Method to increment login attempts
userSchema.methods.incrementLoginAttempts = async function() {
  // Reset attempts if last attempt was more than 15 minutes ago
  if (this.loginAttempts.lastAttempt && 
      Date.now() - this.loginAttempts.lastAttempt > 15 * 60 * 1000) {
    this.loginAttempts.count = 0;
  }
  
  this.loginAttempts.count += 1;
  this.loginAttempts.lastAttempt = Date.now();
  
  // Block account for 30 minutes after 5 failed attempts
  if (this.loginAttempts.count >= 5) {
    this.loginAttempts.blockedUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
  }
  
  await this.save();
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  this.loginAttempts.count = 0;
  this.loginAttempts.lastAttempt = null;
  this.loginAttempts.blockedUntil = null;
  await this.save();
};

// Method to update last activity
userSchema.methods.updateLastActivity = async function() {
  this.lastActivity = Date.now();
  await this.save();
};

// Static method to find active users (not deleted)
userSchema.statics.findActive = function(filter = {}) {
  return this.find({ ...filter, deletedAt: null });
};

// Static method to soft delete
userSchema.statics.softDelete = async function(id) {
  return this.findByIdAndUpdate(id, { deletedAt: Date.now() }, { new: true });
};

const User = mongoose.model('User', userSchema);

export default User;
