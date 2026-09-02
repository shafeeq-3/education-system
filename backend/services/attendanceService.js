import Attendance from '../models/Attendance.js';
import Enrollment from '../models/Enrollment.js';
import Class from '../models/Class.js';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors.js';
import notificationService from './notificationService.js';

class AttendanceService {
  // ==================== ATTENDANCE ====================
  
  async createAttendance(data, userId) {
    // Check if attendance already exists for this class on this date
    const existing = await Attendance.findOne({
      class: data.classId,
      date: data.date,
      deletedAt: null
    });
    
    if (existing) {
      throw new ConflictError('Attendance already exists for this class on this date');
    }
    
    // Get all enrolled students for this class
    const enrollments = await Enrollment.find({
      class: data.classId,
      status: 'approved',
      deletedAt: null
    }).populate('student');
    
    if (enrollments.length === 0) {
      throw new ValidationError('No enrolled students found for this class');
    }
    
    // Create attendance records for all students
    const records = enrollments.map(enrollment => ({
      student: enrollment.student._id,
      enrollment: enrollment._id,
      status: data.defaultStatus || 'absent', // Default to absent
      markedAt: new Date()
    }));
    
    const attendanceData = {
      campus: data.campusId,
      class: data.classId,
      subject: data.subjectId,
      semester: data.semesterId,
      teacher: data.teacherId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      records: records,
      createdBy: userId
    };
    
    const attendance = await Attendance.create(attendanceData);
    
    return await Attendance.findById(attendance._id)
      .populate('campus', 'name code')
      .populate('class', 'name code section')
      .populate('subject', 'name code')
      .populate('teacher', 'profile.firstName profile.lastName email')
      .populate('semester', 'name')
      .populate('records.student', 'profile.firstName profile.lastName email username')
      .populate('records.enrollment', 'status');
  }
  
  async getAttendances(filters, pagination, sort) {
    const query = Attendance.find(filters);
    
    const total = await Attendance.countDocuments(filters);
    
    const attendances = await query
      .populate('campus', 'name code')
      .populate('class', 'name code section')
      .populate('subject', 'name code')
      .populate('teacher', 'profile.firstName profile.lastName email')
      .populate('semester', 'name')
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    return { attendances, total };
  }
  
  async getAttendanceById(id) {
    const attendance = await Attendance.findById(id)
      .populate('campus', 'name code')
      .populate('class', 'name code section maxStudents currentEnrollment')
      .populate('subject', 'name code credits')
      .populate('teacher', 'profile.firstName profile.lastName email profile.phone')
      .populate('semester', 'name startDate endDate')
      .populate('records.student', 'profile.firstName profile.lastName email username')
      .populate('records.enrollment', 'status')
      .populate('lockedBy', 'profile.firstName profile.lastName')
      .populate('createdBy', 'profile.firstName profile.lastName');
    
    if (!attendance) {
      throw new NotFoundError('Attendance not found');
    }
    
    return attendance;
  }
  
  async updateAttendance(id, data, userId) {
    const attendance = await Attendance.findById(id);
    
    if (!attendance) {
      throw new NotFoundError('Attendance not found');
    }
    
    // Check if attendance is locked
    if (attendance.isLocked) {
      throw new ConflictError('Attendance is locked and cannot be modified');
    }
    
    // Update attendance records
    if (data.records && Array.isArray(data.records)) {
      data.records.forEach(update => {
        const record = attendance.records.find(
          r => r.student.toString() === update.studentId.toString()
        );
        
        if (record) {
          record.status = update.status;
          record.markedAt = new Date();
          if (update.remarks) {
            record.remarks = update.remarks;
          }
        }
      });
    }
    
    // Update other fields
    if (data.startTime) attendance.startTime = data.startTime;
    if (data.endTime) attendance.endTime = data.endTime;
    
    attendance.updatedBy = userId;
    
    // Statistics will be recalculated by pre-save middleware
    await attendance.save();
    
    // Update enrollment attendance counts
    await this._updateEnrollmentAttendance(attendance);
    
    return await this.getAttendanceById(id);
  }
  
  async markAttendance(id, studentId, status, remarks, userId) {
    const attendance = await Attendance.findById(id);
    
    if (!attendance) {
      throw new NotFoundError('Attendance not found');
    }
    
    // Check if attendance is locked
    if (attendance.isLocked) {
      throw new ConflictError('Attendance is locked and cannot be modified');
    }
    
    // Find student record
    const record = attendance.records.find(
      r => r.student.toString() === studentId.toString()
    );
    
    if (!record) {
      throw new NotFoundError('Student not found in attendance records');
    }
    
    // Update status
    record.status = status;
    record.markedAt = new Date();
    if (remarks) {
      record.remarks = remarks;
    }
    
    attendance.updatedBy = userId;
    await attendance.save();
    
    // Update enrollment attendance
    await this._updateEnrollmentAttendance(attendance);
    
    return await this.getAttendanceById(id);
  }
  
  async lockAttendance(id, userId) {
    const attendance = await Attendance.findById(id);
    
    if (!attendance) {
      throw new NotFoundError('Attendance not found');
    }
    
    if (attendance.isLocked) {
      throw new ConflictError('Attendance is already locked');
    }
    
    await attendance.lock(userId);
    
    return await this.getAttendanceById(id);
  }
  
