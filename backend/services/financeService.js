import FeeStructure from '../models/FeeStructure.js';
import StudentFee from '../models/StudentFee.js';
import SalaryStructure from '../models/SalaryStructure.js';
import SalaryPayment from '../models/SalaryPayment.js';
import Enrollment from '../models/Enrollment.js';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors.js';
import notificationService from './notificationService.js';

class FinanceService {
  // ==================== FEE STRUCTURES ====================
  
  async createFeeStructure(data, userId) {
    const feeStructureData = {
      campus: data.campusId,
      program: data.programId,
      semester: data.semesterId,
      academicYear: data.academicYearId,
      name: data.name,
      components: data.components,
      dueDate: data.dueDate,
      lateFeeEnabled: data.lateFeeEnabled || false,
      lateFeeAmount: data.lateFeeAmount || 0,
      lateFeePercentage: data.lateFeePercentage || 0,
      createdBy: userId
    };
    
    const feeStructure = await FeeStructure.create(feeStructureData);
    return await FeeStructure.findById(feeStructure._id)
      .populate('campus', 'name code')
      .populate('program', 'name code')
      .populate('semester', 'name')
      .populate('academicYear', 'year');
  }
  
  async getFeeStructures(filters, pagination, sort) {
    const query = FeeStructure.find(filters);
    
    const total = await FeeStructure.countDocuments(filters);
    
    const feeStructures = await query
      .populate('campus', 'name code')
      .populate('program', 'name code')
      .populate('semester', 'name')
      .populate('academicYear', 'year')
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    return { feeStructures, total };
  }
  
  async getFeeStructureById(id) {
    const feeStructure = await FeeStructure.findById(id)
      .populate('campus', 'name code')
      .populate('program', 'name code duration')
      .populate('semester', 'name startDate endDate')
      .populate('academicYear', 'year startDate endDate')
      .populate('createdBy', 'profile.firstName profile.lastName');
    
    if (!feeStructure) {
      throw new NotFoundError('Fee structure not found');
    }
    
    return feeStructure;
  }
  
  async updateFeeStructure(id, data, userId) {
    const feeStructure = await FeeStructure.findById(id);
    
    if (!feeStructure) {
      throw new NotFoundError('Fee structure not found');
    }
    
    // Update fields
    const allowedUpdates = [
      'name', 'components', 'dueDate', 'lateFeeEnabled',
      'lateFeeAmount', 'lateFeePercentage', 'isActive'
    ];
    
    allowedUpdates.forEach(field => {
      if (data[field] !== undefined) {
        feeStructure[field] = data[field];
      }
    });
    
    feeStructure.updatedBy = userId;
    await feeStructure.save();
    
    return await this.getFeeStructureById(id);
  }
  
  async deleteFeeStructure(id) {
    const feeStructure = await FeeStructure.findById(id);
    
    if (!feeStructure) {
      throw new NotFoundError('Fee structure not found');
    }
    
    // Check if fee structure is used by any student fees
    const studentFeeCount = await StudentFee.countDocuments({
      feeStructure: id,
      deletedAt: null
    });
    
    if (studentFeeCount > 0) {
      throw new ConflictError('Cannot delete fee structure that is in use');
    }
    
    // Soft delete
    feeStructure.deletedAt = new Date();
    await feeStructure.save();
    
    return feeStructure;
  }
  
  // ==================== STUDENT FEES ====================
  
