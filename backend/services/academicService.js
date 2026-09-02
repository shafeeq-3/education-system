import Institute from '../models/Institute.js';
import Campus from '../models/Campus.js';
import Department from '../models/Department.js';
import Program from '../models/Program.js';
import AcademicYear from '../models/AcademicYear.js';
import Semester from '../models/Semester.js';
import Subject from '../models/Subject.js';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors.js';

class AcademicService {
  // ==================== INSTITUTES ====================
  
  async createInstitute(data, userId) {
    const institute = await Institute.create({
      ...data,
      createdBy: userId
    });
    return institute;
  }
  
  async getInstitutes(filters, pagination, sort) {
    const query = { deletedAt: null, ...filters };
    
    const [institutes, total] = await Promise.all([
      Institute.find(query)
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .populate('createdBy', 'profile.firstName profile.lastName'),
      Institute.countDocuments(query)
    ]);
    
    return { institutes, total };
  }
  
  async getInstituteById(id) {
    const institute = await Institute.findOne({ _id: id, deletedAt: null })
      .populate('createdBy', 'profile.firstName profile.lastName');
    
    if (!institute) {
      throw new NotFoundError('Institute');
    }
    
    return institute;
  }
  
  async updateInstitute(id, data) {
    const institute = await Institute.findOneAndUpdate(
      { _id: id, deletedAt: null },
      data,
      { new: true, runValidators: true }
    );
    
    if (!institute) {
      throw new NotFoundError('Institute');
    }
    
    return institute;
  }
  
  async deleteInstitute(id) {
    // Check if institute has campuses
    const campusCount = await Campus.countDocuments({ institute: id, deletedAt: null });
    if (campusCount > 0) {
      throw new ConflictError('Cannot delete institute with existing campuses', 'RES_CANNOT_DELETE');
    }
    
    const institute = await Institute.softDelete(id);
    
    if (!institute) {
      throw new NotFoundError('Institute');
    }
    
    return institute;
  }
  
  // ==================== CAMPUSES ====================
  
  async createCampus(data, userId) {
    // Verify institute exists
    const institute = await Institute.findOne({ _id: data.instituteId, deletedAt: null });
    if (!institute) {
      throw new NotFoundError('Institute');
    }
    
    const campus = await Campus.create({
      institute: data.instituteId,
      name: data.name,
      code: data.code,
      address: data.address,
      phone: data.phone,
      location: data.location,
      createdBy: userId
    });
    
    return campus;
  }
  
  async getCampuses(filters, pagination, sort) {
    const query = { deletedAt: null, ...filters };
    
    const [campuses, total] = await Promise.all([
      Campus.find(query)
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .populate('institute', 'name code')
        .populate('createdBy', 'profile.firstName profile.lastName'),
      Campus.countDocuments(query)
    ]);
    
    return { campuses, total };
  }
  
  async getCampusById(id) {
    const campus = await Campus.findOne({ _id: id, deletedAt: null })
      .populate('institute', 'name code')
      .populate('createdBy', 'profile.firstName profile.lastName');
    
    if (!campus) {
      throw new NotFoundError('Campus');
    }
    
    return campus;
  }
  
  async updateCampus(id, data) {
    const campus = await Campus.findOneAndUpdate(
      { _id: id, deletedAt: null },
      data,
      { new: true, runValidators: true }
    ).populate('institute', 'name code');
    
    if (!campus) {
      throw new NotFoundError('Campus');
    }
    
    return campus;
  }
  
  async deleteCampus(id) {
    // Check if campus has departments
    const deptCount = await Department.countDocuments({ campus: id, deletedAt: null });
    if (deptCount > 0) {
      throw new ConflictError('Cannot delete campus with existing departments', 'RES_CANNOT_DELETE');
    }
    
    const campus = await Campus.softDelete(id);
    
    if (!campus) {
      throw new NotFoundError('Campus');
    }
    
    return campus;
  }
  
  // ==================== DEPARTMENTS ====================
  
  async createDepartment(data, userId) {
    // Verify campus exists
    const campus = await Campus.findOne({ _id: data.campusId, deletedAt: null });
    if (!campus) {
      throw new NotFoundError('Campus');
    }
    
    const department = await Department.create({
      campus: data.campusId,
      name: data.name,
      code: data.code,
      description: data.description,
      head: data.headId,
      createdBy: userId
    });
    
    return department;
  }
  
  async getDepartments(filters, pagination, sort) {
    const query = { deletedAt: null, ...filters };
    
    const [departments, total] = await Promise.all([
      Department.find(query)
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .populate('campus', 'name code')
        .populate('head', 'profile.firstName profile.lastName')
        .populate('createdBy', 'profile.firstName profile.lastName'),
      Department.countDocuments(query)
    ]);
    
    return { departments, total };
  }
  
  async getDepartmentById(id) {
    const department = await Department.findOne({ _id: id, deletedAt: null })
      .populate('campus', 'name code')
      .populate('head', 'profile.firstName profile.lastName email')
      .populate('createdBy', 'profile.firstName profile.lastName');
    
    if (!department) {
      throw new NotFoundError('Department');
    }
    
    return department;
  }
  
