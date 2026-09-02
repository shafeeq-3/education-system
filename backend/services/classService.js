import Class from '../models/Class.js';
import Timetable from '../models/Timetable.js';
import Enrollment from '../models/Enrollment.js';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors.js';

class ClassService {
  // ==================== CLASSES ====================
  
  async createClass(data, userId) {
    // Check if class code already exists for this campus
    const existing = await Class.findOne({
      code: data.code,
      campus: data.campusId,
      deletedAt: null
    });
    
    if (existing) {
      throw new ConflictError('Class code already exists for this campus');
    }
    
    const classData = {
      campus: data.campusId,
      department: data.departmentId,
      program: data.programId,
      semester: data.semesterId,
      subject: data.subjectId,
      name: data.name,
      code: data.code,
      section: data.section,
      maxStudents: data.maxStudents,
      teacher: data.teacherId,
      room: data.room,
      building: data.building,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdBy: userId
    };
    
    const newClass = await Class.create(classData);
    return await Class.findById(newClass._id)
      .populate('campus', 'name code')
      .populate('department', 'name code')
      .populate('program', 'name code')
      .populate('semester', 'name')
      .populate('subject', 'name code credits')
      .populate('teacher', 'profile.firstName profile.lastName email');
  }
  
  async getClasses(filters, pagination, sort) {
    const query = Class.find(filters);
    
    const total = await Class.countDocuments(filters);
    
    const classes = await query
      .populate('campus', 'name code')
      .populate('department', 'name code')
      .populate('program', 'name code')
      .populate('semester', 'name')
      .populate('subject', 'name code credits')
      .populate('teacher', 'profile.firstName profile.lastName email')
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    return { classes, total };
  }
  
  async getClassById(id) {
    const classDoc = await Class.findById(id)
      .populate('campus', 'name code')
      .populate('department', 'name code')
      .populate('program', 'name code')
      .populate('semester', 'name startDate endDate')
      .populate('subject', 'name code credits type')
      .populate('teacher', 'profile.firstName profile.lastName email profile.phone')
      .populate('createdBy', 'profile.firstName profile.lastName');
    
    if (!classDoc) {
      throw new NotFoundError('Class not found');
    }
    
    return classDoc;
  }
  
  async updateClass(id, data) {
    const classDoc = await Class.findById(id);
    
    if (!classDoc) {
      throw new NotFoundError('Class not found');
    }
    
    // Check code uniqueness if code is being updated
    if (data.code && data.code !== classDoc.code) {
      const existing = await Class.findOne({
        code: data.code,
        campus: classDoc.campus,
        _id: { $ne: id },
        deletedAt: null
      });
      
      if (existing) {
        throw new ConflictError('Class code already exists for this campus');
      }
    }
    
    // Update fields
    const allowedUpdates = [
      'name', 'code', 'section', 'maxStudents', 'teacher',
      'room', 'building', 'isActive'
    ];
    
    allowedUpdates.forEach(field => {
      if (data[field] !== undefined) {
        classDoc[field] = data[field];
      }
    });
    
    await classDoc.save();
    
    return await Class.findById(id)
      .populate('campus', 'name code')
      .populate('department', 'name code')
      .populate('program', 'name code')
      .populate('semester', 'name')
      .populate('subject', 'name code credits')
      .populate('teacher', 'profile.firstName profile.lastName email');
  }
  
  async deleteClass(id) {
    const classDoc = await Class.findById(id);
    
    if (!classDoc) {
      throw new NotFoundError('Class not found');
    }
    
    // Check if class has enrollments
    const enrollmentCount = await Enrollment.countDocuments({
      class: id,
      status: { $in: ['approved', 'pending'] },
      deletedAt: null
    });
    
    if (enrollmentCount > 0) {
      throw new ConflictError('Cannot delete class with active enrollments');
    }
    
    // Soft delete
    classDoc.deletedAt = new Date();
    await classDoc.save();
    
    // Also soft delete associated timetables
    await Timetable.updateMany(
      { class: id, deletedAt: null },
      { deletedAt: new Date() }
    );
    
    return classDoc;
  }
  
  // ==================== TIMETABLES ====================
  
  async createTimetable(data, userId) {
    // Validate time format and logic
    const startMinutes = this._timeToMinutes(data.startTime);
    const endMinutes = this._timeToMinutes(data.endTime);
    
    if (endMinutes <= startMinutes) {
      throw new ValidationError('End time must be after start time');
    }
    
    // Check for conflicts
    await this._checkTimetableConflicts(data);
    
    const timetableData = {
      campus: data.campusId,
      class: data.classId,
      teacher: data.teacherId,
      subject: data.subjectId,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      room: data.room,
      building: data.building,
      type: data.type || 'lecture',
      semester: data.semesterId,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdBy: userId
    };
    
    const timetable = await Timetable.create(timetableData);
    return await Timetable.findById(timetable._id)
      .populate('campus', 'name code')
      .populate('class', 'name code section')
      .populate('teacher', 'profile.firstName profile.lastName email')
      .populate('subject', 'name code')
      .populate('semester', 'name');
  }
  
