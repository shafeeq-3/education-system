import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Attendance from '../models/Attendance.js';
import Enrollment from '../models/Enrollment.js';
import Class from '../models/Class.js';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors.js';
import notificationService from './notificationService.js';

class AssignmentService {
  // ==================== ASSIGNMENTS ====================
  
  async createAssignment(data, userId) {
    const assignmentData = {
      campus: data.campusId,
      class: data.classId,
      subject: data.subjectId,
      teacher: data.teacherId,
      semester: data.semesterId,
      title: data.title,
      description: data.description,
      type: data.type,
      totalMarks: data.totalMarks,
      dueDate: data.dueDate,
      lateSubmissionAllowed: data.lateSubmissionAllowed || false,
      latePenaltyType: data.latePenaltyType || 'none',
      latePenaltyValue: data.latePenaltyValue || 0,
      isVisible: data.isVisible !== undefined ? data.isVisible : true,
      publishDate: data.publishDate || new Date(),
      allowResubmission: data.allowResubmission || false,
      maxResubmissions: data.maxResubmissions || 0,
      attachments: data.attachments || [],
      createdBy: userId
    };
    
    const assignment = await Assignment.create(assignmentData);
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('campus', 'name code')
      .populate('class', 'name code section')
      .populate('subject', 'name code')
      .populate('teacher', 'profile.firstName profile.lastName email')
      .populate('semester', 'name');
    
    // Trigger notification: Assignment published
    if (populatedAssignment.isVisible) {
      notificationService.notifyAssignmentPublished(
        populatedAssignment,
        populatedAssignment.class,
        populatedAssignment.campus._id,
        userId
      ).catch(err => console.error('Notification error:', err));
    }
    
    return populatedAssignment;
  }
  
  async getAssignments(filters, pagination, sort) {
    const query = Assignment.find(filters);
    
    const total = await Assignment.countDocuments(filters);
    
    const assignments = await query
      .populate('campus', 'name code')
      .populate('class', 'name code section')
      .populate('subject', 'name code')
      .populate('teacher', 'profile.firstName profile.lastName email')
      .populate('semester', 'name')
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    return { assignments, total };
  }
  
  async getAssignmentById(id) {
    const assignment = await Assignment.findById(id)
      .populate('campus', 'name code')
      .populate('class', 'name code section maxStudents currentEnrollment')
      .populate('subject', 'name code credits')
      .populate('teacher', 'profile.firstName profile.lastName email profile.phone')
      .populate('semester', 'name startDate endDate')
      .populate('createdBy', 'profile.firstName profile.lastName');
    
    if (!assignment) {
      throw new NotFoundError('Assignment not found');
    }
    
    return assignment;
  }
  
  async updateAssignment(id, data) {
    const assignment = await Assignment.findById(id);
    
    if (!assignment) {
      throw new NotFoundError('Assignment not found');
    }
    
    // Update fields
    const allowedUpdates = [
      'title', 'description', 'totalMarks', 'dueDate',
      'lateSubmissionAllowed', 'latePenaltyType', 'latePenaltyValue',
      'isVisible', 'publishDate', 'allowResubmission', 'maxResubmissions',
      'attachments', 'isActive'
    ];
    
    allowedUpdates.forEach(field => {
      if (data[field] !== undefined) {
        assignment[field] = data[field];
      }
    });
    
    assignment.updatedBy = data.updatedBy;
    await assignment.save();
    
    return await Assignment.findById(id)
      .populate('campus', 'name code')
      .populate('class', 'name code section')
      .populate('subject', 'name code')
      .populate('teacher', 'profile.firstName profile.lastName email')
      .populate('semester', 'name');
  }
  
  async deleteAssignment(id) {
    const assignment = await Assignment.findById(id);
    
    if (!assignment) {
      throw new NotFoundError('Assignment not found');
    }
    
    // Check if assignment has submissions
    const submissionCount = await Submission.countDocuments({
      assignment: id,
      deletedAt: null
    });
    
    if (submissionCount > 0) {
      throw new ConflictError('Cannot delete assignment with existing submissions');
    }
    
    // Soft delete
    assignment.deletedAt = new Date();
    await assignment.save();
    
    return assignment;
  }
  
  // ==================== SUBMISSIONS ====================
  
