import mongoose from 'mongoose';

const feeStructureSchema = new mongoose.Schema({
  // Multi-campus support
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus',
    required: [true, 'Campus is required'],
    index: true
  },
  
  // Academic references
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: [true, 'Program is required'],
    index: true
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    index: true
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: [true, 'Academic year is required'],
    index: true
  },
  
  // Fee structure name
  name: {
    type: String,
    required: [true, 'Fee structure name is required'],
    trim: true
  },
  
  // Fee components
  components: [{
    name: {
      type: String,
      required: true,
      enum: ['tuition', 'lab', 'library', 'exam', 'sports', 'transport', 'hostel', 'other']
    },
    label: String,
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    isMandatory: {
      type: Boolean,
      default: true
    }
  }],
  
  // Total amount
  totalAmount: {
    type: Number,
    min: 0
  },
  
  // Due date
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  
  // Late fee configuration
  lateFeeEnabled: {
    type: Boolean,
    default: false
  },
  lateFeeAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  lateFeePercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
    index: true
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
feeStructureSchema.index({ program: 1, semester: 1, academicYear: 1 });
feeStructureSchema.index({ deletedAt: 1 });

// Pre-save middleware to calculate total amount
feeStructureSchema.pre('save', function(next) {
  if (this.isModified('components')) {
    this.totalAmount = this.components.reduce((sum, component) => sum + component.amount, 0);
  }
  next();
});

// Soft delete query helper
feeStructureSchema.query.notDeleted = function() {
  return this.where({ deletedAt: null });
};

// Pre-find middleware to exclude soft deleted
feeStructureSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deletedAt: null });
  }
  next();
});

const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);

export default FeeStructure;
