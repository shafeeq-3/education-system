import User from '../models/User.js';
import Class from '../models/Class.js';
import Enrollment from '../models/Enrollment.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Attendance from '../models/Attendance.js';
import Marksheet from '../models/Marksheet.js';
import Transcript from '../models/Transcript.js';
import ActivityLog from '../models/ActivityLog.js';
import { NotFoundError } from '../utils/errors.js';

class DashboardService {
  // ==================== ADMIN DASHBOARD ====================
  
  async getAdminDashboard(campusId, userRole) {
    const filters = userRole === 'superadmin' ? {} : { campus: campusId };
    
    // KPIs - Total counts
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      pendingEnrollments,
      pendingSubmissions,
      pendingMarksheets,
      studentsOnProbation
    ] = await Promise.all([
      User.countDocuments({ ...filters, role: 'student', isApproved: true, deletedAt: null }),
      User.countDocuments({ ...filters, role: 'teacher', isApproved: true, deletedAt: null }),
      Class.countDocuments({ ...filters, deletedAt: null }),
      Enrollment.countDocuments({ ...filters, status: 'pending', deletedAt: null }),
      Submission.countDocuments({ ...filters, status: 'submitted', deletedAt: null }),
      Marksheet.countDocuments({ ...filters, isFinalized: false, deletedAt: null }),
      Transcript.countDocuments({ ...filters, isProbation: true, deletedAt: null })
    ]);
    
