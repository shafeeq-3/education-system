import Marksheet from '../models/Marksheet.js';
import Transcript from '../models/Transcript.js';
import Enrollment from '../models/Enrollment.js';
import Submission from '../models/Submission.js';
import Assignment from '../models/Assignment.js';
import Subject from '../models/Subject.js';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors.js';
import notificationService from './notificationService.js';

class MarksheetService {
  // ==================== MARKSHEET GENERATION ====================
  
  async generateMarksheet(enrollmentId, examMarks, userId) {
    // Get enrollment with all necessary data
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('student')
      .populate('class')
      .populate('subject')
      .populate('semester')
      .populate('campus');
    
    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }
    
    // STRICT ELIGIBILITY ENFORCEMENT
    if (!enrollment.isEligibleForExam) {
      throw new ValidationError(
        `Student is not eligible for exam. Reason: ${enrollment.eligibilityReason || 'Eligibility criteria not met'}`,
        [{ field: 'eligibility', message: enrollment.eligibilityReason || 'Not eligible' }]
      );
    }
    
    // Check if marksheet already exists
    const existing = await Marksheet.findOne({
      enrollment: enrollmentId,
      subject: enrollment.subject._id,
      semester: enrollment.semester._id,
      deletedAt: null
    });
    
    if (existing) {
      throw new ConflictError('Marksheet already exists for this enrollment');
    }
    
    // Get subject details
    const subject = await Subject.findById(enrollment.subject._id);
    
    // Calculate assignment marks
    const assignments = await Assignment.find({
      class: enrollment.class._id,
      subject: enrollment.subject._id,
      semester: enrollment.semester._id,
      isVisible: true,
      deletedAt: null
    });
    
    const submissions = await Submission.find({
      student: enrollment.student._id,
      assignment: { $in: assignments.map(a => a._id) },
      status: 'graded',
      deletedAt: null
    });
    
    let assignmentTotalMarks = 0;
    let assignmentObtainedMarks = 0;
    
    submissions.forEach(submission => {
      if (submission.adjustedMarks !== null) {
        const assignment = assignments.find(a => a._id.toString() === submission.assignment.toString());
        if (assignment) {
          assignmentTotalMarks += assignment.totalMarks;
          assignmentObtainedMarks += submission.adjustedMarks;
        }
      }
    });
    
    const assignmentPercentage = assignmentTotalMarks > 0 
      ? Math.round((assignmentObtainedMarks / assignmentTotalMarks) * 100)
      : 0;
    
    // Calculate exam marks
    const examTotalMarks = (examMarks.midtermMarks || 0) + (examMarks.finalMarks || 0);
    const examObtainedMarks = (examMarks.midtermObtained || 0) + (examMarks.finalObtained || 0);
    const examPercentage = examTotalMarks > 0
      ? Math.round((examObtainedMarks / examTotalMarks) * 100)
      : 0;
    
    // Calculate total marks
    const totalMarks = assignmentTotalMarks + examTotalMarks;
    const obtainedMarks = assignmentObtainedMarks + examObtainedMarks;
    const percentage = totalMarks > 0
      ? Math.round((obtainedMarks / totalMarks) * 100)
      : 0;
    
    // Create marksheet
    const marksheetData = {
      campus: enrollment.campus._id,
      student: enrollment.student._id,
      enrollment: enrollment._id,
      class: enrollment.class._id,
      subject: enrollment.subject._id,
      semester: enrollment.semester._id,
      academicYear: enrollment.academicYear,
      assignmentMarks: {
        totalAssignments: assignments.length,
        totalMarks: assignmentTotalMarks,
        obtainedMarks: assignmentObtainedMarks,
        percentage: assignmentPercentage
      },
      examMarks: {
        midtermMarks: examMarks.midtermMarks || 0,
        finalMarks: examMarks.finalMarks || 0,
        totalMarks: examTotalMarks,
        obtainedMarks: examObtainedMarks,
        percentage: examPercentage
      },
      totalMarks,
      obtainedMarks,
      percentage,
      attendancePercentage: enrollment.attendancePercentage,
      totalClasses: enrollment.totalClasses,
      attendedClasses: enrollment.attendedClasses,
      isEligible: enrollment.isEligibleForExam,
      eligibilityReason: enrollment.eligibilityReason,
      passingMarks: examMarks.passingMarks || 40,
      remarks: examMarks.remarks,
      teacherRemarks: examMarks.teacherRemarks,
      createdBy: userId
    };
    
