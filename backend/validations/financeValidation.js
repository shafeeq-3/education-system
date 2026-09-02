import { z } from 'zod';

// ==================== FEE STRUCTURE VALIDATIONS ====================

const feeComponentSchema = z.object({
  name: z.string().min(1, 'Component name is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  description: z.string().optional()
});

export const createFeeStructureSchema = z.object({
  campusId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid campus ID'),
  programId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid program ID'),
  semesterId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid semester ID'),
  academicYearId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid academic year ID'),
  name: z.string().min(1, 'Fee structure name is required'),
  components: z.array(feeComponentSchema).min(1, 'At least one fee component is required'),
  dueDate: z.string().datetime('Invalid due date format'),
  lateFeeEnabled: z.boolean().optional(),
  lateFeeAmount: z.number().min(0).optional(),
  lateFeePercentage: z.number().min(0).max(100).optional()
});

export const updateFeeStructureSchema = z.object({
  name: z.string().min(1).optional(),
  components: z.array(feeComponentSchema).min(1).optional(),
  dueDate: z.string().datetime().optional(),
  lateFeeEnabled: z.boolean().optional(),
  lateFeeAmount: z.number().min(0).optional(),
  lateFeePercentage: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional()
});

// ==================== STUDENT FEE VALIDATIONS ====================

export const createStudentFeeSchema = z.object({
  campusId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid campus ID'),
  studentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID'),
  enrollmentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid enrollment ID'),
  programId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid program ID'),
  semesterId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid semester ID'),
  academicYearId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid academic year ID'),
  feeStructureId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid fee structure ID')
});

export const addPaymentSchema = z.object({
  amount: z.number().min(0.01, 'Payment amount must be greater than zero'),
  paymentMethod: z.enum(['cash', 'card', 'bank_transfer', 'cheque', 'online', 'other']),
  transactionId: z.string().optional(),
  remarks: z.string().optional()
});

// ==================== SALARY STRUCTURE VALIDATIONS ====================

const allowanceDeductionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  description: z.string().optional()
});

export const createSalaryStructureSchema = z.object({
  campusId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid campus ID'),
  staffId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid staff ID'),
  designation: z.string().min(1, 'Designation is required'),
  baseSalary: z.number().min(0, 'Base salary must be non-negative'),
  allowances: z.array(allowanceDeductionSchema).optional(),
  deductions: z.array(allowanceDeductionSchema).optional(),
  effectiveFrom: z.string().datetime('Invalid effective from date'),
  effectiveTo: z.string().datetime('Invalid effective to date').optional()
});

export const updateSalaryStructureSchema = z.object({
  designation: z.string().min(1).optional(),
  baseSalary: z.number().min(0).optional(),
  allowances: z.array(allowanceDeductionSchema).optional(),
  deductions: z.array(allowanceDeductionSchema).optional(),
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional(),
  isActive: z.boolean().optional()
});

// ==================== SALARY PAYMENT VALIDATIONS ====================

export const generateSalaryPaymentSchema = z.object({
  campusId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid campus ID'),
  staffId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid staff ID'),
  month: z.number().min(1).max(12, 'Month must be between 1 and 12'),
  year: z.number().min(2000).max(2100, 'Year must be between 2000 and 2100'),
  remarks: z.string().optional()
});

export const markSalaryAsPaidSchema = z.object({
  paymentMethod: z.enum(['cash', 'bank_transfer', 'cheque', 'online', 'other']),
  transactionId: z.string().optional(),
  remarks: z.string().optional()
});

export const putSalaryOnHoldSchema = z.object({
  reason: z.string().min(1, 'Reason is required')
});
