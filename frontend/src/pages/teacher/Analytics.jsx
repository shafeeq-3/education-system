import { useState, useEffect } from 'react';
import { TrendingUp, Users, Clock, CheckCircle, BarChart3, Calendar, Download, Loader2 } from 'lucide-react';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function TeacherAnalytics() {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });
  const [classPerformance, setClassPerformance] = useState([]);
  const { toasts, removeToast, error } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      
      const performance = await axios.get('/analytics/teacher/class-performance', { params });
      setClassPerformance(performance.data.data || []);
    } catch (err) {
      error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallStats = () => {
    const totalStudents = classPerformance.reduce((sum, cls) => sum + (cls.totalStudents || 0), 0);
    const totalAssignments = classPerformance.reduce((sum, cls) => sum + (cls.totalAssignments || 0), 0);
    const avgAttendance = classPerformance.length > 0
      ? classPerformance.reduce((sum, cls) => sum + (cls.avgAttendance || 0), 0) / classPerformance.length
      : 0;
    const avgEligibility = classPerformance.length > 0
      ? classPerformance.reduce((sum, cls) => sum + (cls.eligibilityRate || 0), 0) / classPerformance.length
      : 0;
    
    return { totalStudents, totalAssignments, avgAttendance, avgEligibility };
  };

  const stats = calculateOverallStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Teaching Analytics</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Performance insights and teaching metrics</p>
        </div>
        <button className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-purple-50 to-teal-50 border border-purple-200 text-purple-700 rounded-lg hover:shadow-md transition-all font-medium flex items-center justify-center gap-2 whitespace-nowrap">
          <Download className="h-4 w-4 sm:h-5 sm:w-5" />
          Export Report
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 animate-scale-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-teal-100 rounded-lg">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Students</p>
                  <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">{stats.totalStudents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Assignments</p>
                  <p className="text-xl sm:text-2xl font-bold text-indigo-600">{stats.totalAssignments}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Avg Attendance</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.avgAttendance.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Avg Eligibility</p>
                  <p className="text-xl sm:text-2xl font-bold text-orange-600">{stats.avgEligibility.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-fade-in">
            <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              My Classes Performance
            </h3>
            {classPerformance.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No class data available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-gradient-to-r from-purple-50 to-teal-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Class</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900">Students</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900">Assignments</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900">Avg Attendance</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900">Eligibility</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {classPerformance.map((cls, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 break-words">{cls.className}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{cls.totalStudents}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{cls.totalAssignments}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{cls.avgAttendance?.toFixed(1)}%</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{cls.eligibilityRate?.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
