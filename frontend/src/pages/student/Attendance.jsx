import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function StudentAttendance() {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toasts, removeToast, error } = useToast();

  useEffect(() => {
    if (user?._id) {
      fetchAttendance();
    }
  }, [user]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/attendance/student/${user._id}`);
      const data = response.data.data;
      setAttendanceData(data.items || []);
      
      // Use statistics from backend if available
      if (data.statistics) {
        setSummary(data.statistics);
      } else {
        calculateSummary(data.items || []);
      }
    } catch (err) {
      console.error('Attendance fetch error:', err);
      error(err.response?.data?.error?.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (records) => {
    const byClass = {};
    
    records.forEach(record => {
      const classId = record.classId?._id || record.classId;
      const className = record.classId?.name || 'Unknown';
      
      if (!byClass[classId]) {
        byClass[classId] = {
          className,
          subjectName: record.classId?.subjectId?.name || 'Unknown',
          present: 0,
          absent: 0,
          late: 0,
          total: 0
        };
      }
      
      byClass[classId].total++;
      if (record.status === 'present') byClass[classId].present++;
      if (record.status === 'absent') byClass[classId].absent++;
      if (record.status === 'late') byClass[classId].late++;
    });

    const summaryArray = Object.values(byClass).map(cls => ({
      ...cls,
      percentage: cls.total > 0 ? ((cls.present + cls.late) / cls.total * 100).toFixed(1) : 0
    }));

    setSummary(summaryArray);
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPercentageBg = (percentage) => {
    if (percentage >= 75) return 'bg-gradient-to-br from-green-50 to-teal-50';
    if (percentage >= 60) return 'bg-gradient-to-br from-yellow-50 to-orange-50';
    return 'bg-gradient-to-br from-red-50 to-orange-50';
  };

  const getEligibilityStatus = (percentage) => {
    if (percentage >= 75) {
      return { text: 'Eligible', color: 'bg-gradient-to-r from-green-100 to-teal-100 text-green-800', icon: CheckCircle };
    }
    return { text: 'Not Eligible', color: 'bg-gradient-to-r from-red-100 to-orange-100 text-red-800', icon: AlertCircle };
  };

  const overallStats = summary ? {
    totalClasses: summary.reduce((sum, cls) => sum + cls.total, 0),
    totalPresent: summary.reduce((sum, cls) => sum + cls.present, 0),
    totalAbsent: summary.reduce((sum, cls) => sum + cls.absent, 0),
    totalLate: summary.reduce((sum, cls) => sum + cls.late, 0),
  } : null;

  const overallPercentage = overallStats && overallStats.totalClasses > 0
    ? ((overallStats.totalPresent + overallStats.totalLate) / overallStats.totalClasses * 100).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Track your attendance and eligibility status</p>
      </div>

      {overallStats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className={`rounded-xl shadow-md p-4 sm:p-6 ${getPercentageBg(overallPercentage)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Overall Attendance</p>
                  <p className={`text-2xl sm:text-3xl font-bold ${getPercentageColor(overallPercentage)}`}>
                    {overallPercentage}%
                  </p>
                </div>
                <TrendingUp className={`h-6 w-6 sm:h-8 sm:w-8 ${getPercentageColor(overallPercentage)}`} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Present</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">{overallStats.totalPresent}</p>
                </div>
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Absent</p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-600">{overallStats.totalAbsent}</p>
                </div>
                <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-teal-50 rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Classes</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">{overallStats.totalClasses}</p>
                </div>
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {overallPercentage < 75 && overallStats.totalClasses > 0 && (
            <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-600 rounded-xl shadow-md p-4 sm:p-6 animate-fade-in">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-red-900 text-sm sm:text-base">Attendance Warning</h3>
                  <p className="text-xs sm:text-sm text-red-700 mt-1 break-words">
                    Your attendance is below 75%. You need {Math.max(0, Math.ceil((75 * overallStats.totalClasses / 100) - (overallStats.totalPresent + overallStats.totalLate)))} more present days to become eligible for exams.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Subject-wise Attendance</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {summary?.map((classData, index) => {
          const eligibility = getEligibilityStatus(classData.percentage);
          const EligibilityIcon = eligibility.icon;
          
          return (
            <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-4 sm:p-6 animate-scale-in">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">{classData.subjectName}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 break-words">{classData.className}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shrink-0 ${eligibility.color}`}>
                  <EligibilityIcon className="h-3 w-3" />
                  {eligibility.text}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs sm:text-sm text-gray-600">Attendance Rate</span>
                  <span className={`text-xl sm:text-2xl font-bold ${getPercentageColor(classData.percentage)}`}>
                    {classData.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      classData.percentage >= 75 ? 'bg-gradient-to-r from-green-500 to-teal-600' :
                      classData.percentage >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                      'bg-gradient-to-r from-red-500 to-orange-600'
                    }`}
                    style={{ width: `${classData.percentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{classData.present}</p>
                  <p className="text-xs text-gray-600">Present</p>
                </div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-red-600">{classData.absent}</p>
                  <p className="text-xs text-gray-600">Absent</p>
                </div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">{classData.late}</p>
                  <p className="text-xs text-gray-600">Late</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-xs sm:text-sm text-gray-600">
                  Total Classes: <span className="font-medium text-gray-900">{classData.total}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {(!summary || summary.length === 0) && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No attendance records found</p>
        </div>
      )}
    </div>
  );
}
