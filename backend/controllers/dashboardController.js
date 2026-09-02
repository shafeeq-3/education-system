import dashboardService from '../services/dashboardService.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

class DashboardController {
  // ==================== ADMIN DASHBOARD ====================
  
  getAdminDashboard = asyncHandler(async (req, res) => {
    const dashboard = await dashboardService.getAdminDashboard(
      req.campusId,
      req.userRole
    );
    
    successResponse(res, 200, 'Admin dashboard retrieved successfully', dashboard);
  });
  
  // ==================== TEACHER DASHBOARD ====================
  
  getTeacherDashboard = asyncHandler(async (req, res) => {
    const dashboard = await dashboardService.getTeacherDashboard(
      req.userId,
      req.campusId
    );
    
    successResponse(res, 200, 'Teacher dashboard retrieved successfully', dashboard);
  });
  
  // ==================== STUDENT DASHBOARD ====================
  
  getStudentDashboard = asyncHandler(async (req, res) => {
    const dashboard = await dashboardService.getStudentDashboard(
      req.userId,
      req.campusId
    );
    
    successResponse(res, 200, 'Student dashboard retrieved successfully', dashboard);
  });
  
  // ==================== ACCOUNTS DASHBOARD ====================
  
  getAccountsDashboard = asyncHandler(async (req, res) => {
    const dashboard = await dashboardService.getAccountsDashboard(
      req.campusId,
      req.userRole
    );
    
    successResponse(res, 200, 'Accounts dashboard retrieved successfully', dashboard);
  });
  
  // ==================== SYSTEM HEALTH ====================
  
  getSystemHealth = asyncHandler(async (req, res) => {
    const health = await dashboardService.getSystemHealth();
    
    successResponse(res, 200, 'System health retrieved successfully', health);
  });
}

export default new DashboardController();
