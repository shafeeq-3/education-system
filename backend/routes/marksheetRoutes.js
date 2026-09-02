import express from 'express';
import marksheetController from '../controllers/marksheetController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, validateObjectId, validatePagination, validateSort } from '../middlewares/validate.js';
import { campusFilter } from '../middlewares/logger.js';
import { apiRateLimiter } from '../middlewares/rateLimiter.js';
import {
  generateMarksheetSchema,
  updateMarksheetSchema,
  generateTranscriptSchema
} from '../validations/marksheetValidation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// ==================== MARKSHEETS ====================

// Get marksheets for a specific student
router.get(
  '/marksheets/student/:studentId',
  authorize('superadmin', 'admin', 'teacher', 'student'),
  validateObjectId('studentId'),
  marksheetController.getStudentMarksheets
);

router.post(
  '/marksheets/generate',
  authorize('superadmin', 'admin', 'teacher'),
  apiRateLimiter,
  validate(generateMarksheetSchema),
  marksheetController.generateMarksheet
);

router.get(
  '/marksheets',
  authorize('superadmin', 'admin', 'teacher', 'student'),
  campusFilter,
  validatePagination,
  validateSort(['percentage', 'letterGrade', 'createdAt']),
  marksheetController.getMarksheets
);

router.get(
  '/marksheets/:id',
  authorize('superadmin', 'admin', 'teacher', 'student'),
  validateObjectId('id'),
  marksheetController.getMarksheetById
);

router.put(
  '/marksheets/:id',
  authorize('superadmin', 'admin', 'teacher'),
  validateObjectId('id'),
  apiRateLimiter,
  validate(updateMarksheetSchema),
  marksheetController.updateMarksheet
);

router.post(
  '/marksheets/:id/lock',
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  marksheetController.lockMarksheet
);

router.post(
  '/marksheets/:id/unlock',
  authorize('superadmin'),
  validateObjectId('id'),
  apiRateLimiter,
  marksheetController.unlockMarksheet
);

router.post(
  '/marksheets/:id/finalize',
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  marksheetController.finalizeMarksheet
);

router.delete(
  '/marksheets/:id',
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  marksheetController.deleteMarksheet
);

// ==================== TRANSCRIPTS ====================

// Get transcript for a specific student
router.get(
  '/transcripts/student/:studentId',
  authorize('superadmin', 'admin', 'teacher', 'student'),
  validateObjectId('studentId'),
  marksheetController.getStudentTranscript
);

router.post(
  '/transcripts/generate',
  authorize('superadmin', 'admin'),
  apiRateLimiter,
  validate(generateTranscriptSchema),
  marksheetController.generateTranscript
);

router.post(
  '/transcripts/:id/update',
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  marksheetController.updateTranscript
);

router.get(
  '/transcripts',
  authorize('superadmin', 'admin', 'teacher', 'student'),
  campusFilter,
  validatePagination,
  validateSort(['cumulativeGPA', 'cumulativePercentage', 'createdAt']),
  marksheetController.getTranscripts
);

router.get(
  '/transcripts/:id',
  authorize('superadmin', 'admin', 'teacher', 'student'),
  validateObjectId('id'),
  marksheetController.getTranscriptById
);

router.post(
  '/transcripts/:id/lock',
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  marksheetController.lockTranscript
);

router.post(
  '/transcripts/:id/unlock',
  authorize('superadmin'),
  validateObjectId('id'),
  apiRateLimiter,
  marksheetController.unlockTranscript
);

router.delete(
  '/transcripts/:id',
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  marksheetController.deleteTranscript
);

export default router;
