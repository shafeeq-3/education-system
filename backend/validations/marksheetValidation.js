import { ValidationError } from '../utils/errors.js';

// ==================== MARKSHEETS ====================

export const generateMarksheetSchema = (data) => {
  const errors = [];
  
  if (!data.enrollmentId) {
    errors.push({ field: 'enrollmentId', message: 'Enrollment ID is required' });
  }
  
  if (!data.examMarks) {
    errors.push({ field: 'examMarks', message: 'Exam marks are required' });
  } else {
    if (data.examMarks.midtermMarks === undefined || data.examMarks.midtermMarks === null) {
      errors.push({ field: 'examMarks.midtermMarks', message: 'Midterm marks are required' });
    }
    if (data.examMarks.finalMarks === undefined || data.examMarks.finalMarks === null) {
      errors.push({ field: 'examMarks.finalMarks', message: 'Final marks are required' });
    }
    if (data.examMarks.midtermObtained === undefined || data.examMarks.midtermObtained === null) {
      errors.push({ field: 'examMarks.midtermObtained', message: 'Midterm obtained marks are required' });
    }
    if (data.examMarks.finalObtained === undefined || data.examMarks.finalObtained === null) {
      errors.push({ field: 'examMarks.finalObtained', message: 'Final obtained marks are required' });
    }
    
    // Validate marks are non-negative
    if (data.examMarks.midtermMarks < 0) {
      errors.push({ field: 'examMarks.midtermMarks', message: 'Midterm marks cannot be negative' });
    }
    if (data.examMarks.finalMarks < 0) {
      errors.push({ field: 'examMarks.finalMarks', message: 'Final marks cannot be negative' });
    }
    if (data.examMarks.midtermObtained < 0) {
      errors.push({ field: 'examMarks.midtermObtained', message: 'Midterm obtained marks cannot be negative' });
    }
    if (data.examMarks.finalObtained < 0) {
      errors.push({ field: 'examMarks.finalObtained', message: 'Final obtained marks cannot be negative' });
    }
    
    // Validate obtained marks don't exceed total marks
    if (data.examMarks.midtermObtained > data.examMarks.midtermMarks) {
      errors.push({ field: 'examMarks.midtermObtained', message: 'Midterm obtained marks cannot exceed total marks' });
    }
    if (data.examMarks.finalObtained > data.examMarks.finalMarks) {
      errors.push({ field: 'examMarks.finalObtained', message: 'Final obtained marks cannot exceed total marks' });
    }
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

export const updateMarksheetSchema = (data) => {
  const errors = [];
  
  if (data.examMarks) {
    // Validate marks are non-negative if provided
    if (data.examMarks.midtermMarks !== undefined && data.examMarks.midtermMarks < 0) {
      errors.push({ field: 'examMarks.midtermMarks', message: 'Midterm marks cannot be negative' });
    }
    if (data.examMarks.finalMarks !== undefined && data.examMarks.finalMarks < 0) {
      errors.push({ field: 'examMarks.finalMarks', message: 'Final marks cannot be negative' });
    }
    if (data.examMarks.obtainedMarks !== undefined && data.examMarks.obtainedMarks < 0) {
      errors.push({ field: 'examMarks.obtainedMarks', message: 'Obtained marks cannot be negative' });
    }
  }
  
  if (data.passingMarks !== undefined && data.passingMarks < 0) {
    errors.push({ field: 'passingMarks', message: 'Passing marks cannot be negative' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};

// ==================== TRANSCRIPTS ====================

export const generateTranscriptSchema = (data) => {
  const errors = [];
  
  if (!data.studentId) {
    errors.push({ field: 'studentId', message: 'Student ID is required' });
  }
  
  if (!data.programId) {
    errors.push({ field: 'programId', message: 'Program ID is required' });
  }
  
  if (!data.academicYearId) {
    errors.push({ field: 'academicYearId', message: 'Academic year ID is required' });
  }
  
  if (errors.length > 0) {
    return { error: new ValidationError('Validation failed', errors) };
  }
  
  return { value: data };
};
