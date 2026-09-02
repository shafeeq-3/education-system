import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../lib/axios';
import { 
  BookOpen, FileText, Users, AlertCircle, Clock, Loader2, Calendar, 
  CheckCircle, TrendingUp, Award, Target, Activity, BarChart3,
  ClipboardList, UserCheck, Bell, ChevronRight
} from 'lucide-react';
import { formatPercentage, formatDate } from '../../lib/utils';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function TeacherDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toasts, removeToast, error } = useToast();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('/dashboard/teacher');
      setDashboard(response.data.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const kpis = dashboard?.kpis || {};
  const assignedClasses = dashboard?.assignedClasses || [];
  const classPerformance = dashboard?.classPerformance || [];
  const attendanceAlerts = dashboard?.attendanceAlerts || [];
  const eligibilityAlerts = dashboard?.eligibilityAlerts || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 p-3 sm:p-4 md:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Header with Welcome Message */}
      <div className="mb-4 sm:mb-6 animate-fade-in">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
          Welcome Back, Teacher! 👨‍🏫
        </h1>
        <p className="text-gray-600 mt-1 text-xs sm:text-sm md:text-base">
          Manage your classes and track student performance
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
        <Link 
          to="/teacher/assignments"
          className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 hover:shadow-xl transition-all group"
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
              <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-600" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-900">Assignments</span>
          </div>
        </Link>

        <Link 
          to="/teacher/attendance"
          className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 hover:shadow-xl transition-all group"
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
              <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-teal-600" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-900">Attendance</span>
          </div>
        </Link>

        <Link 
          to="/teacher/grades"
          className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 hover:shadow-xl transition-all group"
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
              <Award className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-600" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-900">Grades</span>
          </div>
        </Link>

        <Link 
          to="/teacher/analytics"
          className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 hover:shadow-xl transition-all group"
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-orange-600" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-900">Analytics</span>
          </div>
        </Link>
      </div>

      {/* KPI Cards - Enhanced */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-6 hover:shadow-xl transition-all animate-scale-in">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg sm:rounded-xl">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <Target className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Assigned Classes</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {kpis.assignedClasses || 0}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Active teaching assignments
          </p>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-6 hover:shadow-xl transition-all animate-scale-in">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg sm:rounded-xl">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600" />
            </div>
            <Activity className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total Students</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {kpis.totalStudents || 0}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Across all classes
          </p>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-6 hover:shadow-xl transition-all animate-scale-in">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg sm:rounded-xl">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
            </div>
            <Bell className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Pending Grading</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {(kpis.pendingGrading?.assignments || 0) + (kpis.pendingGrading?.marksheets || 0)}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            {kpis.pendingGrading?.assignments || 0} assignments, {kpis.pendingGrading?.marksheets || 0} marksheets
          </p>
        </div>
      </div>

      {/* Attendance Alerts */}
      {attendanceAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl shadow-md p-4 sm:p-6 mb-6 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-orange-900 mb-3 text-sm sm:text-base">Low Attendance Alerts</h3>
              <div className="space-y-2">
                {attendanceAlerts.slice(0, 5).map((alert, index) => (
                  <div key={index} className="text-xs sm:text-sm text-orange-800 break-words">
                    <span className="font-medium">{alert.class?.name || 'Class'}:</span>{' '}
                    {formatPercentage(alert.attendancePercentage)} attendance on {formatDate(alert.date)}
                    {' '}({alert.presentCount || 0}/{alert.totalStudents || 0} present)
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Eligibility Alerts */}
      {eligibilityAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl shadow-md p-4 sm:p-6 mb-6 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-red-900 mb-3 text-sm sm:text-base">
                Ineligible Students ({eligibilityAlerts.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {eligibilityAlerts.slice(0, 10).map((alert, index) => (
                  <div key={index} className="text-xs sm:text-sm text-red-800 break-words p-2 bg-white rounded-lg">
                    <span className="font-medium">
                      {alert.student?.profile?.firstName} {alert.student?.profile?.lastName}
                    </span>
                    {' '}in <span className="font-medium">{alert.class?.name} - {alert.subject?.name}</span>
                    <br />
                    <span className="text-xs text-red-600">
                      Reason: {alert.eligibilityReason} (Attendance: {formatPercentage(alert.attendancePercentage)})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Class Performance */}
      {classPerformance.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-600" />
            Class Performance Overview
          </h2>
          <div className="space-y-4">
            {classPerformance.map((performance, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-teal-50 rounded-xl hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                      {performance.class?.name} - {performance.subject?.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {performance.semester?.name} • Section {performance.class?.section || 'N/A'}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      (performance.eligibilityPercentage || 0) >= 75
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {formatPercentage(performance.eligibilityPercentage)} Eligible
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Students</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900">{performance.totalStudents || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Avg Attendance</p>
                    <p className={`text-lg sm:text-xl font-bold ${
                      (performance.averageAttendance || 0) >= 75 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(performance.averageAttendance)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Eligible</p>
                    <p className="text-lg sm:text-xl font-bold text-teal-600">
                      {performance.eligibleStudents || 0}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Ineligible</p>
                    <p className="text-lg sm:text-xl font-bold text-red-600">
                      {(performance.totalStudents || 0) - (performance.eligibleStudents || 0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assigned Classes */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-600" />
          My Classes
        </h2>
        <div className="space-y-3">
          {assignedClasses.length > 0 ? (
            assignedClasses.map((classItem) => (
              <div key={classItem._id} className="p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                      {classItem.name} - {classItem.subject?.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {classItem.semester?.name} • Section: {classItem.section || 'N/A'} • Code: {classItem.code || 'N/A'}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2">
                      <span className="text-xs sm:text-sm text-gray-600">
                        <Users className="h-3 w-3 inline mr-1" />
                        Students: <span className="font-semibold text-purple-600">
                          {classItem.currentEnrollment || 0} / {classItem.maxStudents || 0}
                        </span>
                      </span>
                      {classItem.room && (
                        <span className="text-xs sm:text-sm text-gray-600">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          Room: <span className="font-semibold text-teal-600">{classItem.room}</span>
                        </span>
                      )}
                      {classItem.subject?.credits && (
                        <span className="text-xs sm:text-sm text-gray-600">
                          <Award className="h-3 w-3 inline mr-1" />
                          Credits: <span className="font-semibold text-orange-600">{classItem.subject.credits}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Link
                      to={`/teacher/classes/${classItem._id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                    >
                      View Details
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-base">No classes assigned</p>
              <p className="text-sm text-gray-400 mt-2">Contact your administrator for class assignments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
