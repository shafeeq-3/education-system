import Attendance from '../models/Attendance.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Enrollment from '../models/Enrollment.js';
import Marksheet from '../models/Marksheet.js';
import Transcript from '../models/Transcript.js';
import StudentFee from '../models/StudentFee.js';
import SalaryPayment from '../models/SalaryPayment.js';
import Class from '../models/Class.js';
import User from '../models/User.js';
import { ValidationError } from '../utils/errors.js';

class AnalyticsService {
  // ==================== ACADEMIC ANALYTICS ====================
  
  /**
   * Attendance trends - Daily/Weekly/Monthly
   */
  async getAttendanceTrends(campusId, filters = {}) {
    const { startDate, endDate, classId, subjectId, groupBy = 'daily' } = filters;
    
    const matchStage = {
      deletedAt: null
    };
    
    // Only add campus filter if campusId is provided
    if (campusId) {
      matchStage.campus = campusId;
    }
    
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }
    if (classId) matchStage.class = classId;
    if (subjectId) matchStage.subject = subjectId;
    
    // Determine grouping format
    let dateFormat;
    switch (groupBy) {
      case 'daily':
        dateFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        dateFormat = '%Y-W%U';
        break;
      case 'monthly':
        dateFormat = '%Y-%m';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }
    
    const trends = await Attendance.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$date' } },
          totalSessions: { $sum: 1 },
          totalPresent: { 
            $sum: { 
              $size: { 
                $filter: { 
                  input: '$records', 
                  as: 'record', 
                  cond: { $eq: ['$$record.status', 'present'] } 
                } 
              } 
            } 
          },
          totalAbsent: { 
            $sum: { 
              $size: { 
                $filter: { 
                  input: '$records', 
                  as: 'record', 
                  cond: { $eq: ['$$record.status', 'absent'] } 
                } 
              } 
            } 
          },
          totalLeave: { 
            $sum: { 
              $size: { 
                $filter: { 
                  input: '$records', 
                  as: 'record', 
                  cond: { $eq: ['$$record.status', 'leave'] } 
                } 
              } 
            } 
          },
          totalStudents: { $sum: { $size: '$records' } }
        }
      },
      {
        $project: {
          period: '$_id',
          totalSessions: 1,
          totalPresent: 1,
          totalAbsent: 1,
          totalLeave: 1,
          totalStudents: 1,
          attendancePercentage: {
            $cond: [
              { $gt: ['$totalStudents', 0] },
              { $multiply: [{ $divide: ['$totalPresent', '$totalStudents'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { period: 1 } }
    ]);
    
    return trends;
  }
  
  /**
   * Class-wise and subject-wise attendance trends
   */
  async getAttendanceTrendsByClassOrSubject(campusId, filters = {}) {
    const { startDate, endDate, groupBy = 'class' } = filters;
    
    const matchStage = {
      campus: campusId,
      deletedAt: null
    };
    
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }
    
    const groupField = groupBy === 'class' ? '$class' : '$subject';
    
    const trends = await Attendance.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupField,
          totalSessions: { $sum: 1 },
          totalPresent: { $sum: '$presentCount' },
          totalAbsent: { $sum: '$absentCount' },
          totalLeave: { $sum: '$leaveCount' },
          totalStudents: { $sum: { $size: '$records' } }
        }
      },
      {
        $lookup: {
          from: groupBy === 'class' ? 'classes' : 'subjects',
          localField: '_id',
          foreignField: '_id',
          as: 'details'
        }
      },
      { $unwind: '$details' },
      {
        $project: {
          name: '$details.name',
          code: '$details.code',
          totalSessions: 1,
          totalPresent: 1,
          totalAbsent: 1,
          totalLeave: 1,
          attendancePercentage: {
            $cond: [
              { $gt: ['$totalStudents', 0] },
              { $multiply: [{ $divide: ['$totalPresent', '$totalStudents'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { attendancePercentage: -1 } }
    ]);
    
    return trends;
  }
  
  /**
   * Assignment analytics - Submission rates
   */
  async getAssignmentSubmissionRates(campusId, filters = {}) {
    const { startDate, endDate, classId, subjectId } = filters;
    
    const matchStage = {
      deletedAt: null
    };
    
    // Only add campus filter if campusId is provided
    if (campusId) {
      matchStage.campus = campusId;
    }
    
    if (startDate || endDate) {
      matchStage.publishDate = {};
      if (startDate) matchStage.publishDate.$gte = new Date(startDate);
      if (endDate) matchStage.publishDate.$lte = new Date(endDate);
    }
    if (classId) matchStage.class = classId;
    if (subjectId) matchStage.subject = subjectId;
    
    const analytics = await Assignment.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'submissions',
          localField: '_id',
          foreignField: 'assignment',
          as: 'submissions'
        }
      },
      {
        $lookup: {
          from: 'enrollments',
          let: { classId: '$class' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$class', '$$classId'] },
                    { $eq: ['$status', 'approved'] }
                  ]
                }
              }
            }
          ],
          as: 'enrolledStudents'
        }
      },
      {
        $project: {
          title: 1,
          type: 1,
          dueDate: 1,
          totalStudents: { $size: '$enrolledStudents' },
          totalSubmissions: { $size: '$submissions' },
          onTimeSubmissions: {
            $size: {
              $filter: {
                input: '$submissions',
                as: 'sub',
                cond: { $eq: ['$$sub.isLate', false] }
              }
            }
          },
          lateSubmissions: {
            $size: {
              $filter: {
                input: '$submissions',
                as: 'sub',
                cond: { $eq: ['$$sub.isLate', true] }
              }
            }
          },
          gradedSubmissions: {
            $size: {
              $filter: {
                input: '$submissions',
                as: 'sub',
                cond: { $eq: ['$$sub.status', 'graded'] }
              }
            }
          }
        }
      },
      {
        $project: {
          title: 1,
          type: 1,
          dueDate: 1,
          totalStudents: 1,
          totalSubmissions: 1,
          onTimeSubmissions: 1,
          lateSubmissions: 1,
          gradedSubmissions: 1,
          submissionRate: {
            $cond: [
              { $gt: ['$totalStudents', 0] },
              { $multiply: [{ $divide: ['$totalSubmissions', '$totalStudents'] }, 100] },
              0
            ]
          },
          onTimeRate: {
            $cond: [
              { $gt: ['$totalSubmissions', 0] },
              { $multiply: [{ $divide: ['$onTimeSubmissions', '$totalSubmissions'] }, 100] },
              0
            ]
          },
          gradingCompletionRate: {
            $cond: [
              { $gt: ['$totalSubmissions', 0] },
              { $multiply: [{ $divide: ['$gradedSubmissions', '$totalSubmissions'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { dueDate: -1 } }
    ]);
    
    return analytics;
  }
  
  /**
   * Late submission trends
   */
  async getLateSubmissionTrends(campusId, filters = {}) {
    const { startDate, endDate, groupBy = 'monthly' } = filters;
    
    const matchStage = {
      campus: campusId,
      isLate: true,
      deletedAt: null
    };
    
    if (startDate || endDate) {
      matchStage.submittedAt = {};
      if (startDate) matchStage.submittedAt.$gte = new Date(startDate);
      if (endDate) matchStage.submittedAt.$lte = new Date(endDate);
    }
    
    const dateFormat = groupBy === 'monthly' ? '%Y-%m' : '%Y-%m-%d';
    
    const trends = await Submission.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$submittedAt' } },
          totalLateSubmissions: { $sum: 1 },
          avgLateDays: { $avg: '$daysLate' }
        }
      },
      {
        $project: {
          period: '$_id',
          totalLateSubmissions: 1,
          avgLateDays: { $round: ['$avgLateDays', 2] }
        }
      },
      { $sort: { period: 1 } }
    ]);
    
    return trends;
  }
  
  /**
   * Result analytics - Pass/Fail ratios and grade distribution
   */
  async getResultAnalytics(campusId, filters = {}) {
    const { semesterId, academicYearId, programId } = filters;
    
    const matchStage = {
      deletedAt: null
    };
    
    // Only add campus filter if campusId is provided
    if (campusId) {
      matchStage.campus = campusId;
    }
    
    if (semesterId) matchStage.semester = semesterId;
    if (academicYearId) matchStage.academicYear = academicYearId;
    if (programId) matchStage.program = programId;
    
    const analytics = await Marksheet.aggregate([
      { $match: matchStage },
      {
        $facet: {
          passFailRatio: [
            {
              $group: {
                _id: '$isPassed',
                count: { $sum: 1 }
              }
            }
          ],
          gradeDistribution: [
            {
              $group: {
                _id: '$letterGrade',
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ],
          statistics: [
            {
              $group: {
                _id: null,
                totalMarksheets: { $sum: 1 },
                avgPercentage: { $avg: '$percentage' },
                avgGradePoints: { $avg: '$gradePoints' },
                maxPercentage: { $max: '$percentage' },
                minPercentage: { $min: '$percentage' }
              }
            }
          ]
        }
      }
    ]);
    
    return analytics[0];
  }
  
  /**
   * GPA trends per semester
   */
  async getGPATrends(campusId, filters = {}) {
    const { programId, studentId } = filters;
    
    const matchStage = {
      deletedAt: null
    };
    
    // Only add campus filter if campusId is provided
    if (campusId) {
      matchStage.campus = campusId;
    }
    
    if (programId) matchStage.program = programId;
    if (studentId) matchStage.student = studentId;
    
    const trends = await Transcript.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'semesters',
          localField: 'semester',
          foreignField: '_id',
          as: 'semesterDetails'
        }
      },
      { $unwind: '$semesterDetails' },
      {
        $group: {
          _id: '$semester',
          semesterName: { $first: '$semesterDetails.name' },
          avgSemesterGPA: { $avg: '$semesterGPA' },
          avgCumulativeGPA: { $avg: '$cumulativeGPA' },
          totalStudents: { $sum: 1 },
          passedStudents: {
            $sum: { $cond: [{ $eq: ['$academicStatus', 'passed'] }, 1, 0] }
          },
          probationStudents: {
            $sum: { $cond: [{ $eq: ['$academicStatus', 'probation'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          semesterName: 1,
          avgSemesterGPA: { $round: ['$avgSemesterGPA', 2] },
          avgCumulativeGPA: { $round: ['$avgCumulativeGPA', 2] },
          totalStudents: 1,
          passedStudents: 1,
          probationStudents: 1,
          passRate: {
            $cond: [
              { $gt: ['$totalStudents', 0] },
              { $multiply: [{ $divide: ['$passedStudents', '$totalStudents'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    return trends;
  }

  // ==================== STUDENT ANALYTICS ====================
  
  /**
   * At-risk students detection
   */
  async getAtRiskStudents(campusId, filters = {}) {
    const { semesterId, programId, riskLevel = 'all' } = filters;
    
    const matchStage = {
      status: { $in: ['approved', 'completed'] },
      deletedAt: null
    };
    
    // Only add campus filter if campusId is provided
    if (campusId) {
      matchStage.campus = campusId;
    }
    
    if (semesterId) matchStage.semester = semesterId;
    
    const enrollments = await Enrollment.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentDetails'
        }
      },
      { $unwind: '$studentDetails' },
      {
        $lookup: {
          from: 'transcripts',
          let: { studentId: '$student', semesterId: '$semester' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$student', '$$studentId'] },
                    { $eq: ['$semester', '$$semesterId'] }
                  ]
                }
              }
            }
          ],
          as: 'transcript'
        }
      },
      {
        $project: {
          student: '$studentDetails',
          attendancePercentage: 1,
          isEligibleForExam: 1,
          eligibilityReason: 1,
          grade: 1,
          gradePoints: 1,
          cumulativeGPA: { $arrayElemAt: ['$transcript.cumulativeGPA', 0] },
          academicStatus: { $arrayElemAt: ['$transcript.academicStatus', 0] },
          riskFactors: {
            lowAttendance: { $lt: ['$attendancePercentage', 75] },
            ineligible: { $eq: ['$isEligibleForExam', false] },
            lowGPA: { $lt: [{ $arrayElemAt: ['$transcript.cumulativeGPA', 0] }, 2.0] },
            onProbation: { $eq: [{ $arrayElemAt: ['$transcript.academicStatus', 0] }, 'probation'] }
          }
        }
      },
      {
        $addFields: {
          riskScore: {
            $add: [
              { $cond: ['$riskFactors.lowAttendance', 1, 0] },
              { $cond: ['$riskFactors.ineligible', 2, 0] },
              { $cond: ['$riskFactors.lowGPA', 2, 0] },
              { $cond: ['$riskFactors.onProbation', 1, 0] }
            ]
          }
        }
      },
      {
        $match: {
          riskScore: { $gt: 0 }
        }
      },
      { $sort: { riskScore: -1, attendancePercentage: 1 } }
    ]);
    
    // Filter by risk level if specified
    if (riskLevel !== 'all') {
      const riskThresholds = {
        high: 3,
        medium: 2,
        low: 1
      };
      const threshold = riskThresholds[riskLevel] || 0;
      return enrollments.filter(e => e.riskScore >= threshold);
    }
    
    return enrollments;
  }
  
  /**
   * Probation trends
   */
  async getProbationTrends(campusId, filters = {}) {
    const { startDate, endDate, programId } = filters;
    
    const matchStage = {
      campus: campusId,
      academicStatus: 'probation',
      deletedAt: null
    };
    
    if (programId) matchStage.program = programId;
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }
    
    const trends = await Transcript.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' }
          },
          totalOnProbation: { $sum: 1 },
          avgCumulativeGPA: { $avg: '$cumulativeGPA' }
        }
      },
      {
        $project: {
          period: '$_id',
          totalOnProbation: 1,
          avgCumulativeGPA: { $round: ['$avgCumulativeGPA', 2] }
        }
      },
      { $sort: { period: 1 } }
    ]);
    
    return trends;
  }
  
  /**
   * Completion vs dropout indicators
   */
  async getCompletionDropoutAnalytics(campusId, filters = {}) {
    const { programId, academicYearId } = filters;
    
    const matchStage = {
      campus: campusId,
      deletedAt: null
    };
    
    if (programId) matchStage.program = programId;
    if (academicYearId) matchStage.academicYear = academicYearId;
    
    const analytics = await Enrollment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          statuses: {
            $push: {
              status: '$_id',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      {
        $project: {
          statuses: 1,
          total: 1,
          completionRate: {
            $multiply: [
              {
                $divide: [
                  {
                    $size: {
                      $filter: {
                        input: '$statuses',
                        as: 'status',
                        cond: { $eq: ['$$status.status', 'completed'] }
                      }
                    }
                  },
                  { $cond: [{ $gt: ['$total', 0] }, '$total', 1] }
                ]
              },
              100
            ]
          },
          dropoutRate: {
            $multiply: [
              {
                $divide: [
                  {
                    $size: {
                      $filter: {
                        input: '$statuses',
                        as: 'status',
                        cond: { $eq: ['$$status.status', 'dropped'] }
                      }
                    }
                  },
                  { $cond: [{ $gt: ['$total', 0] }, '$total', 1] }
                ]
              },
              100
            ]
          }
        }
      }
    ]);
    
    return analytics[0] || { statuses: [], total: 0, completionRate: 0, dropoutRate: 0 };
  }
  
  // ==================== TEACHER ANALYTICS ====================
  
  /**
   * Class performance summaries by teacher
   */
  async getTeacherClassPerformance(teacherId, campusId, filters = {}) {
    const { semesterId } = filters;
    
    const matchStage = {
      teacher: teacherId,
      campus: campusId,
      deletedAt: null
    };
    
    if (semesterId) matchStage.semester = semesterId;
    
    const performance = await Class.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'enrollments',
          localField: '_id',
          foreignField: 'class',
          as: 'enrollments'
        }
      },
      {
        $lookup: {
          from: 'assignments',
          localField: '_id',
          foreignField: 'class',
          as: 'assignments'
        }
      },
      {
        $lookup: {
          from: 'attendances',
          localField: '_id',
          foreignField: 'class',
          as: 'attendances'
        }
      },
      {
        $project: {
          name: 1,
          code: 1,
          section: 1,
          totalStudents: { $size: '$enrollments' },
          totalAssignments: { $size: '$assignments' },
          totalAttendanceSessions: { $size: '$attendances' },
          avgAttendance: { $avg: '$enrollments.attendancePercentage' },
          eligibleStudents: {
            $size: {
              $filter: {
                input: '$enrollments',
                as: 'enr',
                cond: { $eq: ['$$enr.isEligibleForExam', true] }
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          code: 1,
          section: 1,
          totalStudents: 1,
          totalAssignments: 1,
          totalAttendanceSessions: 1,
          avgAttendance: { $round: ['$avgAttendance', 2] },
          eligibleStudents: 1,
          eligibilityRate: {
            $cond: [
              { $gt: ['$totalStudents', 0] },
              { $multiply: [{ $divide: ['$eligibleStudents', '$totalStudents'] }, 100] },
              0
            ]
          }
        }
      }
    ]);
    
    return performance;
  }
  
  /**
   * Grading turnaround time
   */
  async getGradingTurnaroundTime(teacherId, campusId, filters = {}) {
    const { startDate, endDate } = filters;
    
    const matchStage = {
      teacher: teacherId,
      campus: campusId,
      deletedAt: null
    };
    
    if (startDate || endDate) {
      matchStage.dueDate = {};
      if (startDate) matchStage.dueDate.$gte = new Date(startDate);
      if (endDate) matchStage.dueDate.$lte = new Date(endDate);
    }
    
    const turnaround = await Assignment.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'submissions',
          localField: '_id',
          foreignField: 'assignment',
          as: 'submissions'
        }
      },
      { $unwind: { path: '$submissions', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          'submissions.status': 'graded'
        }
      },
      {
        $project: {
          title: 1,
          dueDate: 1,
          submittedAt: '$submissions.submittedAt',
          gradedAt: '$submissions.gradedAt',
          turnaroundDays: {
            $divide: [
              { $subtract: ['$submissions.gradedAt', '$submissions.submittedAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: '$_id',
          title: { $first: '$title' },
          dueDate: { $first: '$dueDate' },
          totalGraded: { $sum: 1 },
          avgTurnaroundDays: { $avg: '$turnaroundDays' },
          minTurnaroundDays: { $min: '$turnaroundDays' },
          maxTurnaroundDays: { $max: '$turnaroundDays' }
        }
      },
      {
        $project: {
          title: 1,
          dueDate: 1,
          totalGraded: 1,
          avgTurnaroundDays: { $round: ['$avgTurnaroundDays', 2] },
          minTurnaroundDays: { $round: ['$minTurnaroundDays', 2] },
          maxTurnaroundDays: { $round: ['$maxTurnaroundDays', 2] }
        }
      },
      { $sort: { dueDate: -1 } }
    ]);
    
    return turnaround;
  }
  
  /**
   * Attendance marking consistency
   */
  async getAttendanceMarkingConsistency(teacherId, campusId, filters = {}) {
    const { startDate, endDate } = filters;
    
    const matchStage = {
      teacher: teacherId,
      campus: campusId,
      deletedAt: null
    };
    
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }
    
    const consistency = await Attendance.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$date' }
          },
          totalSessions: { $sum: 1 },
          lockedSessions: {
            $sum: { $cond: ['$isLocked', 1, 0] }
          }
        }
      },
      {
        $project: {
          period: '$_id',
          totalSessions: 1,
          lockedSessions: 1,
          lockingRate: {
            $cond: [
              { $gt: ['$totalSessions', 0] },
              { $multiply: [{ $divide: ['$lockedSessions', '$totalSessions'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { period: 1 } }
    ]);
    
    return consistency;
  }

  // ==================== FINANCIAL ANALYTICS ====================
  
  /**
   * Fee collection trends
   */
  async getFeeCollectionTrends(campusId, filters = {}) {
    const { startDate, endDate, groupBy = 'monthly' } = filters;
    
    const matchStage = {
      deletedAt: null,
      'payments.0': { $exists: true }
    };
    
    // Only add campus filter if campusId is provided
    if (campusId) {
      matchStage.campus = campusId;
    }
    
    const dateFormat = groupBy === 'monthly' ? '%Y-%m' : '%Y-%m-%d';
    
    const trends = await StudentFee.aggregate([
      { $match: matchStage },
      { $unwind: '$payments' },
      {
        $match: {
          ...(startDate && { 'payments.paymentDate': { $gte: new Date(startDate) } }),
          ...(endDate && { 'payments.paymentDate': { $lte: new Date(endDate) } })
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$payments.paymentDate' }
          },
          totalCollected: { $sum: '$payments.amount' },
          totalPayments: { $sum: 1 }
        }
      },
      {
        $project: {
          period: '$_id',
          totalCollected: 1,
          totalPayments: 1,
          avgPaymentAmount: { $divide: ['$totalCollected', '$totalPayments'] }
        }
      },
      { $sort: { period: 1 } }
    ]);
    
    return trends;
  }
  
  /**
   * Outstanding dues aging
   */
  async getOutstandingDuesAging(campusId, filters = {}) {
    const { programId } = filters;
    
    const matchStage = {
      paymentStatus: { $in: ['unpaid', 'partially_paid', 'overdue'] },
      deletedAt: null
    };
    
    // Only add campus filter if campusId is provided
    if (campusId) {
      matchStage.campus = campusId;
    }
    
    if (programId) matchStage.program = programId;
    
    const aging = await StudentFee.aggregate([
      { $match: matchStage },
      {
        $project: {
          student: 1,
          totalAmount: 1,
          remainingAmount: 1,
          dueDate: 1,
          paymentStatus: 1,
          daysOverdue: {
            $cond: [
              { $lt: ['$dueDate', new Date()] },
              {
                $divide: [
                  { $subtract: [new Date(), '$dueDate'] },
                  1000 * 60 * 60 * 24
                ]
              },
              0
            ]
          }
        }
      },
      {
        $bucket: {
          groupBy: '$daysOverdue',
          boundaries: [0, 30, 60, 90, 180, 365, Infinity],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            totalOutstanding: { $sum: '$remainingAmount' },
            students: { $push: '$student' }
          }
        }
      },
      {
        $project: {
          agingBucket: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 0] }, then: 'Current (0-30 days)' },
                { case: { $eq: ['$_id', 30] }, then: '30-60 days' },
                { case: { $eq: ['$_id', 60] }, then: '60-90 days' },
                { case: { $eq: ['$_id', 90] }, then: '90-180 days' },
                { case: { $eq: ['$_id', 180] }, then: '180-365 days' },
                { case: { $eq: ['$_id', 365] }, then: 'Over 1 year' }
              ],
              default: 'Other'
            }
          },
          count: 1,
          totalOutstanding: 1,
          studentCount: { $size: '$students' }
        }
      }
    ]);
    
    return aging;
  }
  
  /**
   * Salary expenditure trends
   */
  async getSalaryExpenditureTrends(campusId, filters = {}) {
    const { startYear, endYear } = filters;
    
    const matchStage = {
      status: 'paid',
      deletedAt: null
    };
    
    // Only add campus filter if campusId is provided
    if (campusId) {
      matchStage.campus = campusId;
    }
    
    if (startYear) matchStage.year = { $gte: parseInt(startYear) };
    if (endYear) matchStage.year = { ...matchStage.year, $lte: parseInt(endYear) };
    
    const trends = await SalaryPayment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: '$year',
            month: '$month'
          },
          totalPaid: { $sum: '$netSalary' },
          totalStaff: { $sum: 1 },
          avgSalary: { $avg: '$netSalary' }
        }
      },
      {
        $project: {
          period: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: [
                  { $lt: ['$_id.month', 10] },
                  { $concat: ['0', { $toString: '$_id.month' }] },
                  { $toString: '$_id.month' }
                ]
              }
            ]
          },
          totalPaid: 1,
          totalStaff: 1,
          avgSalary: { $round: ['$avgSalary', 2] }
        }
      },
      { $sort: { period: 1 } }
    ]);
    
    return trends;
  }
  
  // ==================== ADMIN INSIGHTS ====================
  
  /**
   * Campus comparison (multi-campus)
   */
  async getCampusComparison(campusIds = []) {
    if (campusIds.length === 0) {
      throw new ValidationError('At least one campus ID is required');
    }
    
    const comparison = await Promise.all(
      campusIds.map(async (campusId) => {
        const [
          studentCount,
          teacherCount,
          classCount,
          avgAttendance,
          feeCollection,
          salaryExpenditure
        ] = await Promise.all([
          User.countDocuments({ campus: campusId, role: 'student', deletedAt: null }),
          User.countDocuments({ campus: campusId, role: 'teacher', deletedAt: null }),
          Class.countDocuments({ campus: campusId, deletedAt: null }),
          Enrollment.aggregate([
            { $match: { campus: campusId, deletedAt: null } },
            { $group: { _id: null, avgAttendance: { $avg: '$attendancePercentage' } } }
          ]),
          StudentFee.aggregate([
            { $match: { campus: campusId, deletedAt: null } },
            { $group: { _id: null, totalCollected: { $sum: '$paidAmount' } } }
          ]),
          SalaryPayment.aggregate([
            { $match: { campus: campusId, status: 'paid', deletedAt: null } },
            { $group: { _id: null, totalPaid: { $sum: '$netSalary' } } }
          ])
        ]);
        
        return {
          campusId,
          studentCount,
          teacherCount,
          classCount,
          avgAttendance: avgAttendance[0]?.avgAttendance || 0,
          totalFeeCollection: feeCollection[0]?.totalCollected || 0,
          totalSalaryExpenditure: salaryExpenditure[0]?.totalPaid || 0
        };
      })
    );
    
    return comparison;
  }
  
  /**
   * Academic vs financial correlations
   */
  async getAcademicFinancialCorrelation(campusId, filters = {}) {
    const { semesterId } = filters;
    
    const matchStage = {
      campus: campusId,
      deletedAt: null
    };
    
    if (semesterId) matchStage.semester = semesterId;
    
    const correlation = await Enrollment.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'studentfees',
          let: { studentId: '$student', semesterId: '$semester' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$student', '$$studentId'] },
                    { $eq: ['$semester', '$$semesterId'] }
                  ]
                }
              }
            }
          ],
          as: 'fees'
        }
      },
      {
        $project: {
          student: 1,
          attendancePercentage: 1,
          gradePoints: 1,
          isEligibleForExam: 1,
          feeClearance: 1,
          hasFees: { $gt: [{ $size: '$fees' }, 0] },
          feesPaid: {
            $cond: [
              { $gt: [{ $size: '$fees' }, 0] },
              { $eq: [{ $arrayElemAt: ['$fees.paymentStatus', 0] }, 'paid'] },
              false
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          studentsWithFeeClearance: {
            $sum: { $cond: ['$feeClearance', 1, 0] }
          },
          eligibleStudents: {
            $sum: { $cond: ['$isEligibleForExam', 1, 0] }
          },
          avgAttendanceWithClearance: {
            $avg: {
              $cond: ['$feeClearance', '$attendancePercentage', null]
            }
          },
          avgAttendanceWithoutClearance: {
            $avg: {
              $cond: [{ $not: '$feeClearance' }, '$attendancePercentage', null]
            }
          },
          avgGPAWithClearance: {
            $avg: {
              $cond: ['$feeClearance', '$gradePoints', null]
            }
          },
          avgGPAWithoutClearance: {
            $avg: {
              $cond: [{ $not: '$feeClearance' }, '$gradePoints', null]
            }
          }
        }
      },
      {
        $project: {
          totalStudents: 1,
          studentsWithFeeClearance: 1,
          eligibleStudents: 1,
          feeClearanceRate: {
            $multiply: [
              { $divide: ['$studentsWithFeeClearance', '$totalStudents'] },
              100
            ]
          },
          eligibilityRate: {
            $multiply: [
              { $divide: ['$eligibleStudents', '$totalStudents'] },
              100
            ]
          },
          avgAttendanceWithClearance: { $round: ['$avgAttendanceWithClearance', 2] },
          avgAttendanceWithoutClearance: { $round: ['$avgAttendanceWithoutClearance', 2] },
          avgGPAWithClearance: { $round: ['$avgGPAWithClearance', 2] },
          avgGPAWithoutClearance: { $round: ['$avgGPAWithoutClearance', 2] }
        }
      }
    ]);
    
    return correlation[0] || {};
  }
  
  /**
   * Year-over-year comparison
   */
  async getYearOverYearComparison(campusId, filters = {}) {
    const { metric = 'enrollment' } = filters;
    
    let collection, groupField, valueField;
    
    switch (metric) {
      case 'enrollment':
        collection = Enrollment;
        groupField = 'academicYear';
        valueField = 'count';
        break;
      case 'attendance':
        collection = Enrollment;
        groupField = 'academicYear';
        valueField = 'avgAttendance';
        break;
      case 'fees':
        collection = StudentFee;
        groupField = 'academicYear';
        valueField = 'totalCollected';
        break;
      case 'results':
        collection = Marksheet;
        groupField = 'academicYear';
        valueField = 'avgPercentage';
        break;
      default:
        collection = Enrollment;
        groupField = 'academicYear';
        valueField = 'count';
    }
    
    const matchStage = {
      campus: campusId,
      deletedAt: null
    };
    
    let aggregationPipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'academicyears',
          localField: groupField,
          foreignField: '_id',
          as: 'yearDetails'
        }
      },
      { $unwind: '$yearDetails' }
    ];
    
    if (metric === 'enrollment') {
      aggregationPipeline.push(
        {
          $group: {
            _id: '$academicYear',
            year: { $first: '$yearDetails.year' },
            count: { $sum: 1 }
          }
        }
      );
    } else if (metric === 'attendance') {
      aggregationPipeline.push(
        {
          $group: {
            _id: '$academicYear',
            year: { $first: '$yearDetails.year' },
            avgAttendance: { $avg: '$attendancePercentage' }
          }
        }
      );
    } else if (metric === 'fees') {
      aggregationPipeline.push(
        {
          $group: {
            _id: '$academicYear',
            year: { $first: '$yearDetails.year' },
            totalCollected: { $sum: '$paidAmount' }
          }
        }
      );
    } else if (metric === 'results') {
      aggregationPipeline.push(
        {
          $group: {
            _id: '$academicYear',
            year: { $first: '$yearDetails.year' },
            avgPercentage: { $avg: '$percentage' }
          }
        }
      );
    }
    
    aggregationPipeline.push({ $sort: { year: 1 } });
    
    const comparison = await collection.aggregate(aggregationPipeline);
    
    return comparison;
  }
}

export default new AnalyticsService();
