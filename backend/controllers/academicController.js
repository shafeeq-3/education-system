import academicService from '../services/academicService.js';
import { successResponse, paginatedResponse } from '../utils/response.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import logActivity from '../middlewares/activityLogger.js';

class AcademicController {
  // ==================== INSTITUTES ====================
  
  createInstitute = asyncHandler(async (req, res) => {
    const institute = await academicService.createInstitute(req.body, req.userId);
    await logActivity(req, 'create', 'Institute', institute);
    
    successResponse(res, 201, 'Institute created successfully', institute);
  });
  
  getInstitutes = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.search) {
      filters.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { code: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    const { institutes, total } = await academicService.getInstitutes(
      filters,
      req.pagination,
      req.sort
    );
    
    paginatedResponse(res, 200, institutes, { ...req.pagination, total });
  });
  
  getInstituteById = asyncHandler(async (req, res) => {
    const institute = await academicService.getInstituteById(req.params.id);
    successResponse(res, 200, 'Institute retrieved successfully', institute);
  });
  
  updateInstitute = asyncHandler(async (req, res) => {
    const institute = await academicService.updateInstitute(req.params.id, req.body);
    await logActivity(req, 'update', 'Institute', institute);
    
    successResponse(res, 200, 'Institute updated successfully', institute);
  });
  
  deleteInstitute = asyncHandler(async (req, res) => {
    const institute = await academicService.deleteInstitute(req.params.id);
    await logActivity(req, 'delete', 'Institute', institute);
    
    successResponse(res, 200, 'Institute deleted successfully');
  });
  
  // ==================== CAMPUSES ====================
  
  createCampus = asyncHandler(async (req, res) => {
    const campus = await academicService.createCampus(req.body, req.userId);
    await logActivity(req, 'create', 'Campus', campus);
    
    successResponse(res, 201, 'Campus created successfully', campus);
  });
  
  getCampuses = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.search) {
      filters.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { code: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.instituteId) filters.institute = req.query.instituteId;
    
    const { campuses, total } = await academicService.getCampuses(
      filters,
      req.pagination,
      req.sort
    );
    
    paginatedResponse(res, 200, campuses, { ...req.pagination, total });
  });
  
  getCampusById = asyncHandler(async (req, res) => {
    const campus = await academicService.getCampusById(req.params.id);
    successResponse(res, 200, 'Campus retrieved successfully', campus);
  });
  
  updateCampus = asyncHandler(async (req, res) => {
    const campus = await academicService.updateCampus(req.params.id, req.body);
    await logActivity(req, 'update', 'Campus', campus);
    
    successResponse(res, 200, 'Campus updated successfully', campus);
  });
  
  deleteCampus = asyncHandler(async (req, res) => {
    const campus = await academicService.deleteCampus(req.params.id);
    await logActivity(req, 'delete', 'Campus', campus);
    
    successResponse(res, 200, 'Campus deleted successfully');
  });
  
  // ==================== DEPARTMENTS ====================
  
  createDepartment = asyncHandler(async (req, res) => {
    const department = await academicService.createDepartment(req.body, req.userId);
    await logActivity(req, 'create', 'Department', department);
    
    successResponse(res, 201, 'Department created successfully', department);
  });
  
  getDepartments = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.search) {
      filters.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { code: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.campusId) filters.campus = req.query.campusId;
    if (req.campusFilter) Object.assign(filters, req.campusFilter);
    
    const { departments, total } = await academicService.getDepartments(
      filters,
      req.pagination,
      req.sort
    );
    
    paginatedResponse(res, 200, departments, { ...req.pagination, total });
  });
  
  getDepartmentById = asyncHandler(async (req, res) => {
    const department = await academicService.getDepartmentById(req.params.id);
    successResponse(res, 200, 'Department retrieved successfully', department);
  });
  
  updateDepartment = asyncHandler(async (req, res) => {
    const department = await academicService.updateDepartment(req.params.id, req.body);
    await logActivity(req, 'update', 'Department', department);
    
    successResponse(res, 200, 'Department updated successfully', department);
  });
  
  deleteDepartment = asyncHandler(async (req, res) => {
    const department = await academicService.deleteDepartment(req.params.id);
    await logActivity(req, 'delete', 'Department', department);
    
    successResponse(res, 200, 'Department deleted successfully');
  });
  
  // ==================== PROGRAMS ====================
  
  createProgram = asyncHandler(async (req, res) => {
    const program = await academicService.createProgram(req.body, req.userId);
    await logActivity(req, 'create', 'Program', program);
    
    successResponse(res, 201, 'Program created successfully', program);
  });
  
  getPrograms = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.search) {
      filters.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { code: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.campusId) filters.campus = req.query.campusId;
    if (req.query.departmentId) filters.department = req.query.departmentId;
    if (req.campusFilter) Object.assign(filters, req.campusFilter);
    
    const { programs, total } = await academicService.getPrograms(
      filters,
      req.pagination,
      req.sort
    );
    
    paginatedResponse(res, 200, programs, { ...req.pagination, total });
  });
  
  getProgramById = asyncHandler(async (req, res) => {
    const program = await academicService.getProgramById(req.params.id);
    successResponse(res, 200, 'Program retrieved successfully', program);
  });
  
  updateProgram = asyncHandler(async (req, res) => {
    const program = await academicService.updateProgram(req.params.id, req.body);
    await logActivity(req, 'update', 'Program', program);
    
    successResponse(res, 200, 'Program updated successfully', program);
  });
  
  deleteProgram = asyncHandler(async (req, res) => {
    const program = await academicService.deleteProgram(req.params.id);
    await logActivity(req, 'delete', 'Program', program);
    
    successResponse(res, 200, 'Program deleted successfully');
  });
  
  // ==================== ACADEMIC YEARS ====================
  
  createAcademicYear = asyncHandler(async (req, res) => {
    const academicYear = await academicService.createAcademicYear(req.body, req.userId);
    await logActivity(req, 'create', 'AcademicYear', academicYear);
    
    successResponse(res, 201, 'Academic year created successfully', academicYear);
  });
  
  getAcademicYears = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.campusId) filters.campus = req.query.campusId;
    if (req.query.isCurrent) filters.isCurrent = req.query.isCurrent === 'true';
    if (req.campusFilter) Object.assign(filters, req.campusFilter);
    
    const { academicYears, total } = await academicService.getAcademicYears(
      filters,
      req.pagination,
      req.sort
    );
    
    paginatedResponse(res, 200, academicYears, { ...req.pagination, total });
  });
  
  getAcademicYearById = asyncHandler(async (req, res) => {
    const academicYear = await academicService.getAcademicYearById(req.params.id);
    successResponse(res, 200, 'Academic year retrieved successfully', academicYear);
  });
  
  updateAcademicYear = asyncHandler(async (req, res) => {
    const academicYear = await academicService.updateAcademicYear(req.params.id, req.body);
    await logActivity(req, 'update', 'AcademicYear', academicYear);
    
    successResponse(res, 200, 'Academic year updated successfully', academicYear);
  });
  
  deleteAcademicYear = asyncHandler(async (req, res) => {
    const academicYear = await academicService.deleteAcademicYear(req.params.id);
    await logActivity(req, 'delete', 'AcademicYear', academicYear);
    
    successResponse(res, 200, 'Academic year deleted successfully');
  });
  
  // ==================== SEMESTERS ====================
  
  createSemester = asyncHandler(async (req, res) => {
    const semester = await academicService.createSemester(req.body, req.userId);
    await logActivity(req, 'create', 'Semester', semester);
    
    successResponse(res, 201, 'Semester created successfully', semester);
  });
  
  getSemesters = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.campusId) filters.campus = req.query.campusId;
    if (req.query.academicYearId) filters.academicYear = req.query.academicYearId;
    if (req.query.isCurrent) filters.isCurrent = req.query.isCurrent === 'true';
    if (req.campusFilter) Object.assign(filters, req.campusFilter);
    
    const { semesters, total } = await academicService.getSemesters(
      filters,
      req.pagination,
      req.sort
    );
    
    paginatedResponse(res, 200, semesters, { ...req.pagination, total });
  });
  
  getSemesterById = asyncHandler(async (req, res) => {
    const semester = await academicService.getSemesterById(req.params.id);
    successResponse(res, 200, 'Semester retrieved successfully', semester);
  });
  
  updateSemester = asyncHandler(async (req, res) => {
    const semester = await academicService.updateSemester(req.params.id, req.body);
    await logActivity(req, 'update', 'Semester', semester);
    
    successResponse(res, 200, 'Semester updated successfully', semester);
  });
  
  deleteSemester = asyncHandler(async (req, res) => {
    const semester = await academicService.deleteSemester(req.params.id);
    await logActivity(req, 'delete', 'Semester', semester);
    
    successResponse(res, 200, 'Semester deleted successfully');
  });
  
  // ==================== SUBJECTS ====================
  
  createSubject = asyncHandler(async (req, res) => {
    const subject = await academicService.createSubject(req.body, req.userId);
    await logActivity(req, 'create', 'Subject', subject);
    
    successResponse(res, 201, 'Subject created successfully', subject);
  });
  
  getSubjects = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.search) {
      filters.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { code: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.campusId) filters.campus = req.query.campusId;
    if (req.query.departmentId) filters.department = req.query.departmentId;
    if (req.query.semesterId) filters.semester = req.query.semesterId;
    if (req.campusFilter) Object.assign(filters, req.campusFilter);
    
    const { subjects, total } = await academicService.getSubjects(
      filters,
      req.pagination,
      req.sort
    );
    
    paginatedResponse(res, 200, subjects, { ...req.pagination, total });
  });
  
  getSubjectById = asyncHandler(async (req, res) => {
    const subject = await academicService.getSubjectById(req.params.id);
    successResponse(res, 200, 'Subject retrieved successfully', subject);
  });
  
  updateSubject = asyncHandler(async (req, res) => {
    const subject = await academicService.updateSubject(req.params.id, req.body);
    await logActivity(req, 'update', 'Subject', subject);
    
    successResponse(res, 200, 'Subject updated successfully', subject);
  });
  
  deleteSubject = asyncHandler(async (req, res) => {
    const subject = await academicService.deleteSubject(req.params.id);
    await logActivity(req, 'delete', 'Subject', subject);
    
    successResponse(res, 200, 'Subject deleted successfully');
  });
}

export default new AcademicController();
