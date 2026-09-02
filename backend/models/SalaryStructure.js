import mongoose from 'mongoose';

const salaryStructureSchema = new mongoose.Schema({
  // Multi-campus support
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus',
    required: [true, 'Campus is required'],
    index: true
  },
  
  // Staff member reference
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Staff member is required'],
    index: true
  },
  
  // Designation
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    trim: true
  },
  
  // Base salary
  baseSalary: {
    type: Number,
    required: [true, 'Base salary is required'],
    min: 0
  },
  
  // Allowances
  allowances: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    isPercentage: {
      type: Boolean,
      default: false
    }
  }],
  
  // Deductions
  deductions: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    isPercentage: {
      type: Boolean,
      default: false
    }
  }],
  
  // Calculated amounts
  totalAllowances: {
    type: Number,
    default: 0,
    min: 0
  },
  totalDeductions: {
    type: Number,
    default: 0,
    min: 0
  },
  grossSalary: {
    type: Number,
    default: 0,
    min: 0
  },
  netSalary: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Effective dates
  effectiveFrom: {
    type: Date,
    required: [true, 'Effective from date is required']
  },
  effectiveTo: Date,
  
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
salaryStructureSchema.index({ staff: 1, effectiveFrom: -1 });
salaryStructureSchema.index({ deletedAt: 1 });

// Method to calculate salary components
salaryStructureSchema.methods.calculateSalary = function() {
  // Calculate total allowances
  this.totalAllowances = this.allowances.reduce((sum, allowance) => {
    if (allowance.isPercentage) {
      return sum + (this.baseSalary * allowance.amount / 100);
    }
    return sum + allowance.amount;
  }, 0);
  
  // Calculate gross salary
  this.grossSalary = this.baseSalary + this.totalAllowances;
  
  // Calculate total deductions
  this.totalDeductions = this.deductions.reduce((sum, deduction) => {
    if (deduction.isPercentage) {
      return sum + (this.grossSalary * deduction.amount / 100);
    }
    return sum + deduction.amount;
  }, 0);
  
  // Calculate net salary
  this.netSalary = Math.max(0, this.grossSalary - this.totalDeductions);
  
  return {
    baseSalary: this.baseSalary,
    totalAllowances: this.totalAllowances,
    grossSalary: this.grossSalary,
    totalDeductions: this.totalDeductions,
    netSalary: this.netSalary
  };
};

// Pre-save middleware to calculate salary
salaryStructureSchema.pre('save', function(next) {
  if (this.isModified('baseSalary') || this.isModified('allowances') || this.isModified('deductions')) {
    this.calculateSalary();
  }
  next();
});

// Soft delete query helper
salaryStructureSchema.query.notDeleted = function() {
  return this.where({ deletedAt: null });
};

// Pre-find middleware to exclude soft deleted
salaryStructureSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deletedAt: null });
  }
  next();
});

const SalaryStructure = mongoose.model('SalaryStructure', salaryStructureSchema);

export default SalaryStructure;
