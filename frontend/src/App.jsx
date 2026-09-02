import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './components/layout/DashboardLayout';

// Admin Pages
import Users from './pages/admin/Users';
import Institutes from './pages/admin/Institutes';
import Campuses from './pages/admin/Campuses';
import Departments from './pages/admin/Departments';
import Programs from './pages/admin/Programs';
import Semesters from './pages/admin/Semesters';
import AcademicYears from './pages/admin/AcademicYears';
import Subjects from './pages/admin/Subjects';
import Classes from './pages/admin/Classes';
import Timetables from './pages/admin/Timetables';
import Enrollments from './pages/admin/Enrollments';
import FeeStructures from './pages/admin/FeeStructures';
import StudentFeesManagement from './pages/admin/StudentFeesManagement';
import SalaryStructures from './pages/admin/SalaryStructures';
import SalaryPayments from './pages/admin/SalaryPayments';
import FinancialReports from './pages/admin/FinancialReports';
import AdminAnalytics from './pages/admin/Analytics';

// Teacher Pages
import TeacherAssignments from './pages/teacher/Assignments';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherGrades from './pages/teacher/Grades';
import TeacherSalary from './pages/teacher/Salary';
import TeacherTimetable from './pages/teacher/Timetable';
import TeacherAnalytics from './pages/teacher/Analytics';
import TeacherClassDetail from './pages/teacher/Classes';
import AssignmentSubmissions from './pages/teacher/AssignmentSubmissions';

// Student Pages
import StudentAssignments from './pages/student/Assignments';
import StudentCourses from './pages/student/Courses';
import StudentAttendance from './pages/student/Attendance';
import StudentResults from './pages/student/Results';
import StudentFees from './pages/student/Fees';
import StudentTimetable from './pages/student/Timetable';
import EnrollmentRequest from './pages/student/EnrollmentRequest';

// Shared Pages
import Notifications from './pages/shared/Notifications';
import ProfileSettings from './pages/shared/ProfileSettings';
import ChangePassword from './pages/shared/ChangePassword';
import ActiveSessions from './pages/shared/ActiveSessions';

// Auth Pages
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

function AttendanceRouter() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) return <Navigate to="/login" replace />;
  
  if (user.role === 'teacher') {
    return <TeacherAttendance />;
  } else if (user.role === 'student') {
    return <StudentAttendance />;
  }
  
  return <Navigate to="/dashboard" replace />;
}

function AssignmentsRouter() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) return <Navigate to="/login" replace />;
  
  if (user.role === 'teacher') {
    return <TeacherAssignments />;
  } else if (user.role === 'student') {
    return <StudentAssignments />;
  }
  
  return <Navigate to="/dashboard" replace />;
}

function TimetableRouter() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) return <Navigate to="/login" replace />;
  
  if (user.role === 'teacher') {
    return <TeacherTimetable />;
  } else if (user.role === 'student') {
    return <StudentTimetable />;
  }
  
  return <Navigate to="/dashboard" replace />;
}

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  
  // TODO: Add role checking here if needed
  return children;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" replace /> : children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } />

          <Route path="/reset-password/:token" element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <DashboardLayout>
                <Users />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/institutes" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <DashboardLayout>
                <Institutes />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/campuses" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <DashboardLayout>
                <Campuses />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/departments" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <DashboardLayout>
                <Departments />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/programs" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <DashboardLayout>
                <Programs />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/semesters" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <DashboardLayout>
                <Semesters />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/academic-years" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <DashboardLayout>
                <AcademicYears />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/subjects" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <DashboardLayout>
                <Subjects />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/classes" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <DashboardLayout>
                <Classes />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/timetables" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <DashboardLayout>
                <Timetables />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/enrollments" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <DashboardLayout>
                <Enrollments />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/fee-structures" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <DashboardLayout>
                <FeeStructures />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/student-fees" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <DashboardLayout>
                <StudentFeesManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/salary-structures" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <DashboardLayout>
                <SalaryStructures />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/salary-payments" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <DashboardLayout>
                <SalaryPayments />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/financial-reports" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <DashboardLayout>
                <FinancialReports />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Legacy Admin Routes (for backward compatibility) */}
          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <DashboardLayout>
                <Users />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/institutes" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <DashboardLayout>
                <Institutes />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/campuses" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <DashboardLayout>
                <Campuses />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/academic/departments" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <DashboardLayout>
                <Departments />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/academic/programs" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <DashboardLayout>
                <Programs />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/academic/semesters" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <DashboardLayout>
                <Semesters />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/academic/academic-years" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <DashboardLayout>
                <AcademicYears />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/academic/subjects" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <DashboardLayout>
                <Subjects />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/classes" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Classes />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/timetables" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Timetables />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/enrollments" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Enrollments />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/analytics" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <DashboardLayout>
                <AdminAnalytics />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Teacher Routes */}
          <Route path="/teacher/classes/:id" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout>
                <TeacherClassDetail />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/assignments/:id/submissions" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout>
                <AssignmentSubmissions />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/teacher/assignments" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout>
                <TeacherAssignments />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/teacher/attendance" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout>
                <TeacherAttendance />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/teacher/grades" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout>
                <TeacherGrades />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/teacher/salaries" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout>
                <TeacherSalary />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/teacher/timetable" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout>
                <TeacherTimetable />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/teacher/salary" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout>
                <TeacherSalary />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/teacher/analytics" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout>
                <TeacherAnalytics />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Legacy Teacher Routes (for backward compatibility) */}
          <Route path="/assignments" element={
            <ProtectedRoute>
              <DashboardLayout>
                <AssignmentsRouter />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/attendance" element={
            <ProtectedRoute>
              <DashboardLayout>
                <AttendanceRouter />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/grades" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout>
                <TeacherGrades />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/salaries" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout>
                <TeacherSalary />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/timetable" element={
            <ProtectedRoute>
              <DashboardLayout>
                <TimetableRouter />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Student Routes */}
          <Route path="/student/courses" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout>
                <StudentCourses />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/student/assignments" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout>
                <StudentAssignments />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/student/attendance" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout>
                <StudentAttendance />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/student/results" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout>
                <StudentResults />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/student/fees" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout>
                <StudentFees />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/student/timetable" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout>
                <StudentTimetable />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/student/enrollment-request" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout>
                <EnrollmentRequest />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Legacy Student Routes (for backward compatibility) */}
          <Route path="/courses" element={
            <ProtectedRoute>
              <DashboardLayout>
                <StudentCourses />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/enrollment-request" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout>
                <EnrollmentRequest />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/results" element={
            <ProtectedRoute>
              <DashboardLayout>
                <StudentResults />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/fees" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout>
                <StudentFees />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/salaries" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout>
                <TeacherSalary />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Finance Routes (Admin/Accounts) */}
          <Route path="/finance/fee-structures" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin', 'accounts']}>
              <DashboardLayout>
                <FeeStructures />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/finance/student-fees" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin', 'accounts']}>
              <DashboardLayout>
                <StudentFeesManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/finance/salary-structures" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin', 'accounts']}>
              <DashboardLayout>
                <SalaryStructures />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/finance/salary-payments" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin', 'accounts']}>
              <DashboardLayout>
                <SalaryPayments />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/finance/reports" element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin', 'accounts']}>
              <DashboardLayout>
                <FinancialReports />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Shared Routes */}
          <Route path="/notifications" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Notifications />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProfileSettings />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/change-password" element={
            <ProtectedRoute>
              <DashboardLayout>
                <ChangePassword />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/sessions" element={
            <ProtectedRoute>
              <DashboardLayout>
                <ActiveSessions />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
