import express from 'express';
import analyticsController from '../controllers/analyticsController.js';
import { authenticate, authorize, checkCampusAccess } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  attendanceTrendsSchema,
  assignmentAnalyticsSchema,
  resultAnalyticsSchema,
  atRiskStudentsSchema,
  financialAnalyticsSchema,
  campusComparisonSchema,
  yearOverYearSchema
} from '../validations/analyticsValidation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// ==================== ACADEMIC ANALYTICS ====================

// Attendance trends
router.get(
  '/analytics/attendance/trends',
  authorize('superadmin', 'admin', 'teacher'),
  checkCampusAccess,
  validate(attendanceTrendsSchema, 'query'),
  analyticsController.getAttendanceTrends
);

// Attendance trends by class or subject
router.get(
  '/analytics/attendance/by-class-subject',
  authorize('superadmin', 'admin', 'teacher'),
  checkCampusAccess,
  validate(attendanceTrendsSchema, 'query'),
  analyticsController.getAttendanceTrendsByClassOrSubject
);

// Assignment submission rates
router.get(
  '/analytics/assignments/submission-rates',
  authorize('superadmin', 'admin', 'teacher'),
  checkCampusAccess,
  validate(assignmentAnalyticsSchema, 'query'),
  analyticsController.getAssignmentSubmissionRates
);

// Late submission trends
router.get(
  '/analytics/assignments/late-submissions',
  authorize('superadmin', 'admin', 'teacher'),
  checkCampusAccess,
  validate(assignmentAnalyticsSchema, 'query'),
  analyticsController.getLateSubmissionTrends
);

// Result analytics (pass/fail, grade distribution)
router.get(
  '/analytics/results',
  authorize('superadmin', 'admin', 'teacher'),
  checkCampusAccess,
  validate(resultAnalyticsSchema, 'query'),
  analyticsController.getResultAnalytics
);

// GPA trends
router.get(
  '/analytics/gpa/trends',
  authorize('superadmin', 'admin', 'teacher'),
  checkCampusAccess,
  validate(resultAnalyticsSchema, 'query'),
  analyticsController.getGPATrends
);

// ==================== STUDENT ANALYTICS ====================

// At-risk students detection
router.get(
  '/analytics/students/at-risk',
  authorize('superadmin', 'admin', 'teacher'),
  checkCampusAccess,
  validate(atRiskStudentsSchema, 'query'),
  analyticsController.getAtRiskStudents
);

// Probation trends
router.get(
  '/analytics/students/probation-trends',
  authorize('superadmin', 'admin'),
  checkCampusAccess,
  validate(financialAnalyticsSchema, 'query'),
  analyticsController.getProbationTrends
);

// Completion vs dropout analytics
router.get(
  '/analytics/students/completion-dropout',
  authorize('superadmin', 'admin'),
  checkCampusAccess,
  validate(resultAnalyticsSchema, 'query'),
  analyticsController.getCompletionDropoutAnalytics
);

// ==================== TEACHER ANALYTICS ====================

// Teacher class performance
router.get(
  '/analytics/teacher/class-performance',
  authorize('superadmin', 'admin', 'teacher'),
  checkCampusAccess,
  validate(resultAnalyticsSchema, 'query'),
  analyticsController.getTeacherClassPerformance
);

// Grading turnaround time
router.get(
  '/analytics/teacher/grading-turnaround',
  authorize('superadmin', 'admin', 'teacher'),
  checkCampusAccess,
  validate(assignmentAnalyticsSchema, 'query'),
  analyticsController.getGradingTurnaroundTime
);

// Attendance marking consistency
router.get(
  '/analytics/teacher/attendance-consistency',
  authorize('superadmin', 'admin', 'teacher'),
  checkCampusAccess,
  validate(attendanceTrendsSchema, 'query'),
  analyticsController.getAttendanceMarkingConsistency
);

// ==================== FINANCIAL ANALYTICS ====================

// Fee collection trends
router.get(
  '/analytics/finance/fee-collection',
  authorize('superadmin', 'admin', 'accounts'),
  checkCampusAccess,
  validate(financialAnalyticsSchema, 'query'),
  analyticsController.getFeeCollectionTrends
);

// Outstanding dues aging
router.get(
  '/analytics/finance/outstanding-dues-aging',
  authorize('superadmin', 'admin', 'accounts'),
  checkCampusAccess,
  validate(financialAnalyticsSchema, 'query'),
  analyticsController.getOutstandingDuesAging
);

// Salary expenditure trends
router.get(
  '/analytics/finance/salary-expenditure',
  authorize('superadmin', 'admin', 'accounts'),
  checkCampusAccess,
  validate(financialAnalyticsSchema, 'query'),
  analyticsController.getSalaryExpenditureTrends
);

// ==================== ADMIN INSIGHTS ====================

// Campus comparison
router.get(
  '/analytics/admin/campus-comparison',
  authorize('superadmin'),
  validate(campusComparisonSchema, 'query'),
  analyticsController.getCampusComparison
);

// Academic vs financial correlation
router.get(
  '/analytics/admin/academic-financial-correlation',
  authorize('superadmin', 'admin'),
  checkCampusAccess,
  validate(resultAnalyticsSchema, 'query'),
  analyticsController.getAcademicFinancialCorrelation
);

// Year-over-year comparison
router.get(
  '/analytics/admin/year-over-year',
  authorize('superadmin', 'admin'),
  checkCampusAccess,
  validate(yearOverYearSchema, 'query'),
  analyticsController.getYearOverYearComparison
);

export default router;
