import express from 'express';
import classController from '../controllers/classController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, validateObjectId, validatePagination, validateSort } from '../middlewares/validate.js';
import { campusFilter } from '../middlewares/logger.js';
import { apiRateLimiter } from '../middlewares/rateLimiter.js';
import {
  createClassSchema,
  updateClassSchema,
  createTimetableSchema,
  updateTimetableSchema,
  createEnrollmentSchema,
  updateEnrollmentSchema,
  rejectEnrollmentSchema
} from '../validations/classValidation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// ==================== CLASSES ====================

router.post(
  '/classes',
  authorize('superadmin', 'admin'),
  apiRateLimiter,
  validate(createClassSchema),
  classController.createClass
);

router.get(
  '/classes',
  authorize('superadmin', 'admin', 'teacher', 'student'),
  campusFilter,
  validatePagination,
  validateSort(['name', 'code', 'section', 'createdAt']),
  classController.getClasses
);

router.get(
  '/classes/:id',
  authorize('superadmin', 'admin', 'teacher', 'student'),
  validateObjectId('id'),
  classController.getClassById
);

// Get students enrolled in a class
router.get(
  '/classes/:id/students',
  authorize('superadmin', 'admin', 'teacher'),
  validateObjectId('id'),
  classController.getClassStudents
);

router.put(
  '/classes/:id',
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  validate(updateClassSchema),
  classController.updateClass
);

router.delete(
  '/classes/:id',
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  classController.deleteClass
);

// ==================== TIMETABLES ====================

router.post(
  '/timetables',
  authorize('superadmin', 'admin'),
  apiRateLimiter,
  validate(createTimetableSchema),
  classController.createTimetable
);

router.get(
  '/timetables',
  authorize('superadmin', 'admin', 'teacher', 'student'),
  campusFilter,
  validatePagination,
  validateSort(['dayOfWeek', 'startTime', 'createdAt']),
  classController.getTimetables
);

router.get(
  '/timetables/:id',
  authorize('superadmin', 'admin', 'teacher', 'student'),
  validateObjectId('id'),
  classController.getTimetableById
);

router.put(
  '/timetables/:id',
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  validate(updateTimetableSchema),
  classController.updateTimetable
);

router.delete(
  '/timetables/:id',
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  classController.deleteTimetable
);

// ==================== ENROLLMENTS ====================

// Get enrollments for a specific student
router.get(
  '/enrollments/student/:studentId',
  authorize('superadmin', 'admin', 'teacher', 'student'),
  validateObjectId('studentId'),
  classController.getStudentEnrollments
);

router.post(
  '/enrollments',
  authorize('superadmin', 'admin', 'student'),
  apiRateLimiter,
  validate(createEnrollmentSchema),
  classController.createEnrollment
);

router.get(
  '/enrollments',
  authorize('superadmin', 'admin', 'teacher', 'student'),
  campusFilter,
  validatePagination,
  validateSort(['enrolledAt', 'status', 'createdAt']),
  classController.getEnrollments
);

router.get(
  '/enrollments/:id',
  authorize('superadmin', 'admin', 'teacher', 'student'),
  validateObjectId('id'),
  classController.getEnrollmentById
);

router.put(
  '/enrollments/:id',
  authorize('superadmin', 'admin', 'teacher'),
  validateObjectId('id'),
  apiRateLimiter,
  validate(updateEnrollmentSchema),
  classController.updateEnrollment
);

router.post(
  '/enrollments/:id/approve',
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  classController.approveEnrollment
);

router.post(
  '/enrollments/:id/reject',
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  validate(rejectEnrollmentSchema),
  classController.rejectEnrollment
);

router.delete(
  '/enrollments/:id',
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  classController.deleteEnrollment
);

export default router;
