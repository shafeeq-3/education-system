import classService from '../services/classService.js';
import { successResponse, paginatedResponse } from '../utils/response.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import logActivity from '../middlewares/activityLogger.js';

class ClassController {
  // ==================== CLASSES ====================
  
  createClass = asyncHandler(async (req, res) => {
    const classDoc = await classService.createClass(req.body, req.userId);
    await logActivity(req, 'create', 'Class', classDoc);
    
    successResponse(res, 201, 'Class created successfully', classDoc);
  });
  
  getClasses = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.search) {
      filters.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { code: { $regex: req.query.search, $options: 'i' } },
        { section: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.campusId) filters.campus = req.query.campusId;
    if (req.query.departmentId) filters.department = req.query.departmentId;
    if (req.query.programId) filters.program = req.query.programId;
    if (req.query.semesterId) filters.semester = req.query.semesterId;
    if (req.query.subjectId) filters.subject = req.query.subjectId;
    if (req.query.teacherId) filters.teacher = req.query.teacherId;
    if (req.query.isActive) filters.isActive = req.query.isActive === 'true';
    if (req.campusFilter) Object.assign(filters, req.campusFilter);
    
    const { classes, total } = await classService.getClasses(
      filters,
      req.pagination,
      req.sort
    );
    
    paginatedResponse(res, 200, classes, { ...req.pagination, total });
  });
  
  getClassById = asyncHandler(async (req, res) => {
    const classDoc = await classService.getClassById(req.params.id);
    successResponse(res, 200, 'Class retrieved successfully', classDoc);
  });
  
  getClassStudents = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const Enrollment = (await import('../models/Enrollment.js')).default;
    const User = (await import('../models/User.js')).default;
    
    // Find all approved enrollments for this class
    const enrollments = await Enrollment.find({
      class: id,
      status: 'approved'
    }).select('student');
    
    const studentIds = enrollments.map(e => e.student);
    
    // Get student details
    const students = await User.find({
      _id: { $in: studentIds },
      role: 'student'
    }).select('email profile');
    
    successResponse(res, 200, 'Class students retrieved successfully', {
      students
    });
  });
  
  updateClass = asyncHandler(async (req, res) => {
    const classDoc = await classService.updateClass(req.params.id, req.body);
    await logActivity(req, 'update', 'Class', classDoc);
    
    successResponse(res, 200, 'Class updated successfully', classDoc);
  });
  
  deleteClass = asyncHandler(async (req, res) => {
    const classDoc = await classService.deleteClass(req.params.id);
    await logActivity(req, 'delete', 'Class', classDoc);
    
    successResponse(res, 200, 'Class deleted successfully');
  });
  
  // ==================== TIMETABLES ====================
  
  createTimetable = asyncHandler(async (req, res) => {
    const timetable = await classService.createTimetable(req.body, req.userId);
    await logActivity(req, 'create', 'Timetable', timetable);
    
    successResponse(res, 201, 'Timetable created successfully', timetable);
  });
  
  getTimetables = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.campusId) filters.campus = req.query.campusId;
    if (req.query.classId) filters.class = req.query.classId;
    if (req.query.teacherId) filters.teacher = req.query.teacherId;
    if (req.query.subjectId) filters.subject = req.query.subjectId;
    if (req.query.semesterId) filters.semester = req.query.semesterId;
    if (req.query.dayOfWeek) filters.dayOfWeek = req.query.dayOfWeek;
    if (req.query.room) filters.room = { $regex: req.query.room, $options: 'i' };
    if (req.query.type) filters.type = req.query.type;
    if (req.query.isActive) filters.isActive = req.query.isActive === 'true';
    if (req.campusFilter) Object.assign(filters, req.campusFilter);
    
    const { timetables, total } = await classService.getTimetables(
      filters,
      req.pagination,
      req.sort
    );
    
    paginatedResponse(res, 200, timetables, { ...req.pagination, total });
  });
  
  getTimetableById = asyncHandler(async (req, res) => {
    const timetable = await classService.getTimetableById(req.params.id);
    successResponse(res, 200, 'Timetable retrieved successfully', timetable);
  });
  
  updateTimetable = asyncHandler(async (req, res) => {
    const timetable = await classService.updateTimetable(req.params.id, req.body);
    await logActivity(req, 'update', 'Timetable', timetable);
    
    successResponse(res, 200, 'Timetable updated successfully', timetable);
  });
  
  deleteTimetable = asyncHandler(async (req, res) => {
    const timetable = await classService.deleteTimetable(req.params.id);
    await logActivity(req, 'delete', 'Timetable', timetable);
    
    successResponse(res, 200, 'Timetable deleted successfully');
  });
  
  // ==================== ENROLLMENTS ====================
  
  getStudentEnrollments = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    
    // Students can only view their own enrollments
    // Convert both to strings for comparison
    if (req.user.role === 'student' && req.userId.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        error: { message: 'You can only view your own enrollments' }
      });
    }
    
    const filters = { student: studentId };
    if (req.query.status) filters.status = req.query.status;
    if (req.query.semesterId) filters.semester = req.query.semesterId;
    if (req.query.academicYearId) filters.academicYear = req.query.academicYearId;
    
    const { enrollments, total } = await classService.getEnrollments(
      filters,
      req.pagination || { page: 1, limit: 100 },
      req.sort || { enrolledAt: -1 }
    );
    
    paginatedResponse(res, 200, enrollments, { 
      page: req.pagination?.page || 1, 
      limit: req.pagination?.limit || 100, 
      total 
    });
  });
  
  createEnrollment = asyncHandler(async (req, res) => {
    const enrollment = await classService.createEnrollment(req.body, req.userId);
    await logActivity(req, 'create', 'Enrollment', enrollment);
    
    successResponse(res, 201, 'Enrollment created successfully', enrollment);
  });
  
  getEnrollments = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.campusId) filters.campus = req.query.campusId;
    if (req.query.studentId) filters.student = req.query.studentId;
    if (req.query.classId) filters.class = req.query.classId;
    if (req.query.subjectId) filters.subject = req.query.subjectId;
    if (req.query.semesterId) filters.semester = req.query.semesterId;
    if (req.query.academicYearId) filters.academicYear = req.query.academicYearId;
    if (req.query.status) filters.status = req.query.status;
    if (req.campusFilter) Object.assign(filters, req.campusFilter);
    
    const { enrollments, total } = await classService.getEnrollments(
      filters,
      req.pagination,
      req.sort
    );
    
    paginatedResponse(res, 200, enrollments, { ...req.pagination, total });
  });
  
  getEnrollmentById = asyncHandler(async (req, res) => {
    const enrollment = await classService.getEnrollmentById(req.params.id);
    successResponse(res, 200, 'Enrollment retrieved successfully', enrollment);
  });
  
  updateEnrollment = asyncHandler(async (req, res) => {
    const enrollment = await classService.updateEnrollment(req.params.id, req.body);
    await logActivity(req, 'update', 'Enrollment', enrollment);
    
    successResponse(res, 200, 'Enrollment updated successfully', enrollment);
  });
  
  approveEnrollment = asyncHandler(async (req, res) => {
    const enrollment = await classService.approveEnrollment(req.params.id, req.userId);
    await logActivity(req, 'approve', 'Enrollment', enrollment);
    
    successResponse(res, 200, 'Enrollment approved successfully', enrollment);
  });
  
  rejectEnrollment = asyncHandler(async (req, res) => {
    const enrollment = await classService.rejectEnrollment(
      req.params.id,
      req.userId,
      req.body.reason
    );
    await logActivity(req, 'reject', 'Enrollment', enrollment);
    
    successResponse(res, 200, 'Enrollment rejected successfully', enrollment);
  });
  
  deleteEnrollment = asyncHandler(async (req, res) => {
    const enrollment = await classService.deleteEnrollment(req.params.id);
    await logActivity(req, 'delete', 'Enrollment', enrollment);
    
    successResponse(res, 200, 'Enrollment deleted successfully');
  });
}

export default new ClassController();
