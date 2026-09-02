import { z } from 'zod';

// Date range schema - accepts both date and datetime formats
const dateRangeSchema = z.object({
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  }).optional(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  }).optional()
});

// Attendance trends validation
export const attendanceTrendsSchema = z.object({
  campusId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  classId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  subjectId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  groupBy: z.enum(['daily', 'weekly', 'monthly']).optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  }).optional(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  }).optional()
});

// Assignment analytics validation
export const assignmentAnalyticsSchema = z.object({
  campusId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  classId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  subjectId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  }).optional(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  }).optional()
});

// Result analytics validation
export const resultAnalyticsSchema = z.object({
  campusId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  semesterId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  academicYearId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  programId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional()
});

// At-risk students validation
export const atRiskStudentsSchema = z.object({
  campusId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  semesterId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  programId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  riskLevel: z.enum(['all', 'high', 'medium', 'low']).optional()
});

// Financial analytics validation
export const financialAnalyticsSchema = z.object({
  campusId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  programId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  groupBy: z.enum(['daily', 'monthly']).optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  }).optional(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  }).optional(),
  startYear: z.string().optional(),
  endYear: z.string().optional()
});

// Campus comparison validation
export const campusComparisonSchema = z.object({
  campusIds: z.string().min(1, 'At least one campus ID is required')
});

// Year-over-year comparison validation
export const yearOverYearSchema = z.object({
  campusId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  metric: z.enum(['enrollment', 'attendance', 'fees', 'results']).optional()
});
