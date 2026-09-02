import express from 'express';
import dashboardController from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// ==================== ROLE-BASED DASHBOARDS ====================

// Admin Dashboard
router.get(
  '/dashboard/admin',
  authorize('superadmin', 'admin'),
  dashboardController.getAdminDashboard
);

// Teacher Dashboard
router.get(
  '/dashboard/teacher',
  authorize('teacher'),
  dashboardController.getTeacherDashboard
);

// Student Dashboard
router.get(
  '/dashboard/student',
  authorize('student'),
  dashboardController.getStudentDashboard
);

// Accounts Dashboard
router.get(
  '/dashboard/accounts',
  authorize('superadmin', 'admin', 'accounts'),
  dashboardController.getAccountsDashboard
);

// System Health (Admin only)
router.get(
  '/dashboard/system-health',
  authorize('superadmin', 'admin'),
  dashboardController.getSystemHealth
);

export default router;