  async updateDepartment(id, data) {
    const department = await Department.findOneAndUpdate(
      { _id: id, deletedAt: null },
      data,
      { new: true, runValidators: true }
    ).populate('campus', 'name code').populate('head', 'profile.firstName profile.lastName');
    
    if (!department) {
      throw new NotFoundError('Department');
    }
    
    return department;
  }
  
  async deleteDepartment(id) {
    // Check if department has programs
    const programCount = await Program.countDocuments({ department: id, deletedAt: null });
    if (programCount > 0) {
      throw new ConflictError('Cannot delete department with existing programs', 'RES_CANNOT_DELETE');
    }
    
    const department = await Department.softDelete(id);
    
    if (!department) {
      throw new NotFoundError('Department');
    }
    
    return department;
  }
  
  // ==================== PROGRAMS ====================
  
  async createProgram(data, userId) {
    // Verify campus and department exist
    const [campus, department] = await Promise.all([
      Campus.findOne({ _id: data.campusId, deletedAt: null }),
      Department.findOne({ _id: data.departmentId, deletedAt: null })
    ]);
    
    if (!campus) throw new NotFoundError('Campus');
    if (!department) throw new NotFoundError('Department');
    
    const program = await Program.create({
      campus: data.campusId,
      department: data.departmentId,
      name: data.name,
      code: data.code,
      duration: data.duration,
      description: data.description,
      createdBy: userId
    });
    
    return program;
  }
  
  async getPrograms(filters, pagination, sort) {
    const query = { deletedAt: null, ...filters };
    
    const [programs, total] = await Promise.all([
      Program.find(query)
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .populate('campus', 'name code')
        .populate('department', 'name code')
        .populate('createdBy', 'profile.firstName profile.lastName'),
      Program.countDocuments(query)
    ]);
    
    return { programs, total };
  }
  
  async getProgramById(id) {
    const program = await Program.findOne({ _id: id, deletedAt: null })
      .populate('campus', 'name code')
      .populate('department', 'name code description')
      .populate('createdBy', 'profile.firstName profile.lastName');
    
    if (!program) {
      throw new NotFoundError('Program');
    }
    
    return program;
  }
  
  async updateProgram(id, data) {
    const program = await Program.findOneAndUpdate(
      { _id: id, deletedAt: null },
      data,
      { new: true, runValidators: true }
    ).populate('campus', 'name code').populate('department', 'name code');
    
    if (!program) {
      throw new NotFoundError('Program');
    }
    
    return program;
  }
  
  async deleteProgram(id) {
    const program = await Program.softDelete(id);
    
    if (!program) {
      throw new NotFoundError('Program');
    }
    
    return program;
  }
  
  // ==================== ACADEMIC YEARS ====================
  
  async createAcademicYear(data, userId) {
    const campus = await Campus.findOne({ _id: data.campusId, deletedAt: null });
    if (!campus) throw new NotFoundError('Campus');
    
    // If setting as current, unset others
    if (data.isCurrent) {
      await AcademicYear.updateMany(
        { campus: data.campusId },
        { isCurrent: false }
      );
    }
    
    const academicYear = await AcademicYear.create({
      campus: data.campusId,
      year: data.year,
      startDate: data.startDate,
      endDate: data.endDate,
      isCurrent: data.isCurrent || false,
      createdBy: userId
    });
    
    return academicYear;
  }
  
  async getAcademicYears(filters, pagination, sort) {
    const query = { deletedAt: null, ...filters };
    
    const [academicYears, total] = await Promise.all([
      AcademicYear.find(query)
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .populate('campus', 'name code')
        .populate('createdBy', 'profile.firstName profile.lastName'),
      AcademicYear.countDocuments(query)
    ]);
    
    return { academicYears, total };
  }
  
  async getAcademicYearById(id) {
    const academicYear = await AcademicYear.findOne({ _id: id, deletedAt: null })
      .populate('campus', 'name code')
      .populate('createdBy', 'profile.firstName profile.lastName');
    
    if (!academicYear) {
      throw new NotFoundError('Academic Year');
    }
    
    return academicYear;
  }
  
  async updateAcademicYear(id, data) {
    // If setting as current, unset others
    if (data.isCurrent) {
      const academicYear = await AcademicYear.findById(id);
      if (academicYear) {
        await AcademicYear.updateMany(
          { campus: academicYear.campus, _id: { $ne: id } },
          { isCurrent: false }
        );
      }
    }
    
    const academicYear = await AcademicYear.findOneAndUpdate(
      { _id: id, deletedAt: null },
      data,
      { new: true, runValidators: true }
    ).populate('campus', 'name code');
    
    if (!academicYear) {
      throw new NotFoundError('Academic Year');
    }
    
    return academicYear;
  }
  
  async deleteAcademicYear(id) {
    // Check if academic year has semesters
    const semesterCount = await Semester.countDocuments({ academicYear: id, deletedAt: null });
    if (semesterCount > 0) {
      throw new ConflictError('Cannot delete academic year with existing semesters', 'RES_CANNOT_DELETE');
    }
    
    const academicYear = await AcademicYear.softDelete(id);
    
    if (!academicYear) {
      throw new NotFoundError('Academic Year');
    }
    
    return academicYear;
  }
  
