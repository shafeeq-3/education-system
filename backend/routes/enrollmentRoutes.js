import express from 'express';
import Enrollment from '../models/Enrollment.js';
import Class from '../models/Class.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validateObjectId, validatePagination } from '../middlewares/validate.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Get enrollments for a student
router.get('/enrollments/student/:studentId', validateObjectId('studentId'), async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Check authorization - students can only view their own enrollments
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({
        success: false,
        error: { message: 'Forbidden' }
      });
    }

    const enrollments = await Enrollment.find({ studentId })
      .populate({
        path: 'semesterId',
        select: 'name startDate endDate isCurrent',
        populate: {
          path: 'academicYearId',
          select: 'year'
        }
      })
      .populate('subjectIds', 'name code credits')
      .sort({ createdAt: -1 });

    // Get classes for each enrollment
    const enrollmentsWithClasses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const classes = await Class.find({
          semesterId: enrollment.semesterId,
          subjectId: { $in: enrollment.subjectIds }
        })
          .populate('subjectId', 'name code credits')
          .populate('teacherId', 'profile.firstName profile.lastName email')
          .populate('semesterId', 'name');

        return {
          ...enrollment.toObject(),
          classes
        };
      })
    );

    res.json({
      success: true,
      data: {
        items: enrollmentsWithClasses
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all enrollments (Admin only)
router.get('/enrollments', authorize('superadmin', 'admin'), validatePagination, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, semesterId, status } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (semesterId) query.semesterId = semesterId;
    if (status) query.status = status;

    const [enrollments, total] = await Promise.all([
      Enrollment.find(query)
        .populate('studentId', 'profile.firstName profile.lastName email')
        .populate('semesterId', 'name')
        .populate('subjectIds', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Enrollment.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        items: enrollments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create enrollment (Admin only)
router.post('/enrollments', authorize('superadmin', 'admin'), async (req, res, next) => {
  try {
    const { studentId, semesterId, subjectIds } = req.body;

    // Check if enrollment already exists
    const existingEnrollment = await Enrollment.findOne({
      studentId,
      semesterId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        error: { message: 'Student already enrolled in this semester' }
      });
    }

    const enrollment = await Enrollment.create({
      studentId,
      semesterId,
      subjectIds,
      enrollmentDate: new Date(),
      status: 'active'
    });

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('studentId', 'profile.firstName profile.lastName email')
      .populate('semesterId', 'name')
      .populate('subjectIds', 'name code');

    res.status(201).json({
      success: true,
      message: 'Enrollment created successfully',
      data: populatedEnrollment
    });
  } catch (error) {
    next(error);
  }
});

// Update enrollment (Admin only)
router.put('/enrollments/:id', authorize('superadmin', 'admin'), validateObjectId('id'), async (req, res, next) => {
  try {
    const { subjectIds, status } = req.body;

    const updateData = {};
    if (subjectIds) updateData.subjectIds = subjectIds;
    if (status) updateData.status = status;

    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('studentId', 'profile.firstName profile.lastName email')
      .populate('semesterId', 'name')
      .populate('subjectIds', 'name code');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: { message: 'Enrollment not found' }
      });
    }

    res.json({
      success: true,
      message: 'Enrollment updated successfully',
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
});

// Delete enrollment (Admin only)
router.delete('/enrollments/:id', authorize('superadmin', 'admin'), validateObjectId('id'), async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: { message: 'Enrollment not found' }
      });
    }

    res.json({
      success: true,
      message: 'Enrollment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
