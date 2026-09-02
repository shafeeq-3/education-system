import assignmentService from '../services/assignmentService.js';
import { successResponse, paginatedResponse } from '../utils/response.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { ValidationError } from '../utils/errors.js';
import logActivity from '../middlewares/activityLogger.js';

class AssignmentController {
  // ==================== ASSIGNMENTS ====================
  
  getTeacherAssignments = asyncHandler(async (req, res) => {
    const { teacherId } = req.params;
    
    // Authorization: Teachers can only view their own assignments
    if (req.userRole === 'teacher' && req.userId.toString() !== teacherId) {
      throw new ValidationError('You can only view your own assignments');
    }
    
    const filters = { createdBy: teacherId };
    if (req.campusFilter) Object.assign(filters, req.campusFilter);
    
    const { assignments, total } = await assignmentService.getAssignments(
      filters,
      { skip: 0, limit: 1000 },
      { createdAt: -1 }
    );
    
    successResponse(res, 200, 'Teacher assignments retrieved successfully', {
      items: assignments,
      total
    });
  });
  
  getStudentAssignments = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    
    // Students can only view their own assignments
    if (req.user.role === 'student' && req.userId.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        error: { message: 'You can only view your own assignments' }
      });
    }
    
    // Get student's enrollments to find their classes
    const Enrollment = (await import('../models/Enrollment.js')).default;
    const enrollments = await Enrollment.find({ 
      student: studentId,
      status: 'active'
    }).select('class');
    
    const classIds = enrollments.map(e => e.class);
    
    const filters = { 
      class: { $in: classIds },
      isVisible: true
    };
    
    const { assignments, total } = await assignmentService.getAssignments(
      filters,
      req.pagination || { page: 1, limit: 100 },
      req.sort || { dueDate: 1 }
    );
    
    // Get submission status for each assignment
    const Submission = (await import('../models/Submission.js')).default;
    const assignmentsWithStatus = await Promise.all(
      assignments.map(async (assignment) => {
        const submission = await Submission.findOne({
          assignment: assignment._id,
          student: studentId
        });
        
        return {
          ...assignment.toObject(),
          submissionStatus: submission ? {
            submitted: true,
            status: submission.status,
            submittedAt: submission.submittedAt,
            obtainedMarks: submission.obtainedMarks
          } : {
            submitted: false
          }
        };
      })
    );
    
    paginatedResponse(res, 200, assignmentsWithStatus, { 
      page: req.pagination?.page || 1, 
      limit: req.pagination?.limit || 100, 
      total 
    });
  });
  
  createAssignment = asyncHandler(async (req, res) => {
    const assignment = await assignmentService.createAssignment(req.body, req.userId);
    await logActivity(req, 'create', 'Assignment', assignment);
    
    successResponse(res, 201, 'Assignment created successfully', assignment);
  });
  
  getAssignments = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.search) {
      filters.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.campusId) filters.campus = req.query.campusId;
    if (req.query.classId) filters.class = req.query.classId;
    if (req.query.subjectId) filters.subject = req.query.subjectId;
    if (req.query.teacherId) filters.teacher = req.query.teacherId;
    if (req.query.semesterId) filters.semester = req.query.semesterId;
    if (req.query.type) filters.type = req.query.type;
    if (req.query.isVisible) filters.isVisible = req.query.isVisible === 'true';
    if (req.query.isActive) filters.isActive = req.query.isActive === 'true';
    if (req.campusFilter) Object.assign(filters, req.campusFilter);
    
    const { assignments, total } = await assignmentService.getAssignments(
      filters,
      req.pagination,
      req.sort
    );
    
    paginatedResponse(res, 200, assignments, { ...req.pagination, total });
  });
  
  getAssignmentById = asyncHandler(async (req, res) => {
    const assignment = await assignmentService.getAssignmentById(req.params.id);
    successResponse(res, 200, 'Assignment retrieved successfully', assignment);
  });
  
  updateAssignment = asyncHandler(async (req, res) => {
    req.body.updatedBy = req.userId;
    const assignment = await assignmentService.updateAssignment(req.params.id, req.body);
    await logActivity(req, 'update', 'Assignment', assignment);
    
    successResponse(res, 200, 'Assignment updated successfully', assignment);
  });
  
  deleteAssignment = asyncHandler(async (req, res) => {
    const assignment = await assignmentService.deleteAssignment(req.params.id);
    await logActivity(req, 'delete', 'Assignment', assignment);
    
    successResponse(res, 200, 'Assignment deleted successfully');
  });
  
  // ==================== SUBMISSIONS ====================
  
  getAssignmentSubmissions = asyncHandler(async (req, res) => {
    const { assignmentId } = req.params;
    
    const filters = { assignment: assignmentId };
    if (req.campusFilter) Object.assign(filters, req.campusFilter);
    
    const { submissions, total } = await assignmentService.getSubmissions(
      filters,
      { page: 1, limit: 1000 },
      { submittedAt: -1 }
    );
    
    successResponse(res, 200, 'Assignment submissions retrieved successfully', {
      items: submissions,
      total
    });
  });
  
  createSubmission = asyncHandler(async (req, res) => {
    const submission = await assignmentService.createSubmission(req.body, req.userId);
    await logActivity(req, 'create', 'Submission', submission);
    
    successResponse(res, 201, 'Submission created successfully', submission);
  });
  
  getSubmissions = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.campusId) filters.campus = req.query.campusId;
    if (req.query.assignmentId) filters.assignment = req.query.assignmentId;
    if (req.query.studentId) filters.student = req.query.studentId;
    if (req.query.classId) filters.class = req.query.classId;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.isLateSubmission) filters.isLateSubmission = req.query.isLateSubmission === 'true';
    if (req.campusFilter) Object.assign(filters, req.campusFilter);
    
    const { submissions, total } = await assignmentService.getSubmissions(
      filters,
      req.pagination,
      req.sort
    );
    
    paginatedResponse(res, 200, submissions, { ...req.pagination, total });
  });
  
  getSubmissionById = asyncHandler(async (req, res) => {
    const submission = await assignmentService.getSubmissionById(req.params.id);
    successResponse(res, 200, 'Submission retrieved successfully', submission);
  });
  
  gradeSubmission = asyncHandler(async (req, res) => {
    const submission = await assignmentService.gradeSubmission(
      req.params.id,
      req.body,
      req.userId
    );
    await logActivity(req, 'grade', 'Submission', submission);
    
    successResponse(res, 200, 'Submission graded successfully', submission);
  });
  
  deleteSubmission = asyncHandler(async (req, res) => {
    const submission = await assignmentService.deleteSubmission(req.params.id);
    await logActivity(req, 'delete', 'Submission', submission);
    
    successResponse(res, 200, 'Submission deleted successfully');
  });
  
  // ==================== ELIGIBILITY ====================
  
  calculateEligibility = asyncHandler(async (req, res) => {
    const { enrollmentId } = req.params;
    const { minAttendance, minAssignmentCompletion } = req.query;
    
    const eligibility = await assignmentService.calculateEligibility(
      enrollmentId,
      minAttendance ? parseInt(minAttendance) : 75,
      minAssignmentCompletion ? parseInt(minAssignmentCompletion) : 70
    );
    
    successResponse(res, 200, 'Eligibility calculated successfully', eligibility);
  });
  
  getStudentEligibility = asyncHandler(async (req, res) => {
    const { studentId, semesterId } = req.params;
    
    const eligibility = await assignmentService.getStudentEligibilityStatus(
      studentId,
      semesterId
    );
    
    successResponse(res, 200, 'Student eligibility retrieved successfully', eligibility);
  });
}

export default new AssignmentController();