  async createStudentFee(data, userId) {
    // Check if student fee already exists
    const existing = await StudentFee.findOne({
      student: data.studentId,
      semester: data.semesterId,
      academicYear: data.academicYearId,
      deletedAt: null
    });
    
    if (existing) {
      throw new ConflictError('Student fee already exists for this semester');
    }
    
    // Get fee structure
    const feeStructure = await FeeStructure.findById(data.feeStructureId);
    
    if (!feeStructure) {
      throw new NotFoundError('Fee structure not found');
    }
    
    const studentFeeData = {
      campus: data.campusId,
      student: data.studentId,
      enrollment: data.enrollmentId,
      program: data.programId,
      semester: data.semesterId,
      academicYear: data.academicYearId,
      feeStructure: data.feeStructureId,
      components: feeStructure.components,
      totalAmount: feeStructure.totalAmount,
      remainingAmount: feeStructure.totalAmount,
      dueDate: feeStructure.dueDate,
      createdBy: userId
    };
    
    const studentFee = await StudentFee.create(studentFeeData);
    
    // Update enrollment with fee clearance status
    const enrollment = await Enrollment.findById(data.enrollmentId);
    if (enrollment) {
      enrollment.feeClearance = false;
      await enrollment.save();
    }
    
    const populatedFee = await this.getStudentFeeById(studentFee._id);
    
    // Trigger notification: Fee invoice generated
    notificationService.notifyFeeInvoiceGenerated(
      populatedFee,
      { _id: data.studentId },
      data.campusId,
      userId
    ).catch(err => console.error('Notification error:', err));
    
    return populatedFee;
  }
  
  async getStudentFees(filters, pagination, sort) {
    const query = StudentFee.find(filters);
    
    const total = await StudentFee.countDocuments(filters);
    
    const studentFees = await query
      .populate('campus', 'name code')
      .populate('student', 'profile.firstName profile.lastName email username')
      .populate('program', 'name code')
      .populate('semester', 'name')
      .populate('academicYear', 'year')
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    return { studentFees, total };
  }
  
  async getStudentFeeById(id) {
    const studentFee = await StudentFee.findById(id)
      .populate('campus', 'name code')
      .populate('student', 'profile.firstName profile.lastName email username profile.phone')
      .populate('enrollment', 'status')
      .populate('program', 'name code')
      .populate('semester', 'name startDate endDate')
      .populate('academicYear', 'year')
      .populate('feeStructure', 'name')
      .populate('payments.recordedBy', 'profile.firstName profile.lastName')
      .populate('clearanceIssuedBy', 'profile.firstName profile.lastName')
      .populate('createdBy', 'profile.firstName profile.lastName');
    
    if (!studentFee) {
      throw new NotFoundError('Student fee not found');
    }
    
    return studentFee;
  }
  
  async addPayment(id, paymentData, userId) {
    const studentFee = await StudentFee.findById(id);
    
    if (!studentFee) {
      throw new NotFoundError('Student fee not found');
    }
    
    if (studentFee.isFinalized) {
      throw new ConflictError('Cannot add payment to finalized fee record');
    }
    
    // Validate payment amount
    if (paymentData.amount <= 0) {
      throw new ValidationError('Payment amount must be greater than zero');
    }
    
    if (paymentData.amount > studentFee.remainingAmount) {
      throw new ValidationError('Payment amount exceeds remaining amount');
    }
    
    await studentFee.addPayment(paymentData, userId);
    
    // Update enrollment fee clearance if fully paid
    if (studentFee.paymentStatus === 'paid') {
      const enrollment = await Enrollment.findById(studentFee.enrollment);
      if (enrollment) {
        enrollment.feeClearance = true;
        await enrollment.save();
      }
    }
    
    const updatedFee = await this.getStudentFeeById(id);
    
    // Trigger notification: Fee payment received
    notificationService.notifyFeePaymentReceived(
      updatedFee,
      { _id: studentFee.student },
      paymentData.amount,
      studentFee.campus,
      userId
    ).catch(err => console.error('Notification error:', err));
    
    return updatedFee;
  }
  
  async issueClearance(id, userId) {
    const studentFee = await StudentFee.findById(id);
    
    if (!studentFee) {
      throw new NotFoundError('Student fee not found');
    }
    
    await studentFee.issueClearance(userId);
    
    // Update enrollment
    const enrollment = await Enrollment.findById(studentFee.enrollment);
    if (enrollment) {
      enrollment.feeClearance = true;
      await enrollment.save();
    }
    
    return await this.getStudentFeeById(id);
  }
  
