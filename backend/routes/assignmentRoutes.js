import express from 'express';
import assignmentController from '../controllers/assignmentController.js';
import attendanceController from '../controllers/attendanceController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, validateObjectId, validatePagination, validateSort } from '../middlewares/validate.js';
import { campusFilter } from '../middlewares/logger.js';
import { apiRateLimiter } from '../middlewares/rateLimiter.js';
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  createSubmissionSchema,
  gradeSubmissionSchema,
  createAttendanceSchema,
  updateAttendanceSchema,
  markAttendanceSchema
} from '../validations/assignmentValidation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// ==================== ASSIGNMENTS ====================

// Get assignments for a specific teacher
router.get(
  '/assignments/teacher/:teacherId',
  authorize('superadmin', 'admin', 'teacher'),
  validateObjectId('teacherId'),
  assignmentController.getTeacherAssignments
);

// Get assignments for a specific student
router.get(
  '/assignments/student/:studentId',
  authorize('superadmin', 'admin', 'teacher', 'student'),
  validateObjectId('studentId'),
  assignmentController.getStudentAssignments
);

router.post(
  '/assignments',
  authorize('superadmin', 'admin', 'teacher'),
  apiRateLimiter,
  validate(createAssignmentSchema),
  assignmentController.createAssignment
);

router.get(
  '/assignments',
  authorize('superadmin', 'admin', 'teacher', 'student'),
  campusFilter,
  validatePagination,
  validateSort(['title', 'dueDate', 'type', 'createdAt']),
  assignmentController.getAssignments
);

router.get(
  '/assignments/:id',
  authorize('superadmin', 'admin', 'teacher', 'student'),
  validateObjectId('id'),
  assignmentController.getAssignmentById
);

router.put(
  '/assignments/:id',
  authorize('superadmin', 'admin', 'teacher'),
  validateObjectId('id'),
  apiRateLimiter,
  validate(updateAssignmentSchema),
  assignmentController.updateAssignment
);

router.delete(
  '/assignments/:id',
  authorize('superadmin', 'admin', 'teacher'),
  validateObjectId('id'),
  apiRateLimiter,
  assignmentController.deleteAssignment
);

// ==================== SUBMISSIONS ====================

// Get submissions for a specific assignment
router.get(
  '/submissions/assignment/:assignmentId',
  authorize('superadmin', 'admin', 'teacher'),
  validateObjectId('assignmentId'),
  assignmentController.getAssignmentSubmissions
);

router.post(
  '/submissions',
  authorize('superadmin', 'admin', 'student'),
  apiRateLimiter,
  validate(createSubmissionSchema),
  assignmentController.createSubmission
);

router.get(
  '/submissions',
  authorize('superadmin', 'admin', 'teacher', 'student'),
  campusFilter,
  validatePagination,
  validateSort(['submittedAt', 'status', 'createdAt']),
  assignmentController.getSubmissions
);

router.get(
  '/submissions/:id',
  authorize('superadmin', 'admin', 'teacher', 'student'),
  validateObjectId('id'),
  assignmentController.getSubmissionById
);

router.post(
  '/submissions/:id/grade',
  authorize('superadmin', 'admin', 'teacher'),
  validateObjectId('id'),
  apiRateLimiter,
  validate(gradeSubmissionSchema),
  assignmentController.gradeSubmission
);

router.delete(
  '/submissions/:id',
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  assignmentController.deleteSubmission
);

// ==================== ATTENDANCE ====================

// Get attendance for a specific student
router.get(
  '/attendance/student/:studentId',
  authorize('superadmin', 'admin', 'teacher', 'student'),
  validateObjectId('studentId'),
  attendanceController.getStudentAttendance
);

router.post(
  '/attendance',
  authorize('superadmin', 'admin', 'teacher'),
  apiRateLimiter,
  validate(createAttendanceSchema),
  attendanceController.createAttendance
);

// Bulk create attendance records
router.post(
  '/attendance/bulk',
  authorize('superadmin', 'admin', 'teacher'),
  apiRateLimiter,
  attendanceController.bulkCreateAttendance
);

router.get(
  '/attendance',
  authorize('superadmin', 'admin', 'teacher', 'student'),
  campusFilter,
  validatePagination,
  validateSort(['date', 'createdAt']),
  attendanceController.getAttendances
);

router.get(
  '/attendance/:id',
  authorize('superadmin', 'admin', 'teacher', 'student'),
  validateObjectId('id'),
  attendanceController.getAttendanceById
);

router.put(
  '/attendance/:id',
  authorize('superadmin', 'admin', 'teacher'),
  validateObjectId('id'),
  apiRateLimiter,
  validate(updateAttendanceSchema),
  attendanceController.updateAttendance
);

router.post(
  '/attendance/:id/mark',
  authorize('superadmin', 'admin', 'teacher'),
  validateObjectId('id'),
  apiRateLimiter,
  validate(markAttendanceSchema),
  attendanceController.markAttendance
);

router.post(
  '/attendance/:id/lock',
  authorize('superadmin', 'admin', 'teacher'),
  validateObjectId('id'),
  apiRateLimiter,
  attendanceController.lockAttendance
);

router.post(
  '/attendance/:id/unlock',
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  attendanceController.unlockAttendance
);

router.delete(
  '/attendance/:id',
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  attendanceController.deleteAttendance
);

// ==================== REPORTS ====================

router.get(
  '/attendance/student/:studentId/class/:classId/report',
  authorize('superadmin', 'admin', 'teacher', 'student'),
  validateObjectId('studentId'),
  validateObjectId('classId'),
  attendanceController.getStudentAttendanceReport
);

router.get(
  '/attendance/class/:classId/report',
  authorize('superadmin', 'admin', 'teacher'),
  validateObjectId('classId'),
  attendanceController.getClassAttendanceReport
);

// ==================== ELIGIBILITY ====================

router.get(
  '/eligibility/enrollment/:enrollmentId',
  authorize('superadmin', 'admin', 'teacher', 'student'),
  validateObjectId('enrollmentId'),
  assignmentController.calculateEligibility
);

router.get(
  '/eligibility/student/:studentId/semester/:semesterId',
  authorize('superadmin', 'admin', 'teacher', 'student'),
  validateObjectId('studentId'),
  validateObjectId('semesterId'),
  assignmentController.getStudentEligibility
);

export default router;