    const marksheet = await Marksheet.create(marksheetData);
    
    // Calculate grade and pass/fail
    marksheet.calculateGrade();
    marksheet.determinePassFail();
    await marksheet.save();
    
    // Update enrollment with grade
    enrollment.grade = marksheet.letterGrade;
    enrollment.gradePoints = marksheet.gradePoints;
    if (marksheet.isPassed) {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
    }
    await enrollment.save();
    
    const populatedMarksheet = await this.getMarksheetById(marksheet._id);
    
    // Trigger notification: Marksheet published
    notificationService.notifyMarksheetPublished(
      populatedMarksheet,
      enrollment.student,
      enrollment.subject,
      enrollment.campus._id,
      userId
    ).catch(err => console.error('Notification error:', err));
    
    return populatedMarksheet;
  }
  
  async getMarksheets(filters, pagination, sort) {
    const query = Marksheet.find(filters);
    
    const total = await Marksheet.countDocuments(filters);
    
    const marksheets = await query
      .populate('campus', 'name code')
      .populate('student', 'profile.firstName profile.lastName email username')
      .populate('enrollment', 'status')
      .populate('class', 'name code section')
      .populate('subject', 'name code credits')
      .populate('semester', 'name')
      .populate('academicYear', 'year')
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    return { marksheets, total };
  }
  
  async getMarksheetById(id) {
    const marksheet = await Marksheet.findById(id)
      .populate('campus', 'name code')
      .populate('student', 'profile.firstName profile.lastName email username profile.phone')
      .populate('enrollment', 'status grade gradePoints')
      .populate('class', 'name code section')
      .populate('subject', 'name code credits type')
      .populate('semester', 'name startDate endDate')
      .populate('academicYear', 'year startDate endDate')
      .populate('lockedBy', 'profile.firstName profile.lastName')
      .populate('finalizedBy', 'profile.firstName profile.lastName')
      .populate('createdBy', 'profile.firstName profile.lastName');
    
    if (!marksheet) {
      throw new NotFoundError('Marksheet not found');
    }
    
    return marksheet;
  }
  
  async updateMarksheet(id, data, userId) {
    const marksheet = await Marksheet.findById(id);
    
    if (!marksheet) {
      throw new NotFoundError('Marksheet not found');
    }
    
    // Check if marksheet is locked
    if (marksheet.isLocked) {
      throw new ConflictError('Marksheet is locked and cannot be modified');
    }
    
    // Update exam marks if provided
    if (data.examMarks) {
      if (data.examMarks.midtermMarks !== undefined) {
        marksheet.examMarks.midtermMarks = data.examMarks.midtermMarks;
      }
      if (data.examMarks.finalMarks !== undefined) {
        marksheet.examMarks.finalMarks = data.examMarks.finalMarks;
      }
      if (data.examMarks.obtainedMarks !== undefined) {
        marksheet.examMarks.obtainedMarks = data.examMarks.obtainedMarks;
      }
      
      // Recalculate exam percentage
      if (marksheet.examMarks.totalMarks > 0) {
        marksheet.examMarks.percentage = Math.round(
          (marksheet.examMarks.obtainedMarks / marksheet.examMarks.totalMarks) * 100
        );
      }
    }
    
    // Update remarks
    if (data.remarks !== undefined) marksheet.remarks = data.remarks;
    if (data.teacherRemarks !== undefined) marksheet.teacherRemarks = data.teacherRemarks;
    if (data.passingMarks !== undefined) marksheet.passingMarks = data.passingMarks;
    
    // Recalculate total marks and percentage
    marksheet.totalMarks = marksheet.assignmentMarks.totalMarks + marksheet.examMarks.totalMarks;
    marksheet.obtainedMarks = marksheet.assignmentMarks.obtainedMarks + marksheet.examMarks.obtainedMarks;
    marksheet.percentage = marksheet.totalMarks > 0
      ? Math.round((marksheet.obtainedMarks / marksheet.totalMarks) * 100)
      : 0;
    
    // Recalculate grade and pass/fail
    marksheet.calculateGrade();
    marksheet.determinePassFail();
    
    marksheet.updatedBy = userId;
    await marksheet.save();
    
    // Update enrollment
    const enrollment = await Enrollment.findById(marksheet.enrollment);
    if (enrollment) {
      enrollment.grade = marksheet.letterGrade;
      enrollment.gradePoints = marksheet.gradePoints;
      await enrollment.save();
    }
    
    return await this.getMarksheetById(id);
  }
  
  async lockMarksheet(id, userId) {
    const marksheet = await Marksheet.findById(id);
    
    if (!marksheet) {
      throw new NotFoundError('Marksheet not found');
    }
    
    if (marksheet.isLocked) {
      throw new ConflictError('Marksheet is already locked');
    }
    
    await marksheet.lock(userId);
    
    return await this.getMarksheetById(id);
  }
  
  async unlockMarksheet(id) {
    const marksheet = await Marksheet.findById(id);
    
    if (!marksheet) {
      throw new NotFoundError('Marksheet not found');
    }
    
    if (!marksheet.isLocked) {
      throw new ConflictError('Marksheet is not locked');
    }
    
    await marksheet.unlock();
    
    return await this.getMarksheetById(id);
  }
  
  async finalizeMarksheet(id, userId) {
    const marksheet = await Marksheet.findById(id);
    
    if (!marksheet) {
      throw new NotFoundError('Marksheet not found');
    }
    
    if (marksheet.isFinalized) {
      throw new ConflictError('Marksheet is already finalized');
    }
    
    await marksheet.finalize(userId);
    
    return await this.getMarksheetById(id);
  }
  
  async deleteMarksheet(id) {
    const marksheet = await Marksheet.findById(id);
    
    if (!marksheet) {
      throw new NotFoundError('Marksheet not found');
    }
    
    // Check if marksheet is locked or finalized
    if (marksheet.isLocked || marksheet.isFinalized) {
      throw new ConflictError('Cannot delete locked or finalized marksheet');
    }
    
    // Soft delete
    marksheet.deletedAt = new Date();
    await marksheet.save();
    
    return marksheet;
  }
  
  // ==================== TRANSCRIPT MANAGEMENT ====================
  
  async generateTranscript(studentId, programId, academicYearId, userId) {
    // Check if transcript already exists
    const existing = await Transcript.findOne({
      student: studentId,
      program: programId,
      academicYear: academicYearId,
      deletedAt: null
    });
    
    if (existing) {
      // Update existing transcript
      return await this.updateTranscript(existing._id, userId);
    }
    
    // Get student enrollment
    const enrollment = await Enrollment.findOne({
      student: studentId,
      academicYear: academicYearId,
      deletedAt: null
    }).populate('campus');
    
    if (!enrollment) {
      throw new NotFoundError('No enrollment found for student');
    }
    
    // Create new transcript
    const transcriptData = {
      campus: enrollment.campus._id,
      student: studentId,
      program: programId,
      academicYear: academicYearId,
      semesters: [],
      createdBy: userId
    };
    
    const transcript = await Transcript.create(transcriptData);
    
    // Update with semester data
    return await this.updateTranscript(transcript._id, userId);
  }
  
  async updateTranscript(id, userId) {
    const transcript = await Transcript.findById(id);
    
    if (!transcript) {
      throw new NotFoundError('Transcript not found');
    }
    
    // Check if transcript is locked
    if (transcript.isLocked) {
      throw new ConflictError('Transcript is locked and cannot be modified');
    }
    
    // Get all marksheets for this student
    const marksheets = await Marksheet.find({
      student: transcript.student,
      isFinalized: true,
      deletedAt: null
    })
      .populate('semester', 'name')
      .populate('subject', 'name code credits')
      .sort({ 'semester.startDate': 1 });
    
    // Group marksheets by semester
    const semesterMap = new Map();
    
    marksheets.forEach(marksheet => {
      const semesterId = marksheet.semester._id.toString();
      
      if (!semesterMap.has(semesterId)) {
        semesterMap.set(semesterId, {
          semester: marksheet.semester._id,
          semesterName: marksheet.semester.name,
          subjects: [],
          totalCredits: 0,
          earnedCredits: 0,
          semesterGPA: 0,
          semesterPercentage: 0,
          isPassed: true
        });
      }
      
      const semesterData = semesterMap.get(semesterId);
      
      semesterData.subjects.push({
        subject: marksheet.subject._id,
        subjectName: marksheet.subject.name,
        subjectCode: marksheet.subject.code,
        credits: marksheet.subject.credits,
        totalMarks: marksheet.totalMarks,
        obtainedMarks: marksheet.obtainedMarks,
        percentage: marksheet.percentage,
        letterGrade: marksheet.letterGrade,
        gradePoints: marksheet.gradePoints,
        isPassed: marksheet.isPassed
      });
      
      semesterData.totalCredits += marksheet.subject.credits;
      if (marksheet.isPassed) {
        semesterData.earnedCredits += marksheet.subject.credits;
      } else {
        semesterData.isPassed = false;
      }
    });
    
    // Calculate semester GPA and percentage
    semesterMap.forEach((semesterData) => {
      let totalGradePoints = 0;
      let totalMarks = 0;
      let obtainedMarks = 0;
      
      semesterData.subjects.forEach(subject => {
        if (subject.gradePoints !== null && subject.credits) {
          totalGradePoints += subject.gradePoints * subject.credits;
        }
        totalMarks += subject.totalMarks;
        obtainedMarks += subject.obtainedMarks;
      });
      
      semesterData.semesterGPA = semesterData.totalCredits > 0
        ? Math.round((totalGradePoints / semesterData.totalCredits) * 100) / 100
        : 0;
      
      semesterData.semesterPercentage = totalMarks > 0
        ? Math.round((obtainedMarks / totalMarks) * 100)
        : 0;
    });
    
    // Update transcript
    transcript.semesters = Array.from(semesterMap.values());
    transcript.calculateCumulativeGPA();
    transcript.calculateCumulativePercentage();
    transcript.determineAcademicStatus();
    transcript.updatedBy = userId;
    
    await transcript.save();
    
    return await this.getTranscriptById(id);
  }
  
  async getTranscripts(filters, pagination, sort) {
    const query = Transcript.find(filters);
    
    const total = await Transcript.countDocuments(filters);
    
    const transcripts = await query
      .populate('campus', 'name code')
      .populate('student', 'profile.firstName profile.lastName email username')
      .populate('program', 'name code')
      .populate('academicYear', 'year')
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    return { transcripts, total };
  }
  
  async getTranscriptById(id) {
    const transcript = await Transcript.findById(id)
      .populate('campus', 'name code')
      .populate('student', 'profile.firstName profile.lastName email username profile.phone')
      .populate('program', 'name code duration degreeType')
      .populate('academicYear', 'year startDate endDate')
      .populate('semesters.semester', 'name startDate endDate')
      .populate('semesters.subjects.subject', 'name code credits type')
      .populate('lockedBy', 'profile.firstName profile.lastName')
      .populate('createdBy', 'profile.firstName profile.lastName');
    
    if (!transcript) {
      throw new NotFoundError('Transcript not found');
    }
    
    return transcript;
  }
  
  async lockTranscript(id, userId) {
    const transcript = await Transcript.findById(id);
    
    if (!transcript) {
      throw new NotFoundError('Transcript not found');
    }
    
    if (transcript.isLocked) {
      throw new ConflictError('Transcript is already locked');
    }
    
    await transcript.lock(userId);
    
    return await this.getTranscriptById(id);
  }
  
  async unlockTranscript(id) {
    const transcript = await Transcript.findById(id);
    
    if (!transcript) {
      throw new NotFoundError('Transcript not found');
    }
    
    if (!transcript.isLocked) {
      throw new ConflictError('Transcript is not locked');
    }
    
    await transcript.unlock();
    
    return await this.getTranscriptById(id);
  }
  
  async deleteTranscript(id) {
    const transcript = await Transcript.findById(id);
    
    if (!transcript) {
      throw new NotFoundError('Transcript not found');
    }
    
    // Check if transcript is locked
    if (transcript.isLocked) {
      throw new ConflictError('Cannot delete locked transcript');
    }
    
    // Soft delete
    transcript.deletedAt = new Date();
    await transcript.save();
    
    return transcript;
  }
}

export default new MarksheetService();
