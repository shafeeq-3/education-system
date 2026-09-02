import { ValidationError } from '../utils/errors.js';

// ==================== ASSIGNMENTS ====================

export const createAssignmentSchema = (data) => {
  const errors = [];
  
  if (!data.campusId) errors.push({ field: 'campusId', message: 'Campus is required' });
  if (!data.classId) errors.push({ field: 'classId', message: 'Class is required' });
  if (!data.subjectId) errors.push({ field: 'subjectId', message: 'Subject is required' });
  if (!data.teacherId) errors.push({ field: 'teacherId', message: 'Teacher is required' });
  if (!data.semesterId) errors.push({ field: 'semesterId', message: 'Semester is required' });
  if (!data.title) errors.push({ field: 'title', message: 'Title is required' });
  if (!data.description) errors.push({ field: 'description', message: 'Description is required' });
  if (!data.type) errors.push({ field: 'type', message: 'Assignment type is required' });
  if (!data.totalMarks) errors.push({ field: 'totalMarks', message: 'Total marks is required' });
  if (!data.dueDate) errors.push({ field: 'dueDate', message: 'Due date is required' });
  
  // Validate type
  const validTypes = ['quiz', 'homework', 'project', 'exam'];
  if (data.type && !validTypes.includes(data.type)) {
    errors.push({ field: 'type', message: 'Invalid assignment type' });
  }
  
  // Validate total marks
  if (data.totalMarks && data.totalMarks < 1) {
    errors.push({ field: 'totalMarks', message: 'Total marks must be at least 1' });
  }
  
  // Validate late penalty type
  const validPenaltyTypes = ['percentage', 'fixed', 'none'];
  if (data.latePenaltyType && !validPenaltyTypes.includes(data.latePenaltyType)) {
    errors.push({ field: 'latePenaltyType', message: 'Invalid late penalty type' });
  }
  
  // Validate late penalty value
  if (data.latePenaltyValue && data.latePenaltyValue < 0) {
    errors.push({ field: 'latePenaltyValue', message: 'Late penalty value cannot be negative' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

export const updateAssignmentSchema = (data) => {
  const errors = [];
  
  // Validate type if provided
  const validTypes = ['quiz', 'homework', 'project', 'exam'];
  if (data.type && !validTypes.includes(data.type)) {
    errors.push({ field: 'type', message: 'Invalid assignment type' });
  }
  
  // Validate total marks if provided
  if (data.totalMarks && data.totalMarks < 1) {
    errors.push({ field: 'totalMarks', message: 'Total marks must be at least 1' });
  }
  
  // Validate late penalty type if provided
  const validPenaltyTypes = ['percentage', 'fixed', 'none'];
  if (data.latePenaltyType && !validPenaltyTypes.includes(data.latePenaltyType)) {
    errors.push({ field: 'latePenaltyType', message: 'Invalid late penalty type' });
  }
  
  // Validate late penalty value if provided
  if (data.latePenaltyValue && data.latePenaltyValue < 0) {
    errors.push({ field: 'latePenaltyValue', message: 'Late penalty value cannot be negative' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

// ==================== SUBMISSIONS ====================

export const createSubmissionSchema = (data) => {
  const errors = [];
  
  if (!data.campusId) errors.push({ field: 'campusId', message: 'Campus is required' });
  if (!data.assignmentId) errors.push({ field: 'assignmentId', message: 'Assignment is required' });
  if (!data.studentId) errors.push({ field: 'studentId', message: 'Student is required' });
  if (!data.enrollmentId) errors.push({ field: 'enrollmentId', message: 'Enrollment is required' });
  if (!data.classId) errors.push({ field: 'classId', message: 'Class is required' });
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

export const gradeSubmissionSchema = (data) => {
  const errors = [];
  
  if (data.marksObtained === undefined || data.marksObtained === null) {
    errors.push({ field: 'marksObtained', message: 'Marks obtained is required' });
  }
  
  if (data.marksObtained && data.marksObtained < 0) {
    errors.push({ field: 'marksObtained', message: 'Marks obtained cannot be negative' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

// ==================== ATTENDANCE ====================

export const createAttendanceSchema = (data) => {
  const errors = [];
  
  if (!data.campusId) errors.push({ field: 'campusId', message: 'Campus is required' });
  if (!data.classId) errors.push({ field: 'classId', message: 'Class is required' });
  if (!data.subjectId) errors.push({ field: 'subjectId', message: 'Subject is required' });
  if (!data.semesterId) errors.push({ field: 'semesterId', message: 'Semester is required' });
  if (!data.teacherId) errors.push({ field: 'teacherId', message: 'Teacher is required' });
  if (!data.date) errors.push({ field: 'date', message: 'Date is required' });
  
  // Validate time format if provided
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (data.startTime && !timeRegex.test(data.startTime)) {
    errors.push({ field: 'startTime', message: 'Start time must be in HH:MM format' });
  }
  if (data.endTime && !timeRegex.test(data.endTime)) {
    errors.push({ field: 'endTime', message: 'End time must be in HH:MM format' });
  }
  
  // Validate default status if provided
  const validStatuses = ['present', 'absent', 'leave'];
  if (data.defaultStatus && !validStatuses.includes(data.defaultStatus)) {
    errors.push({ field: 'defaultStatus', message: 'Invalid default status' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

export const updateAttendanceSchema = (data) => {
  const errors = [];
  
  // Validate time format if provided
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (data.startTime && !timeRegex.test(data.startTime)) {
    errors.push({ field: 'startTime', message: 'Start time must be in HH:MM format' });
  }
  if (data.endTime && !timeRegex.test(data.endTime)) {
    errors.push({ field: 'endTime', message: 'End time must be in HH:MM format' });
  }
  
  // Validate records if provided
  if (data.records && Array.isArray(data.records)) {
    const validStatuses = ['present', 'absent', 'leave'];
    data.records.forEach((record, index) => {
      if (!record.studentId) {
        errors.push({ field: `records[${index}].studentId`, message: 'Student ID is required' });
      }
      if (!record.status) {
        errors.push({ field: `records[${index}].status`, message: 'Status is required' });
      }
      if (record.status && !validStatuses.includes(record.status)) {
        errors.push({ field: `records[${index}].status`, message: 'Invalid status' });
      }
    });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

export const markAttendanceSchema = (data) => {
  const errors = [];
  
  if (!data.studentId) errors.push({ field: 'studentId', message: 'Student ID is required' });
  if (!data.status) errors.push({ field: 'status', message: 'Status is required' });
  
  // Validate status
  const validStatuses = ['present', 'absent', 'leave'];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push({ field: 'status', message: 'Invalid status' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};
