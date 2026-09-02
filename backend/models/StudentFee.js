import mongoose from 'mongoose';

const studentFeeSchema = new mongoose.Schema({
  // Multi-campus support
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus',
    required: [true, 'Campus is required'],
    index: true
  },
  
  // Student and enrollment references
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required'],
    index: true
  },
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: [true, 'Enrollment is required'],
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
    required: [true, 'Semester is required'],
    index: true
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: [true, 'Academic year is required'],
    index: true
  },
  
  // Fee structure reference
  feeStructure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeStructure',
    required: [true, 'Fee structure is required']
  },
  
  // Fee components (copied from fee structure)
  components: [{
    name: String,
    label: String,
    amount: Number,
    isMandatory: Boolean
  }],
  
  // Amounts
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: 0
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  remainingAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  lateFeeAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Payment status
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partially_paid', 'paid', 'overdue'],
    default: 'unpaid',
    index: true
  },
  
  // Due date
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    index: true
  },
  isOverdue: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Payment history
  payments: [{
    amount: Number,
    paymentDate: Date,
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'bank_transfer', 'cheque', 'online', 'other']
    },
    transactionId: String,
    receiptNumber: String,
    remarks: String,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    recordedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Clearance status
  isClearanceIssued: {
    type: Boolean,
    default: false
  },
  clearanceIssuedAt: Date,
  clearanceIssuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Remarks
  remarks: String,
  
  // Finalization
  isFinalized: {
    type: Boolean,
    default: false
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

// Compound unique index: one fee record per student per semester
studentFeeSchema.index({ student: 1, semester: 1, academicYear: 1 }, { unique: true });
studentFeeSchema.index({ deletedAt: 1 });

// Method to calculate remaining amount
studentFeeSchema.methods.calculateRemainingAmount = function() {
  this.remainingAmount = Math.max(0, this.totalAmount + this.lateFeeAmount - this.paidAmount);
  return this.remainingAmount;
};

// Method to update payment status
studentFeeSchema.methods.updatePaymentStatus = function() {
  this.calculateRemainingAmount();
  
  if (this.remainingAmount === 0) {
    this.paymentStatus = 'paid';
  } else if (this.paidAmount > 0) {
    this.paymentStatus = 'partially_paid';
  } else if (this.isOverdue) {
    this.paymentStatus = 'overdue';
  } else {
    this.paymentStatus = 'unpaid';
  }
  
  return this.paymentStatus;
};

// Method to check if overdue
studentFeeSchema.methods.checkOverdue = function() {
  if (this.paymentStatus !== 'paid' && new Date() > this.dueDate) {
    this.isOverdue = true;
  } else {
    this.isOverdue = false;
  }
  return this.isOverdue;
};

// Method to add payment
studentFeeSchema.methods.addPayment = function(paymentData, userId) {
  this.payments.push({
    amount: paymentData.amount,
    paymentDate: paymentData.paymentDate || new Date(),
    paymentMethod: paymentData.paymentMethod,
    transactionId: paymentData.transactionId,
    receiptNumber: paymentData.receiptNumber,
    remarks: paymentData.remarks,
    recordedBy: userId,
    recordedAt: new Date()
  });
  
  this.paidAmount += paymentData.amount;
  this.calculateRemainingAmount();
  this.updatePaymentStatus();
  
  return this.save();
};

// Method to issue clearance
studentFeeSchema.methods.issueClearance = function(userId) {
  if (this.paymentStatus !== 'paid') {
    throw new Error('Cannot issue clearance for unpaid fees');
  }
  
  this.isClearanceIssued = true;
  this.clearanceIssuedAt = new Date();
  this.clearanceIssuedBy = userId;
  
  return this.save();
};

// Method to finalize
studentFeeSchema.methods.finalize = function(userId) {
  this.isFinalized = true;
  this.finalizedAt = new Date();
  this.finalizedBy = userId;
  
  return this.save();
};

// Soft delete query helper
studentFeeSchema.query.notDeleted = function() {
  return this.where({ deletedAt: null });
};

// Pre-find middleware to exclude soft deleted
studentFeeSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deletedAt: null });
  }
  next();
});

// Pre-save middleware to update status
studentFeeSchema.pre('save', function(next) {
  if (this.isModified('paidAmount') || this.isModified('totalAmount') || this.isModified('lateFeeAmount')) {
    this.calculateRemainingAmount();
    this.updatePaymentStatus();
  }
  
  if (this.isModified('dueDate') || this.isModified('paymentStatus')) {
    this.checkOverdue();
  }
  
  next();
});

const StudentFee = mongoose.model('StudentFee', studentFeeSchema);

export default StudentFee;
