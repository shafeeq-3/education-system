import mongoose from 'mongoose';

const salaryPaymentSchema = new mongoose.Schema({
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
  
  // Salary structure reference
  salaryStructure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalaryStructure',
    required: [true, 'Salary structure is required']
  },
  
  // Payment period
  month: {
    type: Number,
    required: [true, 'Month is required'],
    min: 1,
    max: 12,
    index: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    index: true
  },
  
  // Salary components (snapshot from salary structure)
  baseSalary: {
    type: Number,
    required: true,
    min: 0
  },
  allowances: [{
    name: String,
    amount: Number
  }],
  deductions: [{
    name: String,
    amount: Number
  }],
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
    required: true,
    min: 0
  },
  netSalary: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Payment status
  status: {
    type: String,
    enum: ['generated', 'approved', 'paid', 'on_hold', 'cancelled'],
    default: 'generated',
    index: true
  },
  
  // Payment details
  paymentDate: Date,
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'cheque', 'other']
  },
  transactionId: String,
  bankDetails: {
    accountNumber: String,
    bankName: String,
    ifscCode: String
  },
  
  // Approval workflow
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  
  // Payment recording
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  paidAt: Date,
  
  // Remarks
  remarks: String,
  
  // Finalization (immutable after finalization)
  isFinalized: {
    type: Boolean,
    default: false,
    index: true
  },
  finalizedAt: Date,
  finalizedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Compound unique index: one salary payment per staff per month per year
salaryPaymentSchema.index({ staff: 1, month: 1, year: 1 }, { unique: true });
salaryPaymentSchema.index({ deletedAt: 1 });

// Method to approve payment
salaryPaymentSchema.methods.approve = function(userId) {
  if (this.status !== 'generated') {
    throw new Error('Can only approve generated salary payments');
  }
  
  this.status = 'approved';
  this.approvedBy = userId;
  this.approvedAt = new Date();
  
  return this.save();
};

// Method to mark as paid
salaryPaymentSchema.methods.markAsPaid = function(paymentData, userId) {
  if (this.status !== 'approved') {
    throw new Error('Can only pay approved salary payments');
  }
  
  if (this.isFinalized) {
    throw new Error('Cannot modify finalized salary payment');
  }
  
  this.status = 'paid';
  this.paymentDate = paymentData.paymentDate || new Date();
  this.paymentMethod = paymentData.paymentMethod;
  this.transactionId = paymentData.transactionId;
  if (paymentData.bankDetails) {
    this.bankDetails = paymentData.bankDetails;
  }
  this.paidBy = userId;
  this.paidAt = new Date();
  
  return this.save();
};

// Method to put on hold
salaryPaymentSchema.methods.putOnHold = function(reason) {
  if (this.status === 'paid') {
    throw new Error('Cannot put paid salary on hold');
  }
  
  if (this.isFinalized) {
    throw new Error('Cannot modify finalized salary payment');
  }
  
  this.status = 'on_hold';
  this.remarks = reason;
  
  return this.save();
};

// Method to finalize (make immutable)
salaryPaymentSchema.methods.finalize = function(userId) {
  if (this.status !== 'paid') {
    throw new Error('Can only finalize paid salary payments');
  }
  
  this.isFinalized = true;
  this.finalizedAt = new Date();
  this.finalizedBy = userId;
  
  return this.save();
};

// Soft delete query helper
salaryPaymentSchema.query.notDeleted = function() {
  return this.where({ deletedAt: null });
};

// Pre-find middleware to exclude soft deleted
salaryPaymentSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deletedAt: null });
  }
  next();
});

const SalaryPayment = mongoose.model('SalaryPayment', salaryPaymentSchema);

export default SalaryPayment;
