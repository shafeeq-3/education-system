import financeService from '../services/financeService.js';
import { successResponse, paginatedResponse } from '../utils/response.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { ValidationError } from '../utils/errors.js';
import logActivity from '../middlewares/activityLogger.js';

class FinanceController {
  // ==================== FEE STRUCTURES ====================
  
  createFeeStructure = asyncHandler(async (req, res) => {
    const feeStructure = await financeService.createFeeStructure(req.body, req.userId);
    await logActivity(req, 'create', 'FeeStructure', feeStructure);
    
    successResponse(res, 201, 'Fee structure created successfully', feeStructure);
  });
  
  getFeeStructures = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.campusId) filters.campus = req.query.campusId;
    if (req.query.programId) filters.program = req.query.programId;
    if (req.query.semesterId) filters.semester = req.query.semesterId;
    if (req.query.academicYearId) filters.academicYear = req.query.academicYearId;
    if (req.query.isActive) filters.isActive = req.query.isActive === 'true';
    if (req.campusFilter) Object.assign(filters, req.campusFilter);
    
    const { feeStructures, total } = await financeService.getFeeStructures(
      filters,
      req.pagination,
      req.sort
    );
    
    paginatedResponse(res, 200, feeStructures, { ...req.pagination, total });
  });
  
  getFeeStructureById = asyncHandler(async (req, res) => {
    const feeStructure = await financeService.getFeeStructureById(req.params.id);
    successResponse(res, 200, 'Fee structure retrieved successfully', feeStructure);
  });
  
  updateFeeStructure = asyncHandler(async (req, res) => {
    const feeStructure = await financeService.updateFeeStructure(req.params.id, req.body, req.userId);
    await logActivity(req, 'update', 'FeeStructure', feeStructure);
    
    successResponse(res, 200, 'Fee structure updated successfully', feeStructure);
  });
  
  deleteFeeStructure = asyncHandler(async (req, res) => {
    const feeStructure = await financeService.deleteFeeStructure(req.params.id);
    await logActivity(req, 'delete', 'FeeStructure', feeStructure);
    
    successResponse(res, 200, 'Fee structure deleted successfully');
  });
  
  // ==================== STUDENT FEES ====================
  
  getStudentFeesByStudentId = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    
    // Authorization: Students can only view their own fees
    if (req.userRole === 'student' && req.userId.toString() !== studentId) {
      throw new ValidationError('You can only view your own fees');
    }
    
    const filters = { student: studentId };
    if (req.campusFilter) Object.assign(filters, req.campusFilter);
    
    const { studentFees, total } = await financeService.getStudentFees(
      filters,
      { skip: 0, limit: 1000 },
      { createdAt: -1 }
    );
    
    successResponse(res, 200, 'Student fees retrieved successfully', {
      items: studentFees,
      total
    });
  });
  
  getMyFees = asyncHandler(async (req, res) => {
    const filters = { student: req.userId };
    
    const { studentFees, total } = await financeService.getStudentFees(
      filters,
      { page: 1, limit: 100 },
      { createdAt: -1 }
    );
    
    paginatedResponse(res, 200, studentFees, { page: 1, limit: 100, total });
  });
  
  createStudentFee = asyncHandler(async (req, res) => {
    const studentFee = await financeService.createStudentFee(req.body, req.userId);
    await logActivity(req, 'create', 'StudentFee', studentFee);
    
    successResponse(res, 201, 'Student fee created successfully', studentFee);
  });
  
  getStudentFees = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.campusId) filters.campus = req.query.campusId;
    if (req.query.studentId) filters.student = req.query.studentId;
    if (req.query.programId) filters.program = req.query.programId;
    if (req.query.semesterId) filters.semester = req.query.semesterId;
    if (req.query.academicYearId) filters.academicYear = req.query.academicYearId;
    if (req.query.paymentStatus) filters.paymentStatus = req.query.paymentStatus;
    if (req.query.isOverdue) filters.isOverdue = req.query.isOverdue === 'true';
    if (req.campusFilter) Object.assign(filters, req.campusFilter);
    
    const { studentFees, total } = await financeService.getStudentFees(
      filters,
      req.pagination,
      req.sort
    );
    
    paginatedResponse(res, 200, studentFees, { ...req.pagination, total });
  });
  
  getStudentFeeById = asyncHandler(async (req, res) => {
    const studentFee = await financeService.getStudentFeeById(req.params.id);
    successResponse(res, 200, 'Student fee retrieved successfully', studentFee);
  });
  
  addPayment = asyncHandler(async (req, res) => {
    const studentFee = await financeService.addPayment(req.params.id, req.body, req.userId);
    await logActivity(req, 'addPayment', 'StudentFee', studentFee);
    
    successResponse(res, 200, 'Payment added successfully', studentFee);
  });
  
  issueClearance = asyncHandler(async (req, res) => {
    const studentFee = await financeService.issueClearance(req.params.id, req.userId);
    await logActivity(req, 'issueClearance', 'StudentFee', studentFee);
    
    successResponse(res, 200, 'Fee clearance issued successfully', studentFee);
  });
  
  deleteStudentFee = asyncHandler(async (req, res) => {
    const studentFee = await financeService.deleteStudentFee(req.params.id);
    await logActivity(req, 'delete', 'StudentFee', studentFee);
    
    successResponse(res, 200, 'Student fee deleted successfully');
  });
  
  // ==================== SALARY STRUCTURES ====================
  
  createSalaryStructure = asyncHandler(async (req, res) => {
    const salaryStructure = await financeService.createSalaryStructure(req.body, req.userId);
    await logActivity(req, 'create', 'SalaryStructure', salaryStructure);
    
    successResponse(res, 201, 'Salary structure created successfully', salaryStructure);
  });
  
  getSalaryStructures = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.campusId) filters.campus = req.query.campusId;
    if (req.query.staffId) filters.staff = req.query.staffId;
    if (req.query.isActive) filters.isActive = req.query.isActive === 'true';
    if (req.campusFilter) Object.assign(filters, req.campusFilter);
    
    const { salaryStructures, total } = await financeService.getSalaryStructures(
      filters,
      req.pagination,
      req.sort
    );
    
    paginatedResponse(res, 200, salaryStructures, { ...req.pagination, total });
  });
  
  getSalaryStructureById = asyncHandler(async (req, res) => {
    const salaryStructure = await financeService.getSalaryStructureById(req.params.id);
    successResponse(res, 200, 'Salary structure retrieved successfully', salaryStructure);
  });
  
  updateSalaryStructure = asyncHandler(async (req, res) => {
    const salaryStructure = await financeService.updateSalaryStructure(req.params.id, req.body, req.userId);
    await logActivity(req, 'update', 'SalaryStructure', salaryStructure);
    
    successResponse(res, 200, 'Salary structure updated successfully', salaryStructure);
  });
  
  deleteSalaryStructure = asyncHandler(async (req, res) => {
    const salaryStructure = await financeService.deleteSalaryStructure(req.params.id);
    await logActivity(req, 'delete', 'SalaryStructure', salaryStructure);
    
    successResponse(res, 200, 'Salary structure deleted successfully');
  });
  
  // ==================== SALARY PAYMENTS ====================
  
  getTeacherSalaryPayments = asyncHandler(async (req, res) => {
    const { teacherId } = req.params;
    
    // Authorization: Teachers can only view their own salary payments
    if (req.userRole === 'teacher' && req.userId.toString() !== teacherId) {
      throw new ValidationError('You can only view your own salary payments');
    }
    
    const filters = { teacher: teacherId };
    if (req.campusFilter) Object.assign(filters, req.campusFilter);
    
    const { salaryPayments, total } = await financeService.getSalaryPayments(
      filters,
      { skip: 0, limit: 1000 },
      { createdAt: -1 }
    );
    
    successResponse(res, 200, 'Teacher salary payments retrieved successfully', {
      items: salaryPayments,
      total
    });
  });
  
  generateSalaryPayment = asyncHandler(async (req, res) => {
    const salaryPayment = await financeService.generateSalaryPayment(req.body, req.userId);
    await logActivity(req, 'generate', 'SalaryPayment', salaryPayment);
    
    successResponse(res, 201, 'Salary payment generated successfully', salaryPayment);
  });
  
  getSalaryPayments = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.campusId) filters.campus = req.query.campusId;
    if (req.query.staffId) filters.staff = req.query.staffId;
    if (req.query.month) filters.month = parseInt(req.query.month);
    if (req.query.year) filters.year = parseInt(req.query.year);
    if (req.query.status) filters.status = req.query.status;
    if (req.query.isFinalized) filters.isFinalized = req.query.isFinalized === 'true';
    if (req.campusFilter) Object.assign(filters, req.campusFilter);
    
    const { salaryPayments, total } = await financeService.getSalaryPayments(
      filters,
      req.pagination,
      req.sort
    );
    
    paginatedResponse(res, 200, salaryPayments, { ...req.pagination, total });
  });
  
  getSalaryPaymentById = asyncHandler(async (req, res) => {
    const salaryPayment = await financeService.getSalaryPaymentById(req.params.id);
    successResponse(res, 200, 'Salary payment retrieved successfully', salaryPayment);
  });
  
  approveSalaryPayment = asyncHandler(async (req, res) => {
    const salaryPayment = await financeService.approveSalaryPayment(req.params.id, req.userId);
    await logActivity(req, 'approve', 'SalaryPayment', salaryPayment);
    
    successResponse(res, 200, 'Salary payment approved successfully', salaryPayment);
  });
  
  markSalaryAsPaid = asyncHandler(async (req, res) => {
    const salaryPayment = await financeService.markSalaryAsPaid(req.params.id, req.body, req.userId);
    await logActivity(req, 'markAsPaid', 'SalaryPayment', salaryPayment);
    
    successResponse(res, 200, 'Salary marked as paid successfully', salaryPayment);
  });
  
  putSalaryOnHold = asyncHandler(async (req, res) => {
    const salaryPayment = await financeService.putSalaryOnHold(req.params.id, req.body.reason);
    await logActivity(req, 'putOnHold', 'SalaryPayment', salaryPayment);
    
    successResponse(res, 200, 'Salary put on hold successfully', salaryPayment);
  });
  
  finalizeSalaryPayment = asyncHandler(async (req, res) => {
    const salaryPayment = await financeService.finalizeSalaryPayment(req.params.id, req.userId);
    await logActivity(req, 'finalize', 'SalaryPayment', salaryPayment);
    
    successResponse(res, 200, 'Salary payment finalized successfully', salaryPayment);
  });
  
  deleteSalaryPayment = asyncHandler(async (req, res) => {
    const salaryPayment = await financeService.deleteSalaryPayment(req.params.id);
    await logActivity(req, 'delete', 'SalaryPayment', salaryPayment);
    
    successResponse(res, 200, 'Salary payment deleted successfully');
  });
  
  // ==================== REPORTS ====================
  
  getFeeCollectionSummary = asyncHandler(async (req, res) => {
    const { campusId, startDate, endDate } = req.query;
    
    const summary = await financeService.getFeeCollectionSummary(
      campusId || req.campusId,
      startDate,
      endDate
    );
    
    successResponse(res, 200, 'Fee collection summary retrieved successfully', summary);
  });
  
  getOutstandingDuesReport = asyncHandler(async (req, res) => {
    const campusId = req.query.campusId || req.campusId;
    
    const report = await financeService.getOutstandingDuesReport(campusId);
    
    successResponse(res, 200, 'Outstanding dues report retrieved successfully', report);
  });
  
  getSalaryExpenditureReport = asyncHandler(async (req, res) => {
    const { campusId, month, year } = req.query;
    
    const report = await financeService.getSalaryExpenditureReport(
      campusId || req.campusId,
      month ? parseInt(month) : null,
      year ? parseInt(year) : null
    );
    
    successResponse(res, 200, 'Salary expenditure report retrieved successfully', report);
  });
}

export default new FinanceController();