  async deleteStudentFee(id) {
    const studentFee = await StudentFee.findById(id);
    
    if (!studentFee) {
      throw new NotFoundError('Student fee not found');
    }
    
    if (studentFee.isFinalized) {
      throw new ConflictError('Cannot delete finalized fee record');
    }
    
    if (studentFee.paidAmount > 0) {
      throw new ConflictError('Cannot delete fee record with payments');
    }
    
    // Soft delete
    studentFee.deletedAt = new Date();
    await studentFee.save();
    
    return studentFee;
  }
  
  // ==================== SALARY STRUCTURES ====================
  
  async createSalaryStructure(data, userId) {
    const salaryStructureData = {
      campus: data.campusId,
      staff: data.staffId,
      designation: data.designation,
      baseSalary: data.baseSalary,
      allowances: data.allowances || [],
      deductions: data.deductions || [],
      effectiveFrom: data.effectiveFrom,
      effectiveTo: data.effectiveTo,
      createdBy: userId
    };
    
    const salaryStructure = await SalaryStructure.create(salaryStructureData);
    return await SalaryStructure.findById(salaryStructure._id)
      .populate('campus', 'name code')
      .populate('staff', 'profile.firstName profile.lastName email');
  }
  
  async getSalaryStructures(filters, pagination, sort) {
    const query = SalaryStructure.find(filters);
    
    const total = await SalaryStructure.countDocuments(filters);
    
    const salaryStructures = await query
      .populate('campus', 'name code')
      .populate('staff', 'profile.firstName profile.lastName email')
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    return { salaryStructures, total };
  }
  
  async getSalaryStructureById(id) {
    const salaryStructure = await SalaryStructure.findById(id)
      .populate('campus', 'name code')
      .populate('staff', 'profile.firstName profile.lastName email profile.phone')
      .populate('createdBy', 'profile.firstName profile.lastName');
    
    if (!salaryStructure) {
      throw new NotFoundError('Salary structure not found');
    }
    
    return salaryStructure;
  }
  
  async updateSalaryStructure(id, data, userId) {
    const salaryStructure = await SalaryStructure.findById(id);
    
    if (!salaryStructure) {
      throw new NotFoundError('Salary structure not found');
    }
    
    // Update fields
    const allowedUpdates = [
      'designation', 'baseSalary', 'allowances', 'deductions',
      'effectiveFrom', 'effectiveTo', 'isActive'
    ];
    
    allowedUpdates.forEach(field => {
      if (data[field] !== undefined) {
        salaryStructure[field] = data[field];
      }
    });
    
    salaryStructure.updatedBy = userId;
    await salaryStructure.save();
    
    return await this.getSalaryStructureById(id);
  }
  
  async deleteSalaryStructure(id) {
    const salaryStructure = await SalaryStructure.findById(id);
    
    if (!salaryStructure) {
      throw new NotFoundError('Salary structure not found');
    }
    
    // Soft delete
    salaryStructure.deletedAt = new Date();
    await salaryStructure.save();
    
    return salaryStructure;
  }
  
  // ==================== SALARY PAYMENTS ====================
  