  async createSubmission(data, userId) {
    const assignment = await Assignment.findById(data.assignmentId);
    
    if (!assignment) {
      throw new NotFoundError('Assignment not found');
    }
    
    // Check if assignment is published
    if (!assignment.isPublished) {
      throw new ValidationError('Assignment is not yet published');
    }
    
    // Check for existing submission
    const existingSubmission = await Submission.findOne({
      assignment: data.assignmentId,
      student: data.studentId,
      deletedAt: null
    });
    
    if (existingSubmission) {
      // Check if resubmission is allowed
      if (!assignment.allowResubmission) {
        throw new ConflictError('Resubmission is not allowed for this assignment');
      }
      
      if (existingSubmission.submissionNumber >= assignment.maxResubmissions + 1) {
        throw new ConflictError('Maximum resubmission limit reached');
      }
      
      // Store previous submission
      existingSubmission.previousSubmissions.push({
        submittedAt: existingSubmission.submittedAt,
        content: existingSubmission.content,
        attachments: existingSubmission.attachments
      });
      
      // Update submission
      existingSubmission.content = data.content;
      existingSubmission.attachments = data.attachments || [];
      existingSubmission.submittedAt = new Date();
      existingSubmission.submissionNumber += 1;
      existingSubmission.isLateSubmission = new Date() > assignment.dueDate;
      existingSubmission.status = 'submitted';
      existingSubmission.updatedBy = userId;
      
      await existingSubmission.save();
      
      return await Submission.findById(existingSubmission._id)
        .populate('assignment', 'title type totalMarks dueDate')
        .populate('student', 'profile.firstName profile.lastName email username')
        .populate('enrollment', 'status')
        .populate('class', 'name code section');
    }
    
    // Check if late submission is allowed
    const isLate = new Date() > assignment.dueDate;
    if (isLate && !assignment.lateSubmissionAllowed) {
      throw new ValidationError('Late submission is not allowed for this assignment');
    }
    
    const submissionData = {
      campus: data.campusId,
      assignment: data.assignmentId,
      student: data.studentId,
      enrollment: data.enrollmentId,
      class: data.classId,
      content: data.content,
      attachments: data.attachments || [],
      isLateSubmission: isLate,
      createdBy: userId
    };
    
    const submission = await Submission.create(submissionData);
    
    // Update assignment statistics
    assignment.totalSubmissions += 1;
    await assignment.save();
    
    return await Submission.findById(submission._id)
      .populate('assignment', 'title type totalMarks dueDate')
      .populate('student', 'profile.firstName profile.lastName email username')
      .populate('enrollment', 'status')
      .populate('class', 'name code section');
  }
  
  async getSubmissions(filters, pagination, sort) {
    const query = Submission.find(filters);
    
    const total = await Submission.countDocuments(filters);
    
    const submissions = await query
      .populate('assignment', 'title type totalMarks dueDate')
      .populate('student', 'profile.firstName profile.lastName email username')
      .populate('enrollment', 'status')
      .populate('class', 'name code section')
      .populate('gradedBy', 'profile.firstName profile.lastName')
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    return { submissions, total };
  }
  
  async getSubmissionById(id) {
    const submission = await Submission.findById(id)
      .populate('assignment', 'title description type totalMarks dueDate lateSubmissionAllowed latePenaltyType latePenaltyValue')
      .populate('student', 'profile.firstName profile.lastName email username profile.phone')
      .populate('enrollment', 'status grade gradePoints')
      .populate('class', 'name code section')
      .populate('gradedBy', 'profile.firstName profile.lastName email')
      .populate('createdBy', 'profile.firstName profile.lastName');
    
    if (!submission) {
      throw new NotFoundError('Submission not found');
    }
    
    return submission;
  }
  
  async gradeSubmission(id, data, userId) {
    const submission = await Submission.findById(id).populate('assignment');
    
    if (!submission) {
      throw new NotFoundError('Submission not found');
    }
    
    if (data.marksObtained > submission.assignment.totalMarks) {
      throw new ValidationError('Marks obtained cannot exceed total marks');
    }
    
    submission.marksObtained = data.marksObtained;
    submission.feedback = data.feedback;
    submission.gradedBy = userId;
    submission.gradedAt = new Date();
    submission.status = 'graded';
    
    // Calculate adjusted marks with late penalty
    submission.calculateAdjustedMarks(submission.assignment);
    
    await submission.save();
    
    // Update assignment statistics
    const assignment = await Assignment.findById(submission.assignment._id);
    assignment.gradedSubmissions = await Submission.countDocuments({
      assignment: assignment._id,
      status: 'graded',
      deletedAt: null
    });
    await assignment.save();
    
    return await this.getSubmissionById(id);
  }
  