  // ==================== SEMESTERS ====================
  
  async createSemester(data, userId) {
    const [campus, academicYear] = await Promise.all([
      Campus.findOne({ _id: data.campusId, deletedAt: null }),
      AcademicYear.findOne({ _id: data.academicYearId, deletedAt: null })
    ]);
    
    if (!campus) throw new NotFoundError('Campus');
    if (!academicYear) throw new NotFoundError('Academic Year');
    
    // If setting as current, unset others
    if (data.isCurrent) {
      await Semester.updateMany(
        { campus: data.campusId },
        { isCurrent: false }
      );
    }
    
    const semester = await Semester.create({
      campus: data.campusId,
      academicYear: data.academicYearId,
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      isCurrent: data.isCurrent || false,
      createdBy: userId
    });
    
    return semester;
  }
  
  async getSemesters(filters, pagination, sort) {
    const query = { deletedAt: null, ...filters };
    
    const [semesters, total] = await Promise.all([
      Semester.find(query)
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .populate('campus', 'name code')
        .populate('academicYear', 'year')
        .populate('createdBy', 'profile.firstName profile.lastName'),
      Semester.countDocuments(query)
    ]);
    
    return { semesters, total };
  }
  
  async getSemesterById(id) {
    const semester = await Semester.findOne({ _id: id, deletedAt: null })
      .populate('campus', 'name code')
      .populate('academicYear', 'year startDate endDate')
      .populate('createdBy', 'profile.firstName profile.lastName');
    
    if (!semester) {
      throw new NotFoundError('Semester');
    }
    
    return semester;
  }
  
  async updateSemester(id, data) {
    // If setting as current, unset others
    if (data.isCurrent) {
      const semester = await Semester.findById(id);
      if (semester) {
        await Semester.updateMany(
          { campus: semester.campus, _id: { $ne: id } },
          { isCurrent: false }
        );
      }
    }
    
    const semester = await Semester.findOneAndUpdate(
      { _id: id, deletedAt: null },
      data,
      { new: true, runValidators: true }
    ).populate('campus', 'name code').populate('academicYear', 'year');
    
    if (!semester) {
      throw new NotFoundError('Semester');
    }
    
    return semester;
  }
  
  async deleteSemester(id) {
    // Check if semester has subjects
    const subjectCount = await Subject.countDocuments({ semester: id, deletedAt: null });
    if (subjectCount > 0) {
      throw new ConflictError('Cannot delete semester with existing subjects', 'RES_CANNOT_DELETE');
    }
    
    const semester = await Semester.softDelete(id);
    
    if (!semester) {
      throw new NotFoundError('Semester');
    }
    
    return semester;
  }
  
  // ==================== SUBJECTS ====================
  
  async createSubject(data, userId) {
    const [campus, department, semester] = await Promise.all([
      Campus.findOne({ _id: data.campusId, deletedAt: null }),
      Department.findOne({ _id: data.departmentId, deletedAt: null }),
      Semester.findOne({ _id: data.semesterId, deletedAt: null })
    ]);
    
    if (!campus) throw new NotFoundError('Campus');
    if (!department) throw new NotFoundError('Department');
    if (!semester) throw new NotFoundError('Semester');
    
    const subject = await Subject.create({
      campus: data.campusId,
      department: data.departmentId,
      semester: data.semesterId,
      name: data.name,
      code: data.code,
      credits: data.credits,
      description: data.description,
      createdBy: userId
    });
    
    return subject;
  }
  
  async getSubjects(filters, pagination, sort) {
    const query = { deletedAt: null, ...filters };
    
    const [subjects, total] = await Promise.all([
      Subject.find(query)
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .populate('campus', 'name code')
        .populate('department', 'name code')
        .populate('semester', 'name')
        .populate('createdBy', 'profile.firstName profile.lastName'),
      Subject.countDocuments(query)
    ]);
    
    return { subjects, total };
  }
  
  async getSubjectById(id) {
    const subject = await Subject.findOne({ _id: id, deletedAt: null })
      .populate('campus', 'name code')
      .populate('department', 'name code description')
      .populate('semester', 'name startDate endDate')
      .populate('createdBy', 'profile.firstName profile.lastName');
    
    if (!subject) {
      throw new NotFoundError('Subject');
    }
    
    return subject;
  }
  
  async updateSubject(id, data) {
    const subject = await Subject.findOneAndUpdate(
      { _id: id, deletedAt: null },
      data,
      { new: true, runValidators: true }
    ).populate('campus', 'name code').populate('department', 'name code').populate('semester', 'name');
    
    if (!subject) {
      throw new NotFoundError('Subject');
    }
    
    return subject;
  }
  
  async deleteSubject(id) {
    const subject = await Subject.softDelete(id);
    
    if (!subject) {
      throw new NotFoundError('Subject');
    }
    
    return subject;
  }
}

export default new AcademicService();