    // Pass/Fail statistics
    const passFailStats = await Marksheet.aggregate([
      { $match: { ...filters, isFinalized: true, deletedAt: null } },
      {
        $group: {
          _id: '$isPassed',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const passedCount = passFailStats.find(s => s._id === true)?.count || 0;
    const failedCount = passFailStats.find(s => s._id === false)?.count || 0;
    const totalFinalized = passedCount + failedCount;
    const passPercentage = totalFinalized > 0 ? Math.round((passedCount / totalFinalized) * 100) : 0;
    
    // Attendance compliance
    const attendanceStats = await Enrollment.aggregate([
      { $match: { ...filters, status: 'approved', deletedAt: null } },
      {
        $group: {
          _id: null,
          avgAttendance: { $avg: '$attendancePercentage' },
          totalEnrollments: { $sum: 1 },
          compliantCount: {
            $sum: { $cond: [{ $gte: ['$attendancePercentage', 75] }, 1, 0] }
          }
        }
      }
    ]);
    
    const attendanceData = attendanceStats[0] || { avgAttendance: 0, totalEnrollments: 0, compliantCount: 0 };
    const attendanceCompliance = attendanceData.totalEnrollments > 0
      ? Math.round((attendanceData.compliantCount / attendanceData.totalEnrollments) * 100)
      : 0;
    
    // Assignment completion
    const assignmentStats = await Assignment.aggregate([
      { $match: { ...filters, isVisible: true, deletedAt: null } },
      {
        $lookup: {
          from: 'submissions',
          localField: '_id',
          foreignField: 'assignment',
          as: 'submissions'
        }
      },
      {
        $group: {
          _id: null,
          totalAssignments: { $sum: 1 },
          totalSubmissions: { $sum: { $size: '$submissions' } },
          avgSubmissions: { $avg: { $size: '$submissions' } }
        }
      }
    ]);
    
    const assignmentData = assignmentStats[0] || { totalAssignments: 0, totalSubmissions: 0, avgSubmissions: 0 };
    
    // Result distribution (grade distribution)
    const gradeDistribution = await Marksheet.aggregate([
      { $match: { ...filters, isFinalized: true, deletedAt: null } },
      {
        $group: {
          _id: '$letterGrade',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Recent activity logs (last 10)
    const recentActivities = await ActivityLog.find(filters)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'profile.firstName profile.lastName email')
      .select('action entityType entityId createdAt');
    
    // System health indicators
    const systemHealth = {
      status: 'healthy',
      lastChecked: new Date()
    };
    
    return {
      kpis: {
        totalStudents,
        totalTeachers,
        totalClasses,
        pendingApprovals: {
          enrollments: pendingEnrollments,
          submissions: pendingSubmissions,
          marksheets: pendingMarksheets
        },
        studentsOnProbation
      },
      academicSummary: {
        attendance: {
          averagePercentage: Math.round(attendanceData.avgAttendance || 0),
          compliancePercentage: attendanceCompliance,
          totalEnrollments: attendanceData.totalEnrollments
        },
        assignments: {
          totalAssignments: assignmentData.totalAssignments,
          totalSubmissions: assignmentData.totalSubmissions,
          averageSubmissionsPerAssignment: Math.round(assignmentData.avgSubmissions || 0)
        },
        results: {
          totalFinalized,
          passed: passedCount,
          failed: failedCount,
          passPercentage
        }
      },
      gradeDistribution,
      recentActivities,
      systemHealth
    };
  }
  
  // ==================== TEACHER DASHBOARD ====================
  
  async getTeacherDashboard(teacherId, campusId) {
    const filters = { campus: campusId, teacher: teacherId, deletedAt: null };
    
    // Assigned classes and subjects
    const assignedClasses = await Class.find(filters)
      .populate('subject', 'name code credits')
      .populate('semester', 'name')
      .select('name code section maxStudents currentEnrollment');
    
    // Pending grading
    const pendingAssignments = await Submission.countDocuments({
      campus: campusId,
      status: 'submitted',
      deletedAt: null
    });
    
    const pendingMarksheets = await Marksheet.countDocuments({
      campus: campusId,
      isFinalized: false,
      deletedAt: null
    });
    
    // Attendance alerts (classes with low attendance)
    const attendanceAlerts = await Attendance.find({
      ...filters,
      attendancePercentage: { $lt: 75 }
    })
      .populate('class', 'name code section')
      .populate('subject', 'name code')
      .sort({ date: -1 })
      .limit(5)
      .select('date attendancePercentage presentCount totalStudents');
    
    // Class-wise performance summary
    const classPerformance = await Promise.all(
      assignedClasses.map(async (classDoc) => {
        const enrollments = await Enrollment.find({
          class: classDoc._id,
          status: 'approved',
          deletedAt: null
        });
        
        const avgAttendance = enrollments.length > 0
          ? enrollments.reduce((sum, e) => sum + e.attendancePercentage, 0) / enrollments.length
          : 0;
        
        const eligibleCount = enrollments.filter(e => e.isEligibleForExam).length;
        const eligibilityPercentage = enrollments.length > 0
          ? Math.round((eligibleCount / enrollments.length) * 100)
          : 0;
        
        return {
          class: {
            _id: classDoc._id,
            name: classDoc.name,
            code: classDoc.code,
            section: classDoc.section
          },
          subject: classDoc.subject,
          semester: classDoc.semester,
          totalStudents: classDoc.currentEnrollment,
          averageAttendance: Math.round(avgAttendance),
          eligibleStudents: eligibleCount,
          eligibilityPercentage
        };
      })
    );
    
    // Student eligibility alerts (ineligible students)
    const ineligibleStudents = await Enrollment.find({
      campus: campusId,
      class: { $in: assignedClasses.map(c => c._id) },
      isEligibleForExam: false,
      status: 'approved',
      deletedAt: null
    })
      .populate('student', 'profile.firstName profile.lastName email username')
      .populate('class', 'name code section')
      .populate('subject', 'name code')
      .select('student class subject eligibilityReason attendancePercentage')
      .limit(10);
    
    return {
      kpis: {
        assignedClasses: assignedClasses.length,
        totalStudents: assignedClasses.reduce((sum, c) => sum + c.currentEnrollment, 0),
        pendingGrading: {
          assignments: pendingAssignments,
          marksheets: pendingMarksheets
        }
      },
      assignedClasses,
      classPerformance,
      attendanceAlerts,
      eligibilityAlerts: ineligibleStudents
    };
  }
  
  // ==================== STUDENT DASHBOARD ====================
  
  async getStudentDashboard(studentId, campusId) {
    // Get student enrollments
    const enrollments = await Enrollment.find({
      student: studentId,
      campus: campusId,
      status: 'approved',
      deletedAt: null
    })
      .populate('class', 'name code section')
      .populate('subject', 'name code credits')
      .populate('semester', 'name');
    
    // Calculate overall attendance
    const totalClasses = enrollments.reduce((sum, e) => sum + e.totalClasses, 0);
    const attendedClasses = enrollments.reduce((sum, e) => sum + e.attendedClasses, 0);
    const overallAttendance = totalClasses > 0
      ? Math.round((attendedClasses / totalClasses) * 100)
      : 0;
    
    // Assignment completion status
    const assignments = await Assignment.find({
      campus: campusId,
      class: { $in: enrollments.map(e => e.class._id) },
      isVisible: true,
      deletedAt: null
    });
    
    const submissions = await Submission.find({
      student: studentId,
      campus: campusId,
      deletedAt: null
    });
    
    const assignmentCompletion = assignments.length > 0
      ? Math.round((submissions.length / assignments.length) * 100)
      : 0;
    
    // Eligibility status
    const eligibleCount = enrollments.filter(e => e.isEligibleForExam).length;
    const ineligibleEnrollments = enrollments.filter(e => !e.isEligibleForExam);
    
    // Latest marksheets
    const latestMarksheets = await Marksheet.find({
      student: studentId,
      campus: campusId,
      isFinalized: true,
      deletedAt: null
    })
      .populate('subject', 'name code credits')
      .populate('semester', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('subject semester percentage letterGrade gradePoints isPassed');
    
    // Transcript summary
    const transcript = await Transcript.findOne({
      student: studentId,
      campus: campusId,
      deletedAt: null
    })
      .populate('program', 'name code')
      .select('cumulativeGPA cumulativePercentage totalCredits earnedCredits academicStatus isProbation');
    
    // Upcoming deadlines
    const upcomingDeadlines = await Assignment.find({
      campus: campusId,
      class: { $in: enrollments.map(e => e.class._id) },
      isVisible: true,
      dueDate: { $gte: new Date() },
      deletedAt: null
    })
      .populate('subject', 'name code')
      .populate('class', 'name code section')
      .sort({ dueDate: 1 })
      .limit(5)
      .select('title type dueDate totalMarks');
    
    // Check which assignments are submitted
    const upcomingWithStatus = await Promise.all(
      upcomingDeadlines.map(async (assignment) => {
        const submission = await Submission.findOne({
          student: studentId,
          assignment: assignment._id,
          deletedAt: null
        });
        
        return {
          ...assignment.toObject(),
          isSubmitted: !!submission,
          submissionStatus: submission?.status || null
        };
      })
    );
    
    return {
      kpis: {
        overallAttendance,
        assignmentCompletion,
        eligibility: {
          eligible: eligibleCount,
          total: enrollments.length,
          percentage: enrollments.length > 0
            ? Math.round((eligibleCount / enrollments.length) * 100)
            : 0
        }
      },
      enrollments: enrollments.map(e => ({
        class: e.class,
        subject: e.subject,
        semester: e.semester,
        attendancePercentage: e.attendancePercentage,
        isEligible: e.isEligibleForExam,
        eligibilityReason: e.eligibilityReason,
        grade: e.grade,
        gradePoints: e.gradePoints
      })),
      latestMarksheets,
      transcript,
      upcomingDeadlines: upcomingWithStatus,
      ineligibilityAlerts: ineligibleEnrollments.map(e => ({
        class: e.class,
        subject: e.subject,
        reason: e.eligibilityReason,
        attendancePercentage: e.attendancePercentage
      }))
    };
  }
  
  // ==================== ACCOUNTS DASHBOARD ====================
  
  async getAccountsDashboard(campusId, userRole) {
    const filters = userRole === 'superadmin' ? {} : { campus: campusId };
    
    // Note: This is a basic implementation
    // Full finance module will be implemented separately
    
    // For now, we'll return placeholder data structure
    // that will be populated when Finance module is implemented
    
    return {
      kpis: {
        totalStudents: await User.countDocuments({
          ...filters,
          role: 'student',
          isApproved: true,
          deletedAt: null
        }),
        totalTeachers: await User.countDocuments({
          ...filters,
          role: 'teacher',
          isApproved: true,
          deletedAt: null
        }),
        pendingFees: 0, // Will be populated by Finance module
        paidFees: 0, // Will be populated by Finance module
        unpaidFees: 0 // Will be populated by Finance module
      },
      summary: {
        message: 'Finance module will be implemented in the next phase',
        feesCollected: 0,
        feesOutstanding: 0,
        salariesPaid: 0,
        salariesPending: 0
      }
    };
  }
  
  // ==================== HELPER METHODS ====================
  
  async getSystemHealth() {
    // Check recent error logs
    const recentErrors = await ActivityLog.countDocuments({
      action: 'error',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });
    
    // Determine health status
    let status = 'healthy';
    if (recentErrors > 100) {
      status = 'critical';
    } else if (recentErrors > 50) {
      status = 'warning';
    }
    
    return {
      status,
      recentErrors,
      lastChecked: new Date()
    };
  }
}

export default new DashboardService();