  async _checkTimetableConflicts(data) {
    const conflicts = [];
    
    // Check teacher conflict
    const teacherConflict = await Timetable.findOne({
      teacher: data.teacherId,
      dayOfWeek: data.dayOfWeek,
      semester: data.semesterId,
      deletedAt: null,
      _id: { $ne: data.excludeId } // For updates
    });
    
    if (teacherConflict && teacherConflict.hasTimeOverlap(data.startTime, data.endTime)) {
      conflicts.push('Teacher has another class at this time');
    }
    
    // Check room conflict
    const roomConflict = await Timetable.findOne({
      room: data.room,
      dayOfWeek: data.dayOfWeek,
      semester: data.semesterId,
      deletedAt: null,
      _id: { $ne: data.excludeId }
    });
    
    if (roomConflict && roomConflict.hasTimeOverlap(data.startTime, data.endTime)) {
      conflicts.push('Room is already booked at this time');
    }
    
    // Check class conflict (students can't have two classes at same time)
    const classConflict = await Timetable.findOne({
      class: data.classId,
      dayOfWeek: data.dayOfWeek,
      semester: data.semesterId,
      deletedAt: null,
      _id: { $ne: data.excludeId }
    });
    
    if (classConflict && classConflict.hasTimeOverlap(data.startTime, data.endTime)) {
      conflicts.push('Class already has a schedule at this time');
    }
    
    if (conflicts.length > 0) {
      throw new ConflictError(`Timetable conflicts: ${conflicts.join(', ')}`);
    }
  }
  
  _timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
  
  async getTimetables(filters, pagination, sort) {
    const query = Timetable.find(filters);
    
    const total = await Timetable.countDocuments(filters);
    
    const timetables = await query
      .populate('campus', 'name code')
      .populate('class', 'name code section')
      .populate('teacher', 'profile.firstName profile.lastName email')
      .populate('subject', 'name code')
      .populate('semester', 'name')
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    return { timetables, total };
  }
  
  async getTimetableById(id) {
    const timetable = await Timetable.findById(id)
      .populate('campus', 'name code')
      .populate('class', 'name code section maxStudents currentEnrollment')
      .populate('teacher', 'profile.firstName profile.lastName email profile.phone')
      .populate('subject', 'name code credits type')
      .populate('semester', 'name startDate endDate')
      .populate('createdBy', 'profile.firstName profile.lastName');
    
    if (!timetable) {
      throw new NotFoundError('Timetable not found');
    }
    
    return timetable;
  }
  
  async updateTimetable(id, data) {
    const timetable = await Timetable.findById(id);
    
    if (!timetable) {
      throw new NotFoundError('Timetable not found');
    }
    
    // Prepare conflict check data
    const conflictData = {
      teacherId: data.teacherId || timetable.teacher,
      classId: data.classId || timetable.class,
      room: data.room || timetable.room,
      dayOfWeek: data.dayOfWeek || timetable.dayOfWeek,
      startTime: data.startTime || timetable.startTime,
      endTime: data.endTime || timetable.endTime,
      semesterId: data.semesterId || timetable.semester,
      excludeId: id
    };
    
    // Check for conflicts
    await this._checkTimetableConflicts(conflictData);
    
    // Update fields
    const allowedUpdates = [
      'teacher', 'dayOfWeek', 'startTime', 'endTime',
      'room', 'building', 'type', 'isActive'
    ];
    
    allowedUpdates.forEach(field => {
      if (data[field] !== undefined) {
        timetable[field] = data[field];
      }
    });
    
    await timetable.save();
    
    return await Timetable.findById(id)
      .populate('campus', 'name code')
      .populate('class', 'name code section')
      .populate('teacher', 'profile.firstName profile.lastName email')
      .populate('subject', 'name code')
      .populate('semester', 'name');
  }
  
  async deleteTimetable(id) {
    const timetable = await Timetable.findById(id);
    
    if (!timetable) {
      throw new NotFoundError('Timetable not found');
    }
    
    // Soft delete
    timetable.deletedAt = new Date();
    await timetable.save();
    
    return timetable;
  }
  
  // ==================== ENROLLMENTS ====================
  
  async createEnrollment(data, userId) {
    // Check if student is already enrolled in this class
    const existing = await Enrollment.findOne({
      student: data.studentId,
      class: data.classId,
      semester: data.semesterId,
      deletedAt: null
    });
    
    if (existing) {
      throw new ConflictError('Student is already enrolled in this class');
    }
    
    // Check class capacity
    const classDoc = await Class.findById(data.classId);
    if (!classDoc) {
      throw new NotFoundError('Class not found');
    }
    
    if (classDoc.currentEnrollment >= classDoc.maxStudents) {
      throw new ConflictError('Class is full');
    }
    
    const enrollmentData = {
      campus: data.campusId,
      student: data.studentId,
      class: data.classId,
      subject: data.subjectId,
      semester: data.semesterId,
      academicYear: data.academicYearId,
      status: data.status || 'pending',
      createdBy: userId
    };
    
    const enrollment = await Enrollment.create(enrollmentData);
    
    // Update class enrollment count if approved
    if (enrollment.status === 'approved') {
      classDoc.currentEnrollment += 1;
      await classDoc.save();
    }
    
    return await Enrollment.findById(enrollment._id)
      .populate('campus', 'name code')
      .populate('student', 'profile.firstName profile.lastName email username')
      .populate('class', 'name code section')
      .populate('subject', 'name code credits')
      .populate('semester', 'name')
      .populate('academicYear', 'year');
  }
  
