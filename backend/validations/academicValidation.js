import { ValidationError } from '../utils/errors.js';

// ==================== INSTITUTES ====================

export const createInstituteSchema = (data) => {
  const errors = [];
  
  if (!data.name) errors.push({ field: 'name', message: 'Institute name is required' });
  if (!data.code) errors.push({ field: 'code', message: 'Institute code is required' });
  
  if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

export const updateInstituteSchema = createInstituteSchema;

// ==================== CAMPUSES ====================

export const createCampusSchema = (data) => {
  const errors = [];
  
  if (!data.instituteId) errors.push({ field: 'instituteId', message: 'Institute is required' });
  if (!data.name) errors.push({ field: 'name', message: 'Campus name is required' });
  if (!data.code) errors.push({ field: 'code', message: 'Campus code is required' });
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

export const updateCampusSchema = (data) => {
  const errors = [];
  
  if (data.name && !data.name.trim()) {
    errors.push({ field: 'name', message: 'Campus name cannot be empty' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

// ==================== DEPARTMENTS ====================

export const createDepartmentSchema = (data) => {
  const errors = [];
  
  if (!data.campusId) errors.push({ field: 'campusId', message: 'Campus is required' });
  if (!data.name) errors.push({ field: 'name', message: 'Department name is required' });
  if (!data.code) errors.push({ field: 'code', message: 'Department code is required' });
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

export const updateDepartmentSchema = (data) => {
  const errors = [];
  
  if (data.name && !data.name.trim()) {
    errors.push({ field: 'name', message: 'Department name cannot be empty' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

// ==================== PROGRAMS ====================

export const createProgramSchema = (data) => {
  const errors = [];
  
  if (!data.campusId) errors.push({ field: 'campusId', message: 'Campus is required' });
  if (!data.departmentId) errors.push({ field: 'departmentId', message: 'Department is required' });
  if (!data.name) errors.push({ field: 'name', message: 'Program name is required' });
  if (!data.code) errors.push({ field: 'code', message: 'Program code is required' });
  if (!data.duration) errors.push({ field: 'duration', message: 'Duration is required' });
  
  if (data.duration && data.duration < 1) {
    errors.push({ field: 'duration', message: 'Duration must be at least 1 year' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

export const updateProgramSchema = (data) => {
  const errors = [];
  
  if (data.duration && data.duration < 1) {
    errors.push({ field: 'duration', message: 'Duration must be at least 1 year' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

// ==================== ACADEMIC YEARS ====================

export const createAcademicYearSchema = (data) => {
  const errors = [];
  
  if (!data.campusId) errors.push({ field: 'campusId', message: 'Campus is required' });
  if (!data.year) errors.push({ field: 'year', message: 'Academic year is required' });
  if (!data.startDate) errors.push({ field: 'startDate', message: 'Start date is required' });
  if (!data.endDate) errors.push({ field: 'endDate', message: 'End date is required' });
  
  if (data.startDate && data.endDate && new Date(data.endDate) <= new Date(data.startDate)) {
    errors.push({ field: 'endDate', message: 'End date must be after start date' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

export const updateAcademicYearSchema = (data) => {
  const errors = [];
  
  if (data.startDate && data.endDate && new Date(data.endDate) <= new Date(data.startDate)) {
    errors.push({ field: 'endDate', message: 'End date must be after start date' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

// ==================== SEMESTERS ====================

export const createSemesterSchema = (data) => {
  const errors = [];
  
  if (!data.campusId) errors.push({ field: 'campusId', message: 'Campus is required' });
  if (!data.academicYearId) errors.push({ field: 'academicYearId', message: 'Academic year is required' });
  if (!data.name) errors.push({ field: 'name', message: 'Semester name is required' });
  if (!data.startDate) errors.push({ field: 'startDate', message: 'Start date is required' });
  if (!data.endDate) errors.push({ field: 'endDate', message: 'End date is required' });
  
  if (data.startDate && data.endDate && new Date(data.endDate) <= new Date(data.startDate)) {
    errors.push({ field: 'endDate', message: 'End date must be after start date' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

export const updateSemesterSchema = (data) => {
  const errors = [];
  
  if (data.startDate && data.endDate && new Date(data.endDate) <= new Date(data.startDate)) {
    errors.push({ field: 'endDate', message: 'End date must be after start date' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

// ==================== SUBJECTS ====================

export const createSubjectSchema = (data) => {
  const errors = [];
  
  if (!data.campusId) errors.push({ field: 'campusId', message: 'Campus is required' });
  if (!data.departmentId) errors.push({ field: 'departmentId', message: 'Department is required' });
  if (!data.semesterId) errors.push({ field: 'semesterId', message: 'Semester is required' });
  if (!data.name) errors.push({ field: 'name', message: 'Subject name is required' });
  if (!data.code) errors.push({ field: 'code', message: 'Subject code is required' });
  if (!data.credits) errors.push({ field: 'credits', message: 'Credits are required' });
  
  if (data.credits && data.credits < 1) {
    errors.push({ field: 'credits', message: 'Credits must be at least 1' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

export const updateSubjectSchema = (data) => {
  const errors = [];
  
  if (data.credits && data.credits < 1) {
    errors.push({ field: 'credits', message: 'Credits must be at least 1' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};
