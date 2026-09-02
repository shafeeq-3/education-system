import express from 'express';
import User from '../models/User.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validatePagination, validateObjectId } from '../middlewares/validate.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Get all users (Admin/SuperAdmin only)
router.get('/users', authorize('superadmin', 'admin'), validatePagination, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    // Search by name, email, or username
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Filter by status
    if (status === 'approved') {
      query.isApproved = true;
      query.isBlocked = false;
    } else if (status === 'pending') {
      query.isApproved = false;
    } else if (status === 'blocked') {
      query.isBlocked = true;
    }

    // Campus filter for non-superadmin
    if (req.user.role !== 'superadmin' && req.user.campus) {
      query.campus = req.user.campus;
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .populate('campus', 'name code')
        .populate('department', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        items: users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get('/users/:id', authorize('superadmin', 'admin'), validateObjectId('id'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('campus', 'name code')
      .populate('department', 'name code');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// Update user
router.put('/users/:id', authorize('superadmin', 'admin'), validateObjectId('id'), async (req, res, next) => {
  try {
    const { email, profile, departmentId } = req.body;

    const updateData = {};
    if (email) updateData.email = email;
    if (profile) updateData.profile = profile;
    if (departmentId) updateData.department = departmentId;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// Delete user
router.delete('/users/:id', authorize('superadmin', 'admin'), validateObjectId('id'), async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Approve user
router.patch('/users/:id/approve', authorize('superadmin', 'admin'), validateObjectId('id'), async (req, res, next) => {
  try {
    const { isApproved } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        isApproved,
        approvedBy: req.user.id,
        approvedAt: isApproved ? new Date() : null
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    res.json({
      success: true,
      message: `User ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// Block/Unblock user
router.patch('/users/:id/block', authorize('superadmin', 'admin'), validateObjectId('id'), async (req, res, next) => {
  try {
    const { isBlocked, reason } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    res.json({
      success: true,
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// Get pending approvals
router.get('/users/pending/approvals', authorize('superadmin', 'admin'), async (req, res, next) => {
  try {
    const query = { isApproved: false };

    // Campus filter for non-superadmin
    if (req.user.role !== 'superadmin' && req.user.campus) {
      query.campus = req.user.campus;
    }

    const users = await User.find(query)
      .select('-password')
      .populate('campus', 'name code')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { items: users }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