  async generateSalaryPayment(data, userId) {
    // Check if salary payment already exists for this month/year
    const existing = await SalaryPayment.findOne({
      staff: data.staffId,
      month: data.month,
      year: data.year,
      deletedAt: null
    });
    
    if (existing) {
      throw new ConflictError('Salary payment already exists for this period');
    }
    
    // Get active salary structure
    const salaryStructure = await SalaryStructure.findOne({
      staff: data.staffId,
      isActive: true,
      deletedAt: null
    }).sort({ effectiveFrom: -1 });
    
    if (!salaryStructure) {
      throw new NotFoundError('No active salary structure found for staff member');
    }
    
    // Calculate salary
    const salaryCalc = salaryStructure.calculateSalary();
    
    const salaryPaymentData = {
      campus: data.campusId,
      staff: data.staffId,
      salaryStructure: salaryStructure._id,
      month: data.month,
      year: data.year,
      baseSalary: salaryStructure.baseSalary,
      allowances: salaryStructure.allowances,
      deductions: salaryStructure.deductions,
      totalAllowances: salaryCalc.totalAllowances,
      totalDeductions: salaryCalc.totalDeductions,
      grossSalary: salaryCalc.grossSalary,
      netSalary: salaryCalc.netSalary,
      remarks: data.remarks,
      createdBy: userId
    };
    
    const salaryPayment = await SalaryPayment.create(salaryPaymentData);
    const populatedPayment = await this.getSalaryPaymentById(salaryPayment._id);
    
    // Trigger notification: Salary generated
    notificationService.notifySalaryGenerated(
      populatedPayment,
      { _id: data.staffId },
      data.campusId,
      userId
    ).catch(err => console.error('Notification error:', err));
    
    return populatedPayment;
  }
  
  async getSalaryPayments(filters, pagination, sort) {
    const query = SalaryPayment.find(filters);
    
    const total = await SalaryPayment.countDocuments(filters);
    
    const salaryPayments = await query
      .populate('campus', 'name code')
      .populate('staff', 'profile.firstName profile.lastName email')
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    return { salaryPayments, total };
  }
  
  async getSalaryPaymentById(id) {
    const salaryPayment = await SalaryPayment.findById(id)
      .populate('campus', 'name code')
      .populate('staff', 'profile.firstName profile.lastName email profile.phone')
      .populate('salaryStructure', 'designation')
      .populate('approvedBy', 'profile.firstName profile.lastName')
      .populate('paidBy', 'profile.firstName profile.lastName')
      .populate('finalizedBy', 'profile.firstName profile.lastName')
      .populate('createdBy', 'profile.firstName profile.lastName');
    
    if (!salaryPayment) {
      throw new NotFoundError('Salary payment not found');
    }
    
    return salaryPayment;
  }
  
  async approveSalaryPayment(id, userId) {
    const salaryPayment = await SalaryPayment.findById(id);
    
    if (!salaryPayment) {
      throw new NotFoundError('Salary payment not found');
    }
    
    await salaryPayment.approve(userId);
    
    return await this.getSalaryPaymentById(id);
  }
  
  async markSalaryAsPaid(id, paymentData, userId) {
    const salaryPayment = await SalaryPayment.findById(id);
    
    if (!salaryPayment) {
      throw new NotFoundError('Salary payment not found');
    }
    
    await salaryPayment.markAsPaid(paymentData, userId);
    
    const updatedPayment = await this.getSalaryPaymentById(id);
    
    // Trigger notification: Salary paid
    notificationService.notifySalaryPaid(
      updatedPayment,
      { _id: salaryPayment.staff },
      salaryPayment.campus,
      userId
    ).catch(err => console.error('Notification error:', err));
    
    return updatedPayment;
  }
  
  async putSalaryOnHold(id, reason) {
    const salaryPayment = await SalaryPayment.findById(id);
    
    if (!salaryPayment) {
      throw new NotFoundError('Salary payment not found');
    }
    
    await salaryPayment.putOnHold(reason);
    
    return await this.getSalaryPaymentById(id);
  }
  
  async finalizeSalaryPayment(id, userId) {
    const salaryPayment = await SalaryPayment.findById(id);
    
    if (!salaryPayment) {
      throw new NotFoundError('Salary payment not found');
    }
    
    await salaryPayment.finalize(userId);
    
    return await this.getSalaryPaymentById(id);
  }
  
  async deleteSalaryPayment(id) {
    const salaryPayment = await SalaryPayment.findById(id);
    
    if (!salaryPayment) {
      throw new NotFoundError('Salary payment not found');
    }
    
    if (salaryPayment.isFinalized) {
      throw new ConflictError('Cannot delete finalized salary payment');
    }
    
    if (salaryPayment.status === 'paid') {
      throw new ConflictError('Cannot delete paid salary');
    }
    
    // Soft delete
    salaryPayment.deletedAt = new Date();
    await salaryPayment.save();
    
    return salaryPayment;
  }
  
