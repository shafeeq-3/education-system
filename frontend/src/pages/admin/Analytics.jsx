import { useState, useEffect } from 'react';
import { TrendingUp, Users, AlertCircle, DollarSign, BookOpen, Calendar, BarChart3, Download, Loader2 } from 'lucide-react';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState('academic');
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    programId: '',
    semesterId: ''
  });
  
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const { toasts, removeToast, success, error } = useToast();
  
  // Analytics data
  const [attendanceTrends, setAttendanceTrends] = useState([]);
  const [assignmentRates, setAssignmentRates] = useState([]);
  const [resultAnalytics, setResultAnalytics] = useState(null);
  const [gpaTrends, setGPATrends] = useState([]);
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [feeCollectionTrends, setFeeCollectionTrends] = useState([]);
  const [outstandingDuesAging, setOutstandingDuesAging] = useState([]);
  const [salaryExpenditureTrends, setSalaryExpenditureTrends] = useState([]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeTab, filters]);

  const fetchDropdownData = async () => {
    try {
      const [p, s] = await Promise.all([
        axios.get('/programs'),
        axios.get('/semesters')
      ]);
      setPrograms(p.data.data.items || []);
      setSemesters(s.data.data.items || []);
    } catch (err) {
      error('Failed to load filters');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'academic') {
        await fetchAcademicData();
      } else if (activeTab === 'students') {
        await fetchStudentData();
      } else if (activeTab === 'financial') {
        await fetchFinancialData();
      }
    } catch (err) {
      error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAcademicData = async () => {
    try {
      // Remove empty parameters
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.programId) params.programId = filters.programId;
      if (filters.semesterId) params.semesterId = filters.semesterId;
      
      const [attendance, assignments, results, gpa] = await Promise.all([
        axios.get('/analytics/attendance/trends', { params }),
        axios.get('/analytics/assignments/submission-rates', { params }),
        axios.get('/analytics/results', { params }),
        axios.get('/analytics/gpa/trends', { params })
      ]);
      setAttendanceTrends(attendance.data.data || []);
      setAssignmentRates(assignments.data.data || []);
      setResultAnalytics(results.data.data || null);
      setGPATrends(gpa.data.data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchStudentData = async () => {
    try {
      // Remove empty parameters
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.programId) params.programId = filters.programId;
      if (filters.semesterId) params.semesterId = filters.semesterId;
      
      const response = await axios.get('/analytics/students/at-risk', { params });
      setAtRiskStudents(response.data.data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchFinancialData = async () => {
    try {
      // Remove empty parameters
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.programId) params.programId = filters.programId;
      if (filters.semesterId) params.semesterId = filters.semesterId;
      
      const [feeCollection, duesAging, salaryExpenditure] = await Promise.all([
        axios.get('/analytics/finance/fee-collection', { params }),
        axios.get('/analytics/finance/outstanding-dues-aging', { params }),
        axios.get('/analytics/finance/salary-expenditure', { params })
      ]);
      setFeeCollectionTrends(feeCollection.data.data || []);
      setOutstandingDuesAging(duesAging.data.data || []);
      setSalaryExpenditureTrends(salaryExpenditure.data.data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const tabs = [
    { id: 'academic', label: 'Academic Analytics', icon: BookOpen },
    { id: 'students', label: 'Student Analytics', icon: Users },
    { id: 'financial', label: 'Financial Analytics', icon: DollarSign }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Comprehensive insights and data analytics</p>
        </div>
        <button
          onClick={() => success('Export feature coming soon')}
          className="w-full sm:w-auto px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
        >
          <Download className="h-5 w-5" />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
            <select
              value={filters.programId}
              onChange={(e) => setFilters(prev => ({ ...prev, programId: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="">All Programs</option>
              {programs.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
            <select
              value={filters.semesterId}
              onChange={(e) => setFilters(prev => ({ ...prev, semesterId: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="">All Semesters</option>
              {semesters.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6 bg-white rounded-xl shadow-md p-2 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center justify-center gap-2 px-4 py-3 font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-primary text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="h-5 w-5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-12 bg-white rounded-xl shadow-md">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* Academic Analytics */}
          {activeTab === 'academic' && (
            <div className="space-y-6">
              {/* Attendance Trends */}
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Attendance Trends
                </h3>
                {attendanceTrends.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No attendance data available</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-purple-50 to-teal-50">
                        <tr>
                          <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Period</th>
                          <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">Sessions</th>
                          <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">Present</th>
                          <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">Absent</th>
                          <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">Rate %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {attendanceTrends.map((trend, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm">{trend.period}</td>
                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-right">{trend.totalSessions}</td>
                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-right text-green-600 font-medium">{trend.totalPresent}</td>
                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-right text-red-600 font-medium">{trend.totalAbsent}</td>
                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-right font-semibold text-purple-600">
                              {trend.attendancePercentage?.toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Assignment Submission Rates */}
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-teal-600" />
                  Assignment Submission Rates
                </h3>
                {assignmentRates.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No assignment data available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignmentRates.slice(0, 5).map((assignment, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 break-words">{assignment.title}</h4>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">
                              Due: {new Date(assignment.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 font-medium self-start">
                            {assignment.type}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
                          <div className="bg-blue-50 rounded-lg p-2">
                            <span className="text-gray-600 block mb-1">Submission:</span>
                            <p className="font-semibold text-blue-600">
                              {assignment.submissionRate?.toFixed(1)}%
                            </p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-2">
                            <span className="text-gray-600 block mb-1">On Time:</span>
                            <p className="font-semibold text-green-600">
                              {assignment.onTimeRate?.toFixed(1)}%
                            </p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-2">
                            <span className="text-gray-600 block mb-1">Graded:</span>
                            <p className="font-semibold text-purple-600">
                              {assignment.gradingCompletionRate?.toFixed(1)}%
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <span className="text-gray-600 block mb-1">Students:</span>
                            <p className="font-semibold text-gray-900">{assignment.totalStudents}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Result Analytics */}
              {resultAnalytics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Pass/Fail Distribution
                    </h3>
                    <div className="space-y-3">
                      {resultAnalytics.passFailRatio?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-teal-50 rounded-lg">
                          <span className="text-gray-700 font-medium">
                            {item._id ? 'Passed' : 'Failed'}
                          </span>
                          <span className={`font-bold text-lg ${item._id ? 'text-green-600' : 'text-red-600'}`}>
                            {item.count} students
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                      Grade Distribution
                    </h3>
                    <div className="space-y-3">
                      {resultAnalytics.gradeDistribution?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-teal-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Grade {item._id}</span>
                          <span className="font-bold text-lg text-purple-600">{item.count} students</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* GPA Trends */}
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  GPA Trends by Semester
                </h3>
                {gpaTrends.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No GPA data available</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-purple-50 to-teal-50">
                        <tr>
                          <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Semester</th>
                          <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">Sem GPA</th>
                          <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">Cum GPA</th>
                          <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">Students</th>
                          <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">Pass %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {gpaTrends.map((trend, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium">{trend.semesterName}</td>
                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-right font-semibold text-purple-600">
                              {trend.avgSemesterGPA}
                            </td>
                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-right font-semibold text-teal-600">
                              {trend.avgCumulativeGPA}
                            </td>
                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-right">{trend.totalStudents}</td>
                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-right text-green-600 font-semibold">
                              {trend.passRate?.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Student Analytics */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  At-Risk Students
                </h3>
                {atRiskStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No at-risk students identified</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-purple-50 to-teal-50">
                        <tr>
                          <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Student</th>
                          <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">Attendance</th>
                          <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">GPA</th>
                          <th className="px-3 sm:px-4 py-3 text-center text-xs sm:text-sm font-semibold text-gray-700">Eligible</th>
                          <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">Risk</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {atRiskStudents.slice(0, 10).map((student, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium break-words">
                              {student.student?.profile?.firstName || student.student?.username || 'Unknown'}{' '}
                              {student.student?.profile?.lastName || ''}
                            </td>
                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-right">
                              <span className={`font-semibold ${(student.attendancePercentage || 0) < 75 ? 'text-red-600' : 'text-green-600'}`}>
                                {(student.attendancePercentage || 0).toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-right font-medium">
                              {student.cumulativeGPA ? student.cumulativeGPA.toFixed(2) : 'N/A'}
                            </td>
                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-center">
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                student.isEligibleForExam 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {student.isEligibleForExam ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-right">
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                (student.riskScore || 0) >= 3 ? 'bg-red-100 text-red-800' :
                                (student.riskScore || 0) >= 2 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {student.riskScore || 0} / 6
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Financial Analytics */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              {/* Fee Collection Trends */}
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Fee Collection Trends
                </h3>
                {feeCollectionTrends.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No fee collection data available</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-purple-50 to-teal-50">
                        <tr>
                          <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Period</th>
                          <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">Collected</th>
                          <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">Payments</th>
                          <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">Avg</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {feeCollectionTrends.map((trend, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium">{trend.period}</td>
                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-right font-semibold text-green-600">
                              ₹{trend.totalCollected?.toLocaleString()}
                            </td>
                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-right">{trend.totalPayments}</td>
                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-right font-medium">
                              ₹{trend.avgPaymentAmount?.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Outstanding Dues Aging */}
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Outstanding Dues Aging Analysis
                </h3>
                {outstandingDuesAging.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No outstanding dues data available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {outstandingDuesAging.map((aging, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg hover:shadow-md transition-all">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{aging.agingBucket}</p>
                          <p className="text-sm text-gray-600 mt-1">{aging.studentCount} students • {aging.count} records</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-bold text-lg text-red-600">
                            ₹{aging.totalOutstanding?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Salary Expenditure Trends */}
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Salary Expenditure Trends
                </h3>
                {salaryExpenditureTrends.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No salary expenditure data available</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-purple-50 to-teal-50">
                        <tr>
                          <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Period</th>
                          <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">Total Paid</th>
                          <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">Staff</th>
                          <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">Avg Salary</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {salaryExpenditureTrends.map((trend, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium">{trend.period}</td>
                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-right font-semibold text-purple-600">
                              ₹{trend.totalPaid?.toLocaleString()}
                            </td>
                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-right">{trend.totalStaff}</td>
                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-right font-medium">
                              ₹{trend.avgSalary?.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