  async unlockAttendance(id) {
    const attendance = await Attendance.findById(id);
    
    if (!attendance) {
      throw new NotFoundError('Attendance not found');
    }
    
    if (!attendance.isLocked) {
      throw new ConflictError('Attendance is not locked');
    }
    
    await attendance.unlock();
    
    return await this.getAttendanceById(id);
  }
  
  async deleteAttendance(id) {
    const attendance = await Attendance.findById(id);
    
    if (!attendance) {
      throw new NotFoundError('Attendance not found');
    }
    
    // Check if attendance is locked
    if (attendance.isLocked) {
      throw new ConflictError('Cannot delete locked attendance');
    }
    
    // Soft delete
    attendance.deletedAt = new Date();
    await attendance.save();
    
    // Update enrollment attendance counts
    await this._updateEnrollmentAttendance(attendance, true);
    
    return attendance;
  }
  
  // ==================== HELPER METHODS ====================
  
  async _updateEnrollmentAttendance(attendance, isDeleting = false) {
    // Update attendance counts for all students in this attendance session
    for (const record of attendance.records) {
      const enrollment = await Enrollment.findById(record.enrollment);
      
      if (!enrollment) continue;
      
      // Get all attendance records for this enrollment
      const allAttendances = await Attendance.find({
        class: attendance.class,
        'records.student': record.student,
        deletedAt: null
      });
      
      let totalClasses = 0;
      let attendedClasses = 0;
      
      allAttendances.forEach(session => {
        const studentRecord = session.records.find(
          r => r.student.toString() === record.student.toString()
        );
        if (studentRecord) {
          totalClasses++;
          if (studentRecord.status === 'present') {
            attendedClasses++;
          }
        }
      });
      
      enrollment.totalClasses = totalClasses;
      enrollment.attendedClasses = attendedClasses;
      enrollment.updateAttendancePercentage();
      
      await enrollment.save();
      
      // Trigger notification: Attendance below threshold (75%)
      const ATTENDANCE_THRESHOLD = 75;
      if (enrollment.attendancePercentage < ATTENDANCE_THRESHOLD) {
        const populatedEnrollment = await Enrollment.findById(enrollment._id)
          .populate('student')
          .populate('subject')
          .populate('campus');
        
        notificationService.notifyAttendanceBelowThreshold(
          populatedEnrollment,
          populatedEnrollment.student,
          populatedEnrollment.subject,
          populatedEnrollment.campus._id,
          attendance.createdBy
        ).catch(err => console.error('Notification error:', err));
      }
    }
  }
  
  // ==================== REPORTS ====================
  
  async getStudentAttendanceReport(studentId, classId, startDate, endDate) {
    const filters = {
      class: classId,
      'records.student': studentId,
      deletedAt: null
    };
    
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }
    
    const attendances = await Attendance.find(filters)
      .populate('subject', 'name code')
      .populate('teacher', 'profile.firstName profile.lastName')
      .sort({ date: 1 });
    
    const report = {
      studentId,
      classId,
      period: { startDate, endDate },
      sessions: [],
      summary: {
        totalClasses: 0,
        present: 0,
        absent: 0,
        leave: 0,
        percentage: 0
      }
    };
    
    attendances.forEach(session => {
      const studentRecord = session.records.find(
        r => r.student.toString() === studentId.toString()
      );
      
      if (studentRecord) {
        report.sessions.push({
          date: session.date,
          subject: session.subject,
          teacher: session.teacher,
          status: studentRecord.status,
          remarks: studentRecord.remarks
        });
        
        report.summary.totalClasses++;
        if (studentRecord.status === 'present') report.summary.present++;
        if (studentRecord.status === 'absent') report.summary.absent++;
        if (studentRecord.status === 'leave') report.summary.leave++;
      }
    });
    
    if (report.summary.totalClasses > 0) {
      report.summary.percentage = Math.round(
        (report.summary.present / report.summary.totalClasses) * 100
      );
    }
    
    return report;
  }
  
  async getClassAttendanceReport(classId, date) {
    const attendance = await Attendance.findOne({
      class: classId,
      date: date,
      deletedAt: null
    })
      .populate('class', 'name code section')
      .populate('subject', 'name code')
      .populate('teacher', 'profile.firstName profile.lastName')
      .populate('records.student', 'profile.firstName profile.lastName email username');
    
    if (!attendance) {
      throw new NotFoundError('Attendance not found for this class on this date');
    }
    
    return {
      classId: attendance.class._id,
      className: attendance.class.name,
      date: attendance.date,
      subject: attendance.subject,
      teacher: attendance.teacher,
      statistics: {
        totalStudents: attendance.totalStudents,
        present: attendance.presentCount,
        absent: attendance.absentCount,
        leave: attendance.leaveCount,
        percentage: attendance.attendancePercentage
      },
      records: attendance.records.map(r => ({
        student: r.student,
        status: r.status,
        markedAt: r.markedAt,
        remarks: r.remarks
      }))
    };
  }
}

export default new AttendanceService();