  async deleteSubmission(id) {
    const submission = await Submission.findById(id);
    
    if (!submission) {
      throw new NotFoundError('Submission not found');
    }
    
    // Soft delete
    submission.deletedAt = new Date();
    await submission.save();
    
    // Update assignment statistics
    const assignment = await Assignment.findById(submission.assignment);
    if (assignment) {
      assignment.totalSubmissions = Math.max(0, assignment.totalSubmissions - 1);
      if (submission.status === 'graded') {
        assignment.gradedSubmissions = Math.max(0, assignment.gradedSubmissions - 1);
      }
      await assignment.save();
    }
    
    return submission;
  }
  
  // ==================== ELIGIBILITY ENGINE ====================
  
  async calculateEligibility(enrollmentId, minAttendance = 75, minAssignmentCompletion = 70) {
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('class')
      .populate('subject')
      .populate('semester');
    
    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }
    
    // Calculate attendance percentage
    const attendanceRecords = await Attendance.find({
      class: enrollment.class._id,
      'records.student': enrollment.student,
      deletedAt: null
    });
    
    let totalClasses = 0;
    let attendedClasses = 0;
    
    attendanceRecords.forEach(session => {
      const studentRecord = session.records.find(
        r => r.student.toString() === enrollment.student.toString()
      );
      if (studentRecord) {
        totalClasses++;
        if (studentRecord.status === 'present') {
          attendedClasses++;
        }
      }
    });
    
    const attendancePercentage = totalClasses > 0 
      ? Math.round((attendedClasses / totalClasses) * 100)
      : 0;
    
    // Calculate assignment completion percentage
    const assignments = await Assignment.find({
      class: enrollment.class._id,
      subject: enrollment.subject._id,
      semester: enrollment.semester._id,
      isVisible: true,
      deletedAt: null
    });
    
    const totalAssignments = assignments.length;
    const submittedAssignments = await Submission.countDocuments({
      student: enrollment.student,
      assignment: { $in: assignments.map(a => a._id) },
      deletedAt: null
    });
    
    const assignmentCompletionPercentage = totalAssignments > 0
      ? Math.round((submittedAssignments / totalAssignments) * 100)
      : 100; // If no assignments, consider 100%
    
    // Determine eligibility
    const isEligibleByAttendance = attendancePercentage >= minAttendance;
    const isEligibleByAssignments = assignmentCompletionPercentage >= minAssignmentCompletion;
    const isEligible = isEligibleByAttendance && isEligibleByAssignments;
    
    // Build eligibility reason
    const reasons = [];
    if (!isEligibleByAttendance) {
      reasons.push(`Attendance ${attendancePercentage}% is below minimum ${minAttendance}%`);
    }
    if (!isEligibleByAssignments) {
      reasons.push(`Assignment completion ${assignmentCompletionPercentage}% is below minimum ${minAssignmentCompletion}%`);
    }
    
    // Update enrollment
    enrollment.totalClasses = totalClasses;
    enrollment.attendedClasses = attendedClasses;
    enrollment.updateAttendancePercentage();
    enrollment.isEligibleForExam = isEligible;
    enrollment.eligibilityReason = reasons.length > 0 ? reasons.join('; ') : null;
    
    await enrollment.save();
    
    return {
      enrollmentId: enrollment._id,
      studentId: enrollment.student,
      classId: enrollment.class._id,
      subjectId: enrollment.subject._id,
      attendance: {
        totalClasses,
        attendedClasses,
        percentage: attendancePercentage,
        required: minAttendance,
        eligible: isEligibleByAttendance
      },
      assignments: {
        totalAssignments,
        submittedAssignments,
        percentage: assignmentCompletionPercentage,
        required: minAssignmentCompletion,
        eligible: isEligibleByAssignments
      },
      overallEligibility: {
        isEligible,
        reasons: reasons.length > 0 ? reasons : ['Student meets all eligibility criteria']
      }
    };
  }
  
  async getStudentEligibilityStatus(studentId, semesterId) {
    const enrollments = await Enrollment.find({
      student: studentId,
      semester: semesterId,
      status: 'approved',
      deletedAt: null
    }).populate('class subject');
    
    const eligibilityResults = [];
    
    for (const enrollment of enrollments) {
      const result = await this.calculateEligibility(enrollment._id);
      eligibilityResults.push(result);
    }
    
    return eligibilityResults;
  }
}

export default new AssignmentService();