  // ==================== REPORTS ====================
  
  async getFeeCollectionSummary(campusId, startDate, endDate) {
    const filters = { campus: campusId, deletedAt: null };
    
    if (startDate || endDate) {
      filters['payments.paymentDate'] = {};
      if (startDate) filters['payments.paymentDate'].$gte = new Date(startDate);
      if (endDate) filters['payments.paymentDate'].$lte = new Date(endDate);
    }
    
    const studentFees = await StudentFee.find(filters);
    
    let totalCollected = 0;
    let totalOutstanding = 0;
    let paymentCount = 0;
    
    studentFees.forEach(fee => {
      totalCollected += fee.paidAmount;
      totalOutstanding += fee.remainingAmount;
      
      fee.payments.forEach(payment => {
        if (!startDate && !endDate) {
          paymentCount++;
        } else {
          const paymentDate = new Date(payment.paymentDate);
          if ((!startDate || paymentDate >= new Date(startDate)) &&
              (!endDate || paymentDate <= new Date(endDate))) {
            paymentCount++;
          }
        }
      });
    });
    
    return {
      period: { startDate, endDate },
      totalCollected,
      totalOutstanding,
      paymentCount,
      totalStudents: studentFees.length
    };
  }
  
  async getOutstandingDuesReport(campusId) {
    const studentFees = await StudentFee.find({
      campus: campusId,
      paymentStatus: { $in: ['unpaid', 'partially_paid', 'overdue'] },
      deletedAt: null
    })
      .populate('student', 'profile.firstName profile.lastName email username')
      .populate('program', 'name code')
      .populate('semester', 'name')
      .sort({ dueDate: 1 });
    
    const summary = {
      totalOutstanding: 0,
      unpaidCount: 0,
      partiallyPaidCount: 0,
      overdueCount: 0,
      students: []
    };
    
    studentFees.forEach(fee => {
      summary.totalOutstanding += fee.remainingAmount;
      
      if (fee.paymentStatus === 'unpaid') summary.unpaidCount++;
      if (fee.paymentStatus === 'partially_paid') summary.partiallyPaidCount++;
      if (fee.paymentStatus === 'overdue') summary.overdueCount++;
      
      summary.students.push({
        student: fee.student,
        program: fee.program,
        semester: fee.semester,
        totalAmount: fee.totalAmount,
        paidAmount: fee.paidAmount,
        remainingAmount: fee.remainingAmount,
        paymentStatus: fee.paymentStatus,
        dueDate: fee.dueDate,
        isOverdue: fee.isOverdue
      });
    });
    
    return summary;
  }
  
  async getSalaryExpenditureReport(campusId, month, year) {
    const filters = {
      campus: campusId,
      status: { $in: ['paid', 'approved'] },
      deletedAt: null
    };
    
    if (month) filters.month = month;
    if (year) filters.year = year;
    
    const salaryPayments = await SalaryPayment.find(filters)
      .populate('staff', 'profile.firstName profile.lastName email');
    
    const summary = {
      period: { month, year },
      totalPaid: 0,
      totalApproved: 0,
      paidCount: 0,
      approvedCount: 0,
      payments: []
    };
    
    salaryPayments.forEach(payment => {
      if (payment.status === 'paid') {
        summary.totalPaid += payment.netSalary;
        summary.paidCount++;
      } else if (payment.status === 'approved') {
        summary.totalApproved += payment.netSalary;
        summary.approvedCount++;
      }
      
      summary.payments.push({
        staff: payment.staff,
        month: payment.month,
        year: payment.year,
        netSalary: payment.netSalary,
        status: payment.status,
        paymentDate: payment.paymentDate
      });
    });
    
    return summary;
  }
}

export default new FinanceService();
