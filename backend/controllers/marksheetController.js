import marksheetService from '../services/marksheetService.js';
import { successResponse, paginatedResponse } from '../utils/response.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { ValidationError } from '../utils/errors.js';
import logActivity from '../middlewares/activityLogger.js';

class MarksheetController {
  // ==================== MARKSHEETS ====================
  
  generateMarksheet = asyncHandler(async (req, res) => {
    const { enrollmentId, examMarks } = req.body;
    
    const marksheet = await marksheetService.generateMarksheet(
      enrollmentId,
      examMarks,
      req.userId
    );
    await logActivity(req, 'generate', 'Marksheet', marksheet);
    
    successResponse(res, 201, 'Marksheet generated successfully', marksheet);
  });
  
  getMarksheets = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.campusId) filters.campus = req.query.campusId;
    if (req.query.studentId) filters.student = req.query.studentId;
    if (req.query.classId) filters.class = req.query.classId;
    if (req.query.subjectId) filters.subject = req.query.subjectId;
    if (req.query.semesterId) filters.semester = req.query.semesterId;
    if (req.query.academicYearId) filters.academicYear = req.query.academicYearId;
    if (req.query.isLocked) filters.isLocked = req.query.isLocked === 'true';
    if (req.query.isFinalized) filters.isFinalized = req.query.isFinalized === 'true';
    if (req.query.isPassed) filters.isPassed = req.query.isPassed === 'true';
    if (req.campusFilter) Object.assign(filters, req.campusFilter);
    
    const { marksheets, total } = await marksheetService.getMarksheets(
      filters,
      req.pagination,
      req.sort
    );
    
    paginatedResponse(res, 200, marksheets, { ...req.pagination, total });
  });
  
  getMarksheetById = asyncHandler(async (req, res) => {
    const marksheet = await marksheetService.getMarksheetById(req.params.id);
    successResponse(res, 200, 'Marksheet retrieved successfully', marksheet);
  });
  
  updateMarksheet = asyncHandler(async (req, res) => {
    const marksheet = await marksheetService.updateMarksheet(
      req.params.id,
      req.body,
      req.userId
    );
    await logActivity(req, 'update', 'Marksheet', marksheet);
    
    successResponse(res, 200, 'Marksheet updated successfully', marksheet);
  });
  
  lockMarksheet = asyncHandler(async (req, res) => {
    const marksheet = await marksheetService.lockMarksheet(req.params.id, req.userId);
    await logActivity(req, 'lock', 'Marksheet', marksheet);
    
    successResponse(res, 200, 'Marksheet locked successfully', marksheet);
  });
  
  unlockMarksheet = asyncHandler(async (req, res) => {
    const marksheet = await marksheetService.unlockMarksheet(req.params.id);
    await logActivity(req, 'unlock', 'Marksheet', marksheet);
    
    successResponse(res, 200, 'Marksheet unlocked successfully', marksheet);
  });
  
  finalizeMarksheet = asyncHandler(async (req, res) => {
    const marksheet = await marksheetService.finalizeMarksheet(req.params.id, req.userId);
    await logActivity(req, 'finalize', 'Marksheet', marksheet);
    
    successResponse(res, 200, 'Marksheet finalized successfully', marksheet);
  });
  
  deleteMarksheet = asyncHandler(async (req, res) => {
    const marksheet = await marksheetService.deleteMarksheet(req.params.id);
    await logActivity(req, 'delete', 'Marksheet', marksheet);
    
    successResponse(res, 200, 'Marksheet deleted successfully');
  });
  
  getStudentMarksheets = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    
    // Authorization: Students can only view their own marksheets
    if (req.userRole === 'student' && req.userId.toString() !== studentId) {
      throw new ValidationError('You can only view your own marksheets');
    }
    
    const filters = { student: studentId, isFinalized: true };
    if (req.campusFilter) Object.assign(filters, req.campusFilter);
    
    const { marksheets, total } = await marksheetService.getMarksheets(
      filters,
      { skip: 0, limit: 1000 },
      { createdAt: -1 }
    );
    
    // Calculate statistics
    const totalSubjects = marksheets.length;
    const passedSubjects = marksheets.filter(m => m.isPassed).length;
    const failedSubjects = totalSubjects - passedSubjects;
    const averagePercentage = totalSubjects > 0
      ? marksheets.reduce((sum, m) => sum + m.percentage, 0) / totalSubjects
      : 0;
    
    const stats = {
      totalSubjects,
      passedSubjects,
      failedSubjects,
      averagePercentage: Math.round(averagePercentage * 100) / 100
    };
    
    successResponse(res, 200, 'Student marksheets retrieved successfully', {
      items: marksheets,
      stats,
      total
    });
  });
  
  // ==================== TRANSCRIPTS ====================
  
  generateTranscript = asyncHandler(async (req, res) => {
    const { studentId, programId, academicYearId } = req.body;
    
    const transcript = await marksheetService.generateTranscript(
      studentId,
      programId,
      academicYearId,
      req.userId
    );
    await logActivity(req, 'generate', 'Transcript', transcript);
    
    successResponse(res, 201, 'Transcript generated successfully', transcript);
  });
  
  updateTranscript = asyncHandler(async (req, res) => {
    const transcript = await marksheetService.updateTranscript(req.params.id, req.userId);
    await logActivity(req, 'update', 'Transcript', transcript);
    
    successResponse(res, 200, 'Transcript updated successfully', transcript);
  });
  
  getTranscripts = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.campusId) filters.campus = req.query.campusId;
    if (req.query.studentId) filters.student = req.query.studentId;
    if (req.query.programId) filters.program = req.query.programId;
    if (req.query.academicYearId) filters.academicYear = req.query.academicYearId;
    if (req.query.academicStatus) filters.academicStatus = req.query.academicStatus;
    if (req.query.isLocked) filters.isLocked = req.query.isLocked === 'true';
    if (req.query.isCompleted) filters.isCompleted = req.query.isCompleted === 'true';
    if (req.campusFilter) Object.assign(filters, req.campusFilter);
    
    const { transcripts, total } = await marksheetService.getTranscripts(
      filters,
      req.pagination,
      req.sort
    );
    
    paginatedResponse(res, 200, transcripts, { ...req.pagination, total });
  });
  
  getTranscriptById = asyncHandler(async (req, res) => {
    const transcript = await marksheetService.getTranscriptById(req.params.id);
    successResponse(res, 200, 'Transcript retrieved successfully', transcript);
  });
  
  lockTranscript = asyncHandler(async (req, res) => {
    const transcript = await marksheetService.lockTranscript(req.params.id, req.userId);
    await logActivity(req, 'lock', 'Transcript', transcript);
    
    successResponse(res, 200, 'Transcript locked successfully', transcript);
  });
  
  unlockTranscript = asyncHandler(async (req, res) => {
    const transcript = await marksheetService.unlockTranscript(req.params.id);
    await logActivity(req, 'unlock', 'Transcript', transcript);
    
    successResponse(res, 200, 'Transcript unlocked successfully', transcript);
  });
  
  deleteTranscript = asyncHandler(async (req, res) => {
    const transcript = await marksheetService.deleteTranscript(req.params.id);
    await logActivity(req, 'delete', 'Transcript', transcript);
    
    successResponse(res, 200, 'Transcript deleted successfully');
  });
  
  getStudentTranscript = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    
    // Authorization: Students can only view their own transcript
    if (req.userRole === 'student' && req.userId.toString() !== studentId) {
      throw new ValidationError('You can only view your own transcript');
    }
    
    const filters = { student: studentId };
    if (req.campusFilter) Object.assign(filters, req.campusFilter);
    
    const { transcripts } = await marksheetService.getTranscripts(
      filters,
      { skip: 0, limit: 1 },
      { createdAt: -1 }
    );
    
    const transcript = transcripts.length > 0 ? transcripts[0] : null;
    
    if (!transcript) {
      successResponse(res, 200, 'No transcript found for student', null);
      return;
    }
    
    successResponse(res, 200, 'Student transcript retrieved successfully', transcript);
  });
}

export default new MarksheetController();
