import express from 'express';
import academicController from '../controllers/academicController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, validateObjectId, validatePagination, validateSort } from '../middlewares/validate.js';
import { campusFilter } from '../middlewares/logger.js';
import { apiRateLimiter } from '../middlewares/rateLimiter.js';
import {
  createInstituteSchema,
  updateInstituteSchema,
  createCampusSchema,
  updateCampusSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  createProgramSchema,
  updateProgramSchema,
  createAcademicYearSchema,
  updateAcademicYearSchema,
  createSemesterSchema,
  updateSemesterSchema,
  createSubjectSchema,
  updateSubjectSchema
} from '../validations/academicValidation.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// Public campuses endpoint for registration page (no auth required)
router.get(
  '/campuses',
  (req, res, next) => {
    console.log('✅ PUBLIC /campuses route hit - NO AUTH REQUIRED');
    next();
  },
  validatePagination,
  validateSort(['name', 'code', 'createdAt']),
  academicController.getCampuses
);

// ==================== INSTITUTES ====================
// Only SuperAdmin can manage institutes

router.post(
  '/institutes',
  authenticate,
  authorize('superadmin', 'admin'),
  apiRateLimiter,
  validate(createInstituteSchema),
  academicController.createInstitute
);

router.get(
  '/institutes',
  authenticate,
  authorize('superadmin', 'admin'),
  validatePagination,
  validateSort(['name', 'code', 'createdAt']),
  academicController.getInstitutes
);

router.get(
  '/institutes/:id',
  authenticate,
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  academicController.getInstituteById
);

router.put(
  '/institutes/:id',
  authenticate,
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  validate(updateInstituteSchema),
  academicController.updateInstitute
);

router.delete(
  '/institutes/:id',
  authenticate,
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  academicController.deleteInstitute
);

// ==================== CAMPUSES ====================
// SuperAdmin can manage all campuses, Admin can view their campus

router.post(
  '/campuses',
  authenticate,
  authorize('superadmin', 'admin'),
  apiRateLimiter,
  validate(createCampusSchema),
  academicController.createCampus
);

router.get(
  '/campuses/:id',
  authenticate,
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  academicController.getCampusById
);

router.put(
  '/campuses/:id',
  authenticate,
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  validate(updateCampusSchema),
  academicController.updateCampus
);

router.delete(
  '/campuses/:id',
  authenticate,
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  academicController.deleteCampus
);

// ==================== DEPARTMENTS ====================
// SuperAdmin and Admin can manage, Teachers/Students can view

router.post(
  '/departments',
  authenticate,
  authorize('superadmin', 'admin'),
  apiRateLimiter,
  validate(createDepartmentSchema),
  academicController.createDepartment
);

router.get(
  '/departments',
  authenticate,
  authorize('superadmin', 'admin', 'teacher', 'student'),
  campusFilter,
  validatePagination,
  validateSort(['name', 'code', 'createdAt']),
  academicController.getDepartments
);

router.get(
  '/departments/:id',
  authenticate,
  authorize('superadmin', 'admin', 'teacher', 'student'),
  validateObjectId('id'),
  academicController.getDepartmentById
);

router.put(
  '/departments/:id',
  authenticate,
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  validate(updateDepartmentSchema),
  academicController.updateDepartment
);

router.delete(
  '/departments/:id',
  authenticate,
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  academicController.deleteDepartment
);

// ==================== PROGRAMS ====================
// SuperAdmin and Admin can manage, Teachers/Students can view

router.post(
  '/programs',
  authenticate,
  authorize('superadmin', 'admin'),
  apiRateLimiter,
  validate(createProgramSchema),
  academicController.createProgram
);

router.get(
  '/programs',
  authenticate,
  authorize('superadmin', 'admin', 'teacher', 'student'),
  campusFilter,
  validatePagination,
  validateSort(['name', 'code', 'createdAt']),
  academicController.getPrograms
);

router.get(
  '/programs/:id',
  authenticate,
  authorize('superadmin', 'admin', 'teacher', 'student'),
  validateObjectId('id'),
  academicController.getProgramById
);

router.put(
  '/programs/:id',
  authenticate,
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  validate(updateProgramSchema),
  academicController.updateProgram
);

router.delete(
  '/programs/:id',
  authenticate,
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  academicController.deleteProgram
);

// ==================== ACADEMIC YEARS ====================
// SuperAdmin and Admin can manage, Teachers/Students can view

router.post(
  '/academic-years',
  authenticate,
  authorize('superadmin', 'admin'),
  apiRateLimiter,
  validate(createAcademicYearSchema),
  academicController.createAcademicYear
);

router.get(
  '/academic-years',
  authenticate,
  authorize('superadmin', 'admin', 'teacher', 'student'),
  campusFilter,
  validatePagination,
  validateSort(['year', 'startDate', 'createdAt']),
  academicController.getAcademicYears
);

router.get(
  '/academic-years/:id',
  authenticate,
  authorize('superadmin', 'admin', 'teacher', 'student'),
  validateObjectId('id'),
  academicController.getAcademicYearById
);

router.put(
  '/academic-years/:id',
  authenticate,
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  validate(updateAcademicYearSchema),
  academicController.updateAcademicYear
);

router.delete(
  '/academic-years/:id',
  authenticate,
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  academicController.deleteAcademicYear
);

// ==================== SEMESTERS ====================
// SuperAdmin and Admin can manage, Teachers/Students can view

router.post(
  '/semesters',
  authenticate,
  authorize('superadmin', 'admin'),
  apiRateLimiter,
  validate(createSemesterSchema),
  academicController.createSemester
);

router.get(
  '/semesters',
  authenticate,
  authorize('superadmin', 'admin', 'teacher', 'student'),
  campusFilter,
  validatePagination,
  validateSort(['name', 'startDate', 'createdAt']),
  academicController.getSemesters
);

router.get(
  '/semesters/:id',
  authenticate,
  authorize('superadmin', 'admin', 'teacher', 'student'),
  validateObjectId('id'),
  academicController.getSemesterById
);

router.put(
  '/semesters/:id',
  authenticate,
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  validate(updateSemesterSchema),
  academicController.updateSemester
);

router.delete(
  '/semesters/:id',
  authenticate,
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  academicController.deleteSemester
);

// ==================== SUBJECTS ====================
// SuperAdmin and Admin can manage, Teachers/Students can view

router.post(
  '/subjects',
  authenticate,
  authorize('superadmin', 'admin'),
  apiRateLimiter,
  validate(createSubjectSchema),
  academicController.createSubject
);

router.get(
  '/subjects',
  authenticate,
  authorize('superadmin', 'admin', 'teacher', 'student'),
  campusFilter,
  validatePagination,
  validateSort(['name', 'code', 'credits', 'createdAt']),
  academicController.getSubjects
);

router.get(
  '/subjects/:id',
  authenticate,
  authorize('superadmin', 'admin', 'teacher', 'student'),
  validateObjectId('id'),
  academicController.getSubjectById
);

router.put(
  '/subjects/:id',
  authenticate,
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  validate(updateSubjectSchema),
  academicController.updateSubject
);

router.delete(
  '/subjects/:id',
  authenticate,
  authorize('superadmin', 'admin'),
  validateObjectId('id'),
  apiRateLimiter,
  academicController.deleteSubject
);

export default router;
