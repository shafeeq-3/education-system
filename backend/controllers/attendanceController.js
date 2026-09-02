import attendanceService from '../services/attendanceService.js';
import { successResponse, paginatedResponse } from '../utils/response.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import logActivity from '../middlewares/activityLogger.js';

class AttendanceController {
  // ==================== ATTENDANCE ====================
  
  getStudentAttendance = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    
    // Students can only view their own attendance
    if (req.user.role === 'student' && req.userId.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        error: { message: 'You can only view your own attendance' }
      });
    }
    
    const filters = { student: studentId };
    if (req.query.classId) filters.class = req.query.classId;
    if (req.query.subjectId) filters.subject = req.query.subjectId;
    if (req.query.semesterId) filters.semester = req.query.semesterId;
    
    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filters.date = {};
      if (req.query.startDate) filters.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filters.date.$lte = new Date(req.query.endDate);
    }
    
    const { attendances, total } = await attendanceService.getAttendances(
      filters,
      req.pagination || { page: 1, limit: 100 },
      req.sort || { date: -1 }
    );
    
    // Calculate attendance statistics
    const totalClasses = attendances.length;
    const presentCount = attendances.filter(a => a.status === 'present').length;
    const absentCount = attendances.filter(a => a.status === 'absent').length;
    const lateCount = attendances.filter(a => a.status === 'late').length;
    const attendancePercentage = totalClasses > 0 ? (presentCount / totalClasses) * 100 : 0;
    
    paginatedResponse(res, 200, attendances, { 
      page: req.pagination?.page || 1, 
      limit: req.pagination?.limit || 100, 
      total,
      statistics: {
        totalClasses,
        presentCount,
        absentCount,
        lateCount,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100
      }
    });
  });
  
  createAttendance = asyncHandler(async (req, res) => {
    const attendance = await attendanceService.createAttendance(req.body, req.userId);
    await logActivity(req, 'create', 'Attendance', attendance);
    
    successResponse(res, 201, 'Attendance created successfully', attendance);
  });
  
  bulkCreateAttendance = asyncHandler(async (req, res) => {
    const { records } = req.body;
    
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Records array is required' }
      });
    }
    
    const Attendance = (await import('../models/Attendance.js')).default;
    const Class = (await import('../models/Class.js')).default;
    const Enrollment = (await import('../models/Enrollment.js')).default;
    
    // Get class details for the first record to populate common fields
    const classData = await Class.findById(records[0].classId)
      .populate('subjectId')
      .populate('semesterId');
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        error: { message: 'Class not found' }
      });
    }
    
    // Delete existing attendance for this class and date
    await Attendance.deleteMany({
      class: records[0].classId,
      date: new Date(records[0].date)
    });
    
    // Create attendance records with enrollment lookup
    const attendanceRecords = await Promise.all(
      records.map(async (record) => {
        // Find enrollment for this student in this class
        const enrollment = await Enrollment.findOne({
          student: record.studentId,
          class: record.classId,
          status: 'approved'
        });
        
        return {
          student: record.studentId,
          class: record.classId,
          subject: classData.subjectId._id,
          semester: classData.semesterId._id,
          enrollment: enrollment?._id,
          date: new Date(record.date),
          status: record.status || 'absent',
          markedBy: record.markedBy || req.userId,
          remarks: record.remarks
        };
      })
    );
    
    const createdAttendances = await Attendance.insertMany(attendanceRecords);
    
    successResponse(res, 201, 'Bulk attendance created successfully', {
      count: createdAttendances.length,
      attendances: createdAttendances
    });
  });
  
  getAttendances = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.campusId) filters.campus = req.query.campusId;
    if (req.query.classId) filters.class = req.query.classId;
    if (req.query.subjectId) filters.subject = req.query.subjectId;
    if (req.query.semesterId) filters.semester = req.query.semesterId;
    if (req.query.teacherId) filters.teacher = req.query.teacherId;
    if (req.query.date) filters.date = new Date(req.query.date);
    if (req.query.isLocked) filters.isLocked = req.query.isLocked === 'true';
    if (req.campusFilter) Object.assign(filters, req.campusFilter);
    
    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filters.date = {};
      if (req.query.startDate) filters.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filters.date.$lte = new Date(req.query.endDate);
    }
    
    const { attendances, total } = await attendanceService.getAttendances(
      filters,
      req.pagination,
      req.sort
    );
    
    paginatedResponse(res, 200, attendances, { ...req.pagination, total });
  });
  
  getAttendanceById = asyncHandler(async (req, res) => {
    const attendance = await attendanceService.getAttendanceById(req.params.id);
    successResponse(res, 200, 'Attendance retrieved successfully', attendance);
  });
  
  updateAttendance = asyncHandler(async (req, res) => {
    const attendance = await attendanceService.updateAttendance(
      req.params.id,
      req.body,
      req.userId
    );
    await logActivity(req, 'update', 'Attendance', attendance);
    
    successResponse(res, 200, 'Attendance updated successfully', attendance);
  });
  
  markAttendance = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { studentId, status, remarks } = req.body;
    
    const attendance = await attendanceService.markAttendance(
      id,
      studentId,
      status,
      remarks,
      req.userId
    );
    await logActivity(req, 'mark', 'Attendance', attendance);
    
    successResponse(res, 200, 'Attendance marked successfully', attendance);
  });
  
  lockAttendance = asyncHandler(async (req, res) => {
    const attendance = await attendanceService.lockAttendance(req.params.id, req.userId);
    await logActivity(req, 'lock', 'Attendance', attendance);
    
    successResponse(res, 200, 'Attendance locked successfully', attendance);
  });
  
  unlockAttendance = asyncHandler(async (req, res) => {
    const attendance = await attendanceService.unlockAttendance(req.params.id);
    await logActivity(req, 'unlock', 'Attendance', attendance);
    
    successResponse(res, 200, 'Attendance unlocked successfully', attendance);
  });
  
  deleteAttendance = asyncHandler(async (req, res) => {
    const attendance = await attendanceService.deleteAttendance(req.params.id);
    await logActivity(req, 'delete', 'Attendance', attendance);
    
    successResponse(res, 200, 'Attendance deleted successfully');
  });
  
  // ==================== REPORTS ====================
  
  getStudentAttendanceReport = asyncHandler(async (req, res) => {
    const { studentId, classId } = req.params;
    const { startDate, endDate } = req.query;
    
    const report = await attendanceService.getStudentAttendanceReport(
      studentId,
      classId,
      startDate,
      endDate
    );
    
    successResponse(res, 200, 'Student attendance report retrieved successfully', report);
  });
  
  getClassAttendanceReport = asyncHandler(async (req, res) => {
    const { classId } = req.params;
    const { date } = req.query;
    
    if (!date) {
      throw new ValidationError('Date is required for class attendance report');
    }
    
    const report = await attendanceService.getClassAttendanceReport(classId, new Date(date));
    
    successResponse(res, 200, 'Class attendance report retrieved successfully', report);
  });
}

export default new AttendanceController();
