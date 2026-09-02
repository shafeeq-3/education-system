import { useEffect, useState } from 'react';
import axios from '../../lib/axios';
import { Users, GraduationCap, BookOpen, Clock, Calendar, BarChart3, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { formatPercentage } from '../../lib/utils';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toasts, removeToast, error } = useToast();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('/dashboard/admin');
      setDashboard(response.data.data);
    } catch (err) {
      error(err.response?.data?.error?.message || 'Failed to load dashboard');
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
  const academicSummary = dashboard?.academicSummary || {};
  const gradeDistribution = dashboard?.gradeDistribution || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">System overview and key metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-xl transition-all animate-scale-in">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{kpis.totalStudents || 0}</p>
            </div>
            <div className="shrink-0 p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-xl transition-all animate-scale-in">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Teachers</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{kpis.totalTeachers || 0}</p>
            </div>
            <div className="shrink-0 p-3 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl">
              <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-xl transition-all animate-scale-in">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Classes</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{kpis.totalClasses || 0}</p>
            </div>
            <div className="shrink-0 p-3 bg-gradient-to-br from-purple-100 to-teal-100 rounded-xl">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-xl transition-all animate-scale-in">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                {(kpis.pendingApprovals?.enrollments || 0) + 
                 (kpis.pendingApprovals?.submissions || 0) + 
                 (kpis.pendingApprovals?.marksheets || 0)}
              </p>
            </div>
            <div className="shrink-0 p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Academic Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Attendance Overview
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-teal-50 rounded-lg">
              <span className="text-sm sm:text-base text-gray-700 font-medium">Average Attendance</span>
              <span className="text-xl sm:text-2xl font-bold text-purple-600">
                {formatPercentage(academicSummary.attendance?.averagePercentage)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-teal-50 to-purple-50 rounded-lg">
              <span className="text-sm sm:text-base text-gray-700 font-medium">Compliance Rate (≥75%)</span>
              <span className="text-lg sm:text-xl font-semibold text-teal-600">
                {formatPercentage(academicSummary.attendance?.compliancePercentage)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm sm:text-base text-gray-700 font-medium">Total Enrollments</span>
              <span className="text-lg sm:text-xl font-semibold text-gray-900">
                {academicSummary.attendance?.totalEnrollments || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-teal-600" />
            Assignment Statistics
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-teal-50 rounded-lg">
              <span className="text-sm sm:text-base text-gray-700 font-medium">Total Assignments</span>
              <span className="text-xl sm:text-2xl font-bold text-purple-600">
                {academicSummary.assignments?.totalAssignments || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-teal-50 to-purple-50 rounded-lg">
              <span className="text-sm sm:text-base text-gray-700 font-medium">Total Submissions</span>
              <span className="text-lg sm:text-xl font-semibold text-teal-600">
                {academicSummary.assignments?.totalSubmissions || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm sm:text-base text-gray-700 font-medium">Avg Submissions/Assignment</span>
              <span className="text-lg sm:text-xl font-semibold text-gray-900">
                {academicSummary.assignments?.averageSubmissionsPerAssignment?.toFixed(1) || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Results Summary
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-teal-50 rounded-xl">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Total Finalized</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {academicSummary.results?.totalFinalized || 0}
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Passed</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">
              {academicSummary.results?.passed || 0}
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Failed</p>
            <p className="text-2xl sm:text-3xl font-bold text-red-600">
              {academicSummary.results?.failed || 0}
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Pass Rate</p>
            <p className="text-2xl sm:text-3xl font-bold text-purple-600">
              {formatPercentage(academicSummary.results?.passPercentage)}
            </p>
          </div>
        </div>
      </div>

      {/* Grade Distribution */}
      {gradeDistribution.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Grade Distribution</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-3">
            {gradeDistribution.map((grade) => (
              <div key={grade._id} className="text-center p-3 bg-gradient-to-br from-purple-50 to-teal-50 rounded-lg hover:shadow-md transition-all">
                <div className="text-xl sm:text-2xl font-bold text-purple-600">{grade.count}</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium mt-1">{grade._id}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-xl transition-all cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="shrink-0 p-3 bg-gradient-primary rounded-xl group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Manage Users</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Approve and manage accounts</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-xl transition-all cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="shrink-0 p-3 bg-gradient-secondary rounded-xl group-hover:scale-110 transition-transform">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Academic Setup</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage departments & programs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-xl transition-all cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="shrink-0 p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl group-hover:scale-110 transition-transform">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">System Health</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Monitor system status</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
