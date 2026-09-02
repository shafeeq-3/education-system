import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../lib/axios';
import { 
  FileText, Calendar, AlertTriangle, CheckCircle, TrendingUp, Loader2, BookOpen,
  Clock, DollarSign, Award, Bell, ChevronRight, Users, ClipboardList, BarChart3,
  Target, Activity, Zap
} from 'lucide-react';
import { formatPercentage, formatDate } from '../../lib/utils';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function StudentDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feeStatus, setFeeStatus] = useState(null);
  const { toasts, removeToast, error } = useToast();

  useEffect(() => {
    fetchDashboard();
    fetchFeeStatus();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('/dashboard/student');
      setDashboard(response.data.data);
    } catch (err) {
      error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeStatus = async () => {
    try {
      const response = await axios.get('/student-fees/my-fees');
      const fees = response.data.data.items || [];
      if (fees.length > 0) {
        const totalAmount = fees.reduce((sum, fee) => sum + fee.totalAmount, 0);
        const paidAmount = fees.reduce((sum, fee) => sum + fee.paidAmount, 0);
        const remainingAmount = fees.reduce((sum, fee) => sum + fee.remainingAmount, 0);
        setFeeStatus({ totalAmount, paidAmount, remainingAmount, fees });
      }
    } catch (err) {
      console.error('Failed to load fee status:', err);
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
  const enrollments = dashboard?.enrollments || [];
  const latestMarksheets = dashboard?.latestMarksheets || [];
  const transcript = dashboard?.transcript || {};
  const upcomingDeadlines = dashboard?.upcomingDeadlines || [];
  const ineligibilityAlerts = dashboard?.ineligibilityAlerts || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 p-3 sm:p-4 md:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Header with Welcome Message */}
      <div className="mb-4 sm:mb-6 animate-fade-in">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
          Welcome Back, Student! 👋
        </h1>
        <p className="text-gray-600 mt-1 text-xs sm:text-sm md:text-base">
          Here's your academic overview and recent activities
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
        <Link 
          to="/student/courses"
          className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 hover:shadow-xl transition-all group"
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-600" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-900">My Courses</span>
          </div>
        </Link>

        <Link 
          to="/student/assignments"
          className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 hover:shadow-xl transition-all group"
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
              <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-teal-600" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-900">Assignments</span>
          </div>
        </Link>

        <Link 
          to="/student/attendance"
          className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 hover:shadow-xl transition-all group"
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-600" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-900">Attendance</span>
          </div>
        </Link>

        <Link 
          to="/student/results"
          className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 hover:shadow-xl transition-all group"
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
              <Award className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-orange-600" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-900">Results</span>
          </div>
        </Link>
      </div>

      {/* KPI Cards - Enhanced */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-6 hover:shadow-xl transition-all animate-scale-in">
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${
              (kpis.overallAttendance || 0) >= 75 
                ? 'bg-gradient-to-br from-green-100 to-teal-100' 
                : 'bg-gradient-to-br from-red-100 to-orange-100'
            }`}>
              <Calendar className={`h-5 w-5 sm:h-6 sm:w-6 ${
                (kpis.overallAttendance || 0) >= 75 ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
            <Target className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Overall Attendance</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {formatPercentage(kpis.overallAttendance)}
          </p>
          <div className="mt-2 sm:mt-3">
            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
              <div 
                className={`h-1.5 sm:h-2 rounded-full ${
                  (kpis.overallAttendance || 0) >= 75 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(kpis.overallAttendance || 0, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-6 hover:shadow-xl transition-all animate-scale-in">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg sm:rounded-xl">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <Activity className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Assignment Completion</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {formatPercentage(kpis.assignmentCompletion)}
          </p>
          <div className="mt-2 sm:mt-3">
            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
              <div 
                className="bg-purple-500 h-1.5 sm:h-2 rounded-full"
                style={{ width: `${Math.min(kpis.assignmentCompletion || 0, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-6 hover:shadow-xl transition-all animate-scale-in">
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${
              (kpis.eligibility?.percentage || 0) >= 75 
                ? 'bg-gradient-to-br from-green-100 to-teal-100' 
                : 'bg-gradient-to-br from-orange-100 to-red-100'
            }`}>
              <CheckCircle className={`h-5 w-5 sm:h-6 sm:w-6 ${
                (kpis.eligibility?.percentage || 0) >= 75 ? 'text-green-600' : 'text-orange-600'
              }`} />
            </div>
            <Zap className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Exam Eligibility</p>
          <p className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
            {kpis.eligibility?.eligible || 0} / {kpis.eligibility?.total || 0}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {formatPercentage(kpis.eligibility?.percentage)} Eligible
          </p>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-6 hover:shadow-xl transition-all animate-scale-in">
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${
              feeStatus && feeStatus.remainingAmount === 0
                ? 'bg-gradient-to-br from-green-100 to-teal-100'
                : 'bg-gradient-to-br from-orange-100 to-red-100'
            }`}>
              <DollarSign className={`h-5 w-5 sm:h-6 sm:w-6 ${
                feeStatus && feeStatus.remainingAmount === 0 ? 'text-green-600' : 'text-orange-600'
              }`} />
            </div>
            <BarChart3 className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Fee Status</p>
          {feeStatus ? (
            <>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                ${feeStatus.paidAmount.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {feeStatus.remainingAmount === 0 ? 'Paid in Full' : `$${feeStatus.remainingAmount.toLocaleString()} Due`}
              </p>
            </>
          ) : (
            <p className="text-base sm:text-lg text-gray-500">No fees</p>
          )}
        </div>
      </div>

      {/* Ineligibility Alerts */}
      {ineligibilityAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl shadow-md p-4 sm:p-6 mb-6 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-red-900 mb-3 text-sm sm:text-base">Ineligibility Alerts</h3>
              <div className="space-y-2">
                {ineligibilityAlerts.map((alert, index) => (
                  <div key={index} className="text-xs sm:text-sm text-red-800 break-words">
                    <span className="font-medium">{alert.class?.name} - {alert.subject?.name}:</span>{' '}
                    {alert.eligibilityReason}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transcript Summary */}
      {transcript && transcript.cumulativeGPA !== undefined && (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Academic Performance
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <p className="text-xs sm:text-sm text-gray-600 mb-2">Cumulative GPA</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-600">{transcript.cumulativeGPA?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl">
              <p className="text-xs sm:text-sm text-gray-600 mb-2">Percentage</p>
              <p className="text-2xl sm:text-3xl font-bold text-teal-600">
                {formatPercentage(transcript.cumulativePercentage)}
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl">
              <p className="text-xs sm:text-sm text-gray-600 mb-2">Credits Earned</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">
                {transcript.earnedCredits || 0} / {transcript.totalCredits || 0}
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
              <p className="text-xs sm:text-sm text-gray-600 mb-2">Status</p>
              <p className={`text-base sm:text-lg font-semibold capitalize ${
                transcript.isProbation ? 'text-red-600' : 'text-green-600'
              }`}>
                {transcript.isProbation ? 'Probation' : transcript.academicStatus || 'Active'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            Upcoming Deadlines
          </h2>
          <div className="space-y-3">
            {upcomingDeadlines.map((assignment) => (
              <div key={assignment._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl hover:shadow-md transition-all">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base break-words">{assignment.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {assignment.type} • {assignment.totalMarks} marks
                  </p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">{formatDate(assignment.dueDate)}</p>
                  {assignment.submissionStatus ? (
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium mt-1">Submitted</span>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700 font-medium mt-1">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Enrollments */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-600" />
          Current Enrollments
        </h2>
        <div className="space-y-3">
          {enrollments.length > 0 ? (
            enrollments.map((enrollment) => (
              <div key={enrollment._id} className="p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                      {enrollment.class?.name} - {enrollment.subject?.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {enrollment.semester?.name} • {enrollment.subject?.credits} Credits
                    </p>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2">
                      <span className="text-xs sm:text-sm">
                        Attendance: <span className={`font-semibold ${
                          (enrollment.attendancePercentage || 0) >= 75 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatPercentage(enrollment.attendancePercentage)}
                        </span>
                      </span>
                      {enrollment.grade && (
                        <span className="text-xs sm:text-sm">
                          Grade: <span className="font-semibold text-purple-600">{enrollment.grade}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-left lg:text-right shrink-0">
                    {enrollment.isEligible ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-100 to-teal-100 text-green-700 rounded-full text-xs sm:text-sm font-medium">
                        <CheckCircle className="h-4 w-4" />
                        Eligible
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-100 to-orange-100 text-red-700 rounded-full text-xs sm:text-sm font-medium">
                        <AlertTriangle className="h-4 w-4" />
                        Ineligible
                      </span>
                    )}
                  </div>
                </div>
                {!enrollment.isEligible && enrollment.eligibilityReason && (
                  <p className="text-xs sm:text-sm text-red-600 mt-3 break-words">{enrollment.eligibilityReason}</p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No enrollments found</p>
            </div>
          )}
        </div>
      </div>

      {/* Latest Marksheets */}
      {latestMarksheets.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-600" />
            Recent Results
          </h2>
          <div className="space-y-3">
            {latestMarksheets.map((marksheet) => (
              <div key={marksheet._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gradient-to-r from-purple-50 to-teal-50 rounded-xl hover:shadow-md transition-all">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base break-words">{marksheet.subject?.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">{marksheet.semester?.name}</p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <p className="text-base sm:text-lg font-bold text-gray-900">
                    {marksheet.percentage?.toFixed(1)}% ({marksheet.letterGrade})
                  </p>
                  <span className={`text-xs sm:text-sm font-medium ${
                    marksheet.isPassed ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {marksheet.isPassed ? 'Passed' : 'Failed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
