import analyticsService from '../services/analyticsService.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

class AnalyticsController {
  // ==================== ACADEMIC ANALYTICS ====================
  
  getAttendanceTrends = asyncHandler(async (req, res) => {
    const campusId = req.query.campusId || req.campusId;
    const trends = await analyticsService.getAttendanceTrends(campusId, req.query);
    
    successResponse(res, 200, 'Attendance trends retrieved successfully', trends);
  });
  
  getAttendanceTrendsByClassOrSubject = asyncHandler(async (req, res) => {
    const campusId = req.query.campusId || req.campusId;
    const trends = await analyticsService.getAttendanceTrendsByClassOrSubject(campusId, req.query);
    
    successResponse(res, 200, 'Attendance trends by class/subject retrieved successfully', trends);
  });
  
  getAssignmentSubmissionRates = asyncHandler(async (req, res) => {
    const campusId = req.query.campusId || req.campusId;
    const analytics = await analyticsService.getAssignmentSubmissionRates(campusId, req.query);
    
    successResponse(res, 200, 'Assignment submission rates retrieved successfully', analytics);
  });
  
  getLateSubmissionTrends = asyncHandler(async (req, res) => {
    const campusId = req.query.campusId || req.campusId;
    const trends = await analyticsService.getLateSubmissionTrends(campusId, req.query);
    
    successResponse(res, 200, 'Late submission trends retrieved successfully', trends);
  });
  
  getResultAnalytics = asyncHandler(async (req, res) => {
    const campusId = req.query.campusId || req.campusId;
    const analytics = await analyticsService.getResultAnalytics(campusId, req.query);
    
    successResponse(res, 200, 'Result analytics retrieved successfully', analytics);
  });
  
  getGPATrends = asyncHandler(async (req, res) => {
    const campusId = req.query.campusId || req.campusId;
    const trends = await analyticsService.getGPATrends(campusId, req.query);
    
    successResponse(res, 200, 'GPA trends retrieved successfully', trends);
  });
  
  // ==================== STUDENT ANALYTICS ====================
  
  getAtRiskStudents = asyncHandler(async (req, res) => {
    const campusId = req.query.campusId || req.campusId;
    const students = await analyticsService.getAtRiskStudents(campusId, req.query);
    
    successResponse(res, 200, 'At-risk students retrieved successfully', students);
  });
  
  getProbationTrends = asyncHandler(async (req, res) => {
    const campusId = req.query.campusId || req.campusId;
    const trends = await analyticsService.getProbationTrends(campusId, req.query);
    
    successResponse(res, 200, 'Probation trends retrieved successfully', trends);
  });
  
  getCompletionDropoutAnalytics = asyncHandler(async (req, res) => {
    const campusId = req.query.campusId || req.campusId;
    const analytics = await analyticsService.getCompletionDropoutAnalytics(campusId, req.query);
    
    successResponse(res, 200, 'Completion/dropout analytics retrieved successfully', analytics);
  });
  
  // ==================== TEACHER ANALYTICS ====================
  
  getTeacherClassPerformance = asyncHandler(async (req, res) => {
    const teacherId = req.query.teacherId || req.userId;
    const campusId = req.query.campusId || req.campusId;
    const performance = await analyticsService.getTeacherClassPerformance(teacherId, campusId, req.query);
    
    successResponse(res, 200, 'Teacher class performance retrieved successfully', performance);
  });
  
  getGradingTurnaroundTime = asyncHandler(async (req, res) => {
    const teacherId = req.query.teacherId || req.userId;
    const campusId = req.query.campusId || req.campusId;
    const turnaround = await analyticsService.getGradingTurnaroundTime(teacherId, campusId, req.query);
    
    successResponse(res, 200, 'Grading turnaround time retrieved successfully', turnaround);
  });
  
  getAttendanceMarkingConsistency = asyncHandler(async (req, res) => {
    const teacherId = req.query.teacherId || req.userId;
    const campusId = req.query.campusId || req.campusId;
    const consistency = await analyticsService.getAttendanceMarkingConsistency(teacherId, campusId, req.query);
    
    successResponse(res, 200, 'Attendance marking consistency retrieved successfully', consistency);
  });
  
  // ==================== FINANCIAL ANALYTICS ====================
  
  getFeeCollectionTrends = asyncHandler(async (req, res) => {
    const campusId = req.query.campusId || req.campusId;
    const trends = await analyticsService.getFeeCollectionTrends(campusId, req.query);
    
    successResponse(res, 200, 'Fee collection trends retrieved successfully', trends);
  });
  
  getOutstandingDuesAging = asyncHandler(async (req, res) => {
    const campusId = req.query.campusId || req.campusId;
    const aging = await analyticsService.getOutstandingDuesAging(campusId, req.query);
    
    successResponse(res, 200, 'Outstanding dues aging retrieved successfully', aging);
  });
  
  getSalaryExpenditureTrends = asyncHandler(async (req, res) => {
    const campusId = req.query.campusId || req.campusId;
    const trends = await analyticsService.getSalaryExpenditureTrends(campusId, req.query);
    
    successResponse(res, 200, 'Salary expenditure trends retrieved successfully', trends);
  });
  
  // ==================== ADMIN INSIGHTS ====================
  
  getCampusComparison = asyncHandler(async (req, res) => {
    const campusIds = req.query.campusIds ? req.query.campusIds.split(',') : [req.campusId];
    const comparison = await analyticsService.getCampusComparison(campusIds);
    
    successResponse(res, 200, 'Campus comparison retrieved successfully', comparison);
  });
  
  getAcademicFinancialCorrelation = asyncHandler(async (req, res) => {
    const campusId = req.query.campusId || req.campusId;
    const correlation = await analyticsService.getAcademicFinancialCorrelation(campusId, req.query);
    
    successResponse(res, 200, 'Academic-financial correlation retrieved successfully', correlation);
  });
  
  getYearOverYearComparison = asyncHandler(async (req, res) => {
    const campusId = req.query.campusId || req.campusId;
    const comparison = await analyticsService.getYearOverYearComparison(campusId, req.query);
    
    successResponse(res, 200, 'Year-over-year comparison retrieved successfully', comparison);
  });
}

export default new AnalyticsController();
