import { z } from 'zod';

// Related entity schema
const relatedEntitySchema = z.object({
  entityType: z.enum([
    'Assignment', 'Submission', 'Attendance', 'Enrollment',
    'Marksheet', 'StudentFee', 'SalaryPayment', 'Class',
    'Timetable', 'User', 'System'
  ]).optional(),
  entityId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid entity ID').optional()
}).optional();

// Create notification schema
export const createNotificationSchema = z.object({
  campusId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid campus ID'),
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message cannot exceed 1000 characters'),
  type: z.enum(['academic', 'financial', 'system', 'announcement']),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  targetRoles: z.array(z.enum(['superadmin', 'admin', 'teacher', 'student', 'accounts'])).optional(),
  targetUsers: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
  relatedEntity: relatedEntitySchema,
  actionLink: z.string().optional(),
  scheduledFor: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional()
});

// Create announcement schema
export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message cannot exceed 1000 characters'),
  targetRoles: z.array(z.enum(['superadmin', 'admin', 'teacher', 'student', 'accounts'])).min(1, 'At least one target role is required'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional()
});

// Bulk delete schema
export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).min(1, 'At least one notification ID is required')
});
