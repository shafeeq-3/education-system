import { ValidationError } from '../utils/errors.js';

// ==================== CLASSES ====================

export const createClassSchema = (data) => {
  const errors = [];
  
  if (!data.campusId) errors.push({ field: 'campusId', message: 'Campus is required' });
  if (!data.departmentId) errors.push({ field: 'departmentId', message: 'Department is required' });
  if (!data.programId) errors.push({ field: 'programId', message: 'Program is required' });
  if (!data.semesterId) errors.push({ field: 'semesterId', message: 'Semester is required' });
  if (!data.subjectId) errors.push({ field: 'subjectId', message: 'Subject is required' });
  if (!data.name) errors.push({ field: 'name', message: 'Class name is required' });
  if (!data.code) errors.push({ field: 'code', message: 'Class code is required' });
  if (!data.section) errors.push({ field: 'section', message: 'Section is required' });
  if (!data.maxStudents) errors.push({ field: 'maxStudents', message: 'Maximum students is required' });
  
  if (data.maxStudents && data.maxStudents < 1) {
    errors.push({ field: 'maxStudents', message: 'Maximum students must be at least 1' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

export const updateClassSchema = (data) => {
  const errors = [];
  
  if (data.maxStudents && data.maxStudents < 1) {
    errors.push({ field: 'maxStudents', message: 'Maximum students must be at least 1' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

// ==================== TIMETABLES ====================

export const createTimetableSchema = (data) => {
  const errors = [];
  
  if (!data.campusId) errors.push({ field: 'campusId', message: 'Campus is required' });
  if (!data.classId) errors.push({ field: 'classId', message: 'Class is required' });
  if (!data.teacherId) errors.push({ field: 'teacherId', message: 'Teacher is required' });
  if (!data.subjectId) errors.push({ field: 'subjectId', message: 'Subject is required' });
  if (!data.semesterId) errors.push({ field: 'semesterId', message: 'Semester is required' });
  if (!data.dayOfWeek) errors.push({ field: 'dayOfWeek', message: 'Day of week is required' });
  if (!data.startTime) errors.push({ field: 'startTime', message: 'Start time is required' });
  if (!data.endTime) errors.push({ field: 'endTime', message: 'End time is required' });
  if (!data.room) errors.push({ field: 'room', message: 'Room is required' });
  
  // Validate day of week
  const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  if (data.dayOfWeek && !validDays.includes(data.dayOfWeek)) {
    errors.push({ field: 'dayOfWeek', message: 'Invalid day of week' });
  }
  
  // Validate time format (HH:MM)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (data.startTime && !timeRegex.test(data.startTime)) {
    errors.push({ field: 'startTime', message: 'Start time must be in HH:MM format' });
  }
  if (data.endTime && !timeRegex.test(data.endTime)) {
    errors.push({ field: 'endTime', message: 'End time must be in HH:MM format' });
  }
  
  // Validate type
  const validTypes = ['lecture', 'lab', 'tutorial', 'seminar'];
  if (data.type && !validTypes.includes(data.type)) {
    errors.push({ field: 'type', message: 'Invalid timetable type' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

export const updateTimetableSchema = (data) => {
  const errors = [];
  
  // Validate day of week if provided
  const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  if (data.dayOfWeek && !validDays.includes(data.dayOfWeek)) {
    errors.push({ field: 'dayOfWeek', message: 'Invalid day of week' });
  }
  
  // Validate time format if provided
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (data.startTime && !timeRegex.test(data.startTime)) {
    errors.push({ field: 'startTime', message: 'Start time must be in HH:MM format' });
  }
  if (data.endTime && !timeRegex.test(data.endTime)) {
    errors.push({ field: 'endTime', message: 'End time must be in HH:MM format' });
  }
  
  // Validate type if provided
  const validTypes = ['lecture', 'lab', 'tutorial', 'seminar'];
  if (data.type && !validTypes.includes(data.type)) {
    errors.push({ field: 'type', message: 'Invalid timetable type' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

// ==================== ENROLLMENTS ====================

export const createEnrollmentSchema = (data) => {
  const errors = [];
  
  if (!data.campusId) errors.push({ field: 'campusId', message: 'Campus is required' });
  if (!data.studentId) errors.push({ field: 'studentId', message: 'Student is required' });
  if (!data.classId) errors.push({ field: 'classId', message: 'Class is required' });
  if (!data.subjectId) errors.push({ field: 'subjectId', message: 'Subject is required' });
  if (!data.semesterId) errors.push({ field: 'semesterId', message: 'Semester is required' });
  if (!data.academicYearId) errors.push({ field: 'academicYearId', message: 'Academic year is required' });
  
  // Validate status if provided
  const validStatuses = ['pending', 'approved', 'rejected', 'dropped', 'completed'];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push({ field: 'status', message: 'Invalid enrollment status' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

export const updateEnrollmentSchema = (data) => {
  const errors = [];
  
  // Validate status if provided
  const validStatuses = ['pending', 'approved', 'rejected', 'dropped', 'completed'];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push({ field: 'status', message: 'Invalid enrollment status' });
  }
  
  // Validate grade if provided
  const validGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'I', 'W'];
  if (data.grade && !validGrades.includes(data.grade)) {
    errors.push({ field: 'grade', message: 'Invalid grade' });
  }
  
  // Validate grade points if provided
  if (data.gradePoints !== undefined && (data.gradePoints < 0 || data.gradePoints > 4)) {
    errors.push({ field: 'gradePoints', message: 'Grade points must be between 0 and 4' });
  }
  
  // Validate attendance if provided
  if (data.totalClasses !== undefined && data.totalClasses < 0) {
    errors.push({ field: 'totalClasses', message: 'Total classes cannot be negative' });
  }
  if (data.attendedClasses !== undefined && data.attendedClasses < 0) {
    errors.push({ field: 'attendedClasses', message: 'Attended classes cannot be negative' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

export const rejectEnrollmentSchema = (data) => {
  const errors = [];
  
  if (!data.reason) {
    errors.push({ field: 'reason', message: 'Rejection reason is required' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};