  async getEnrollments(filters, pagination, sort) {
    const query = Enrollment.find(filters);
    
    const total = await Enrollment.countDocuments(filters);
    
    const enrollments = await query
      .populate('campus', 'name code')
      .populate('student', 'profile.firstName profile.lastName email username')
      .populate('class', 'name code section')
      .populate('subject', 'name code credits')
      .populate('semester', 'name')
      .populate('academicYear', 'year')
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);
    
    return { enrollments, total };
  }
  
  async getEnrollmentById(id) {
    const enrollment = await Enrollment.findById(id)
      .populate('campus', 'name code')
      .populate('student', 'profile.firstName profile.lastName email username profile.phone')
      .populate('class', 'name code section maxStudents currentEnrollment')
      .populate('subject', 'name code credits type')
      .populate('semester', 'name startDate endDate')
      .populate('academicYear', 'year startDate endDate')
      .populate('approvedBy', 'profile.firstName profile.lastName')
      .populate('rejectedBy', 'profile.firstName profile.lastName')
      .populate('createdBy', 'profile.firstName profile.lastName');
    
    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }
    
    return enrollment;
  }
  
  async updateEnrollment(id, data) {
    const enrollment = await Enrollment.findById(id);
    
    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }
    
    const oldStatus = enrollment.status;
    
    // Update fields
    const allowedUpdates = [
      'status', 'grade', 'gradePoints', 'totalClasses', 'attendedClasses',
      'isEligibleForExam', 'eligibilityReason'
    ];
    
    allowedUpdates.forEach(field => {
      if (data[field] !== undefined) {
        enrollment[field] = data[field];
      }
    });
    
    // Update attendance percentage if attendance data changed
    if (data.totalClasses !== undefined || data.attendedClasses !== undefined) {
      enrollment.updateAttendancePercentage();
    }
    
    await enrollment.save();
    
    // Update class enrollment count if status changed
    if (oldStatus !== enrollment.status) {
      const classDoc = await Class.findById(enrollment.class);
      
      if (oldStatus === 'approved' && enrollment.status !== 'approved') {
        classDoc.currentEnrollment = Math.max(0, classDoc.currentEnrollment - 1);
      } else if (oldStatus !== 'approved' && enrollment.status === 'approved') {
        classDoc.currentEnrollment += 1;
      }
      
      await classDoc.save();
    }
    
    return await Enrollment.findById(id)
      .populate('campus', 'name code')
      .populate('student', 'profile.firstName profile.lastName email')
      .populate('class', 'name code section')
      .populate('subject', 'name code credits')
      .populate('semester', 'name')
      .populate('academicYear', 'year');
  }
  
  async approveEnrollment(id, userId) {
    const enrollment = await Enrollment.findById(id);
    
    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }
    
    if (enrollment.status === 'approved') {
      throw new ConflictError('Enrollment is already approved');
    }
    
    // Check class capacity
    const classDoc = await Class.findById(enrollment.class);
    if (classDoc.currentEnrollment >= classDoc.maxStudents) {
      throw new ConflictError('Class is full');
    }
    
    enrollment.status = 'approved';
    enrollment.approvedBy = userId;
    enrollment.approvedAt = new Date();
    await enrollment.save();
    
    // Update class enrollment count
    classDoc.currentEnrollment += 1;
    await classDoc.save();
    
    return await this.getEnrollmentById(id);
  }
  
  async rejectEnrollment(id, userId, reason) {
    const enrollment = await Enrollment.findById(id);
    
    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }
    
    if (enrollment.status !== 'pending') {
      throw new ConflictError('Can only reject pending enrollments');
    }
    
    enrollment.status = 'rejected';
    enrollment.rejectedBy = userId;
    enrollment.rejectedAt = new Date();
    enrollment.rejectionReason = reason;
    await enrollment.save();
    
    return await this.getEnrollmentById(id);
  }
  
  async deleteEnrollment(id) {
    const enrollment = await Enrollment.findById(id);
    
    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }
    
    // Update class enrollment count if enrollment was approved
    if (enrollment.status === 'approved') {
      const classDoc = await Class.findById(enrollment.class);
      classDoc.currentEnrollment = Math.max(0, classDoc.currentEnrollment - 1);
      await classDoc.save();
    }
    
    // Soft delete
    enrollment.deletedAt = new Date();
    await enrollment.save();
    
    return enrollment;
  }
}

export default new ClassService();
