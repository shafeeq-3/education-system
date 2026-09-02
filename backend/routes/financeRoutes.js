import express from 'express';
import financeController from '../controllers/financeController.js';
import { authenticate, authorize, checkCampusAccess } from '../middlewares/auth.js';
import { validate, validateObjectId, validatePagination, validateSort } from '../middlewares/validate.js';
import { apiRateLimiter } from '../middlewares/rateLimiter.js';
import {
  createFeeStructureSchema,
  updateFeeStructureSchema,
  createStudentFeeSchema,
  addPaymentSchema,
  createSalaryStructureSchema,
  updateSalaryStructureSchema,
  generateSalaryPaymentSchema,
  markSalaryAsPaidSchema,
  putSalaryOnHoldSchema
} from '../validations/financeValidation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// ==================== FEE STRUCTURE ROUTES ====================

router.post(
  '/fee-structures',
  authorize('superadmin', 'admin', 'accounts'),
  checkCampusAccess,
  validate(createFeeStructureSchema),
  apiRateLimiter,
  financeController.createFeeStructure
);

router.get(
  '/fee-structures',
  authorize('superadmin', 'admin', 'accounts', 'teacher'),
  checkCampusAccess,
  validatePagination,
  validateSort(['name', 'createdAt', 'dueDate']),
  financeController.getFeeStructures
);

router.get(
  '/fee-structures/:id',
  authorize('superadmin', 'admin', 'accounts', 'teacher'),
  validateObjectId('id'),
  financeController.getFeeStructureById
);

router.put(
  '/fee-structures/:id',
  authorize('superadmin', 'admin', 'accounts'),
  validateObjectId('id'),
  validate(updateFeeStructureSchema),
  apiRateLimiter,
  financeController.updateFeeStructure
);

router.delete(
  '/fee-structures/:id',
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  financeController.deleteFeeStructure
);

// ==================== STUDENT FEE ROUTES ====================

// Get fees for a specific student
router.get(
  '/student-fees/student/:studentId',
  authorize('superadmin', 'admin', 'accounts', 'teacher', 'student'),
  validateObjectId('studentId'),
  financeController.getStudentFeesByStudentId
);

// Get current student's fees
router.get(
  '/student-fees/my-fees',
  authorize('student'),
  financeController.getMyFees
);

router.post(
  '/student-fees',
  authorize('superadmin', 'admin', 'accounts'),
  checkCampusAccess,
  validate(createStudentFeeSchema),
  apiRateLimiter,
  financeController.createStudentFee
);

router.get(
  '/student-fees',
  authorize('superadmin', 'admin', 'accounts', 'teacher', 'student'),
  checkCampusAccess,
  validatePagination,
  validateSort(['createdAt', 'dueDate', 'paymentStatus']),
  financeController.getStudentFees
);

router.get(
  '/student-fees/:id',
  authorize('superadmin', 'admin', 'accounts', 'teacher', 'student'),
  validateObjectId('id'),
  financeController.getStudentFeeById
);

router.post(
  '/student-fees/:id/payments',
  authorize('superadmin', 'admin', 'accounts'),
  validateObjectId('id'),
  validate(addPaymentSchema),
  apiRateLimiter,
  financeController.addPayment
);

router.post(
  '/student-fees/:id/clearance',
  authorize('superadmin', 'admin', 'accounts'),
  validateObjectId('id'),
  apiRateLimiter,
  financeController.issueClearance
);

router.delete(
  '/student-fees/:id',
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  financeController.deleteStudentFee
);

// ==================== SALARY STRUCTURE ROUTES ====================

router.post(
  '/salary-structures',
  authorize('superadmin', 'admin', 'accounts'),
  checkCampusAccess,
  validate(createSalaryStructureSchema),
  apiRateLimiter,
  financeController.createSalaryStructure
);

router.get(
  '/salary-structures',
  authorize('superadmin', 'admin', 'accounts'),
  checkCampusAccess,
  validatePagination,
  validateSort(['createdAt', 'baseSalary', 'effectiveFrom']),
  financeController.getSalaryStructures
);

router.get(
  '/salary-structures/:id',
  authorize('superadmin', 'admin', 'accounts'),
  validateObjectId('id'),
  financeController.getSalaryStructureById
);

router.put(
  '/salary-structures/:id',
  authorize('superadmin', 'admin', 'accounts'),
  validateObjectId('id'),
  validate(updateSalaryStructureSchema),
  apiRateLimiter,
  financeController.updateSalaryStructure
);

router.delete(
  '/salary-structures/:id',
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  financeController.deleteSalaryStructure
);

// ==================== SALARY PAYMENT ROUTES ====================

// Get salary payments for a specific teacher
router.get(
  '/salary-payments/teacher/:teacherId',
  authorize('superadmin', 'admin', 'accounts', 'teacher'),
  validateObjectId('teacherId'),
  financeController.getTeacherSalaryPayments
);

router.post(
  '/salary-payments',
  authorize('superadmin', 'admin', 'accounts'),
  checkCampusAccess,
  validate(generateSalaryPaymentSchema),
  apiRateLimiter,
  financeController.generateSalaryPayment
);

router.get(
  '/salary-payments',
  authorize('superadmin', 'admin', 'accounts'),
  checkCampusAccess,
  validatePagination,
  validateSort(['createdAt', 'month', 'year', 'status']),
  financeController.getSalaryPayments
);

router.get(
  '/salary-payments/:id',
  authorize('superadmin', 'admin', 'accounts'),
  validateObjectId('id'),
  financeController.getSalaryPaymentById
);

router.post(
  '/salary-payments/:id/approve',
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  financeController.approveSalaryPayment
);

router.post(
  '/salary-payments/:id/mark-paid',
  authorize('superadmin', 'admin', 'accounts'),
  validateObjectId('id'),
  validate(markSalaryAsPaidSchema),
  apiRateLimiter,
  financeController.markSalaryAsPaid
);

router.post(
  '/salary-payments/:id/hold',
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  validate(putSalaryOnHoldSchema),
  apiRateLimiter,
  financeController.putSalaryOnHold
);

router.post(
  '/salary-payments/:id/finalize',
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  financeController.finalizeSalaryPayment
);

router.delete(
  '/salary-payments/:id',
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  financeController.deleteSalaryPayment
);

// ==================== REPORT ROUTES ====================

router.get(
  '/reports/fee-collection',
  authorize('superadmin', 'admin', 'accounts'),
  checkCampusAccess,
  financeController.getFeeCollectionSummary
);

router.get(
  '/reports/outstanding-dues',
  authorize('superadmin', 'admin', 'accounts'),
  checkCampusAccess,
  financeController.getOutstandingDuesReport
);

router.get(
  '/reports/salary-expenditure',
  authorize('superadmin', 'admin', 'accounts'),
  checkCampusAccess,
  financeController.getSalaryExpenditureReport
);

export default router;
