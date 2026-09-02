import { useState, useEffect } from 'react';
import { Award, TrendingUp, FileText, Download, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function StudentResults() {
  const { user } = useAuth();
  const [marksheets, setMarksheets] = useState([]);
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const { toasts, removeToast, error, success } = useToast();

  useEffect(() => {
    if (user?._id) {
      fetchResults();
    }
  }, [user]);

  const fetchResults = async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      const [marksheetsRes, transcriptRes] = await Promise.all([
        axios.get(`/marksheets/student/${user._id}`),
        axios.get(`/transcripts/student/${user._id}`)
      ]);
      
      setMarksheets(marksheetsRes.data.data.items || []);
      setTranscript(transcriptRes.data.data || null);
    } catch (err) {
      console.error('Failed to load results:', err);
      error(err.response?.data?.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (['A+', 'A'].includes(grade)) return 'text-green-600 bg-gradient-to-r from-green-100 to-teal-100';
    if (['A-', 'B+', 'B'].includes(grade)) return 'text-blue-600 bg-gradient-to-r from-blue-100 to-purple-100';
    if (['B-', 'C+', 'C'].includes(grade)) return 'text-yellow-600 bg-gradient-to-r from-yellow-100 to-orange-100';
    return 'text-red-600 bg-gradient-to-r from-red-100 to-orange-100';
  };

  const getStatusColor = (status) => {
    return status === 'pass' ? 'bg-gradient-to-r from-green-100 to-teal-100 text-green-800' : 'bg-gradient-to-r from-red-100 to-orange-100 text-red-800';
  };

  const groupedMarksheets = marksheets.reduce((acc, mark) => {
    const semId = mark.semester?._id || 'unknown';
    if (!acc[semId]) {
      acc[semId] = {
        semester: mark.semester,
        marksheets: []
      };
    }
    acc[semId].marksheets.push(mark);
    return acc;
  }, {});

  const filteredSemesters = selectedSemester === 'all' 
    ? Object.values(groupedMarksheets)
    : Object.values(groupedMarksheets).filter(sem => sem.semester?._id === selectedSemester);

  const calculateSemesterStats = (marksheets) => {
    const totalMarks = marksheets.reduce((sum, m) => sum + (m.obtainedMarks || 0), 0);
    const totalPossible = marksheets.reduce((sum, m) => sum + (m.totalMarks || 0), 0);
    const percentage = totalPossible > 0 ? (totalMarks / totalPossible * 100).toFixed(2) : 0;
    const passed = marksheets.every(m => m.isPassed);
    
    return { totalMarks, totalPossible, percentage, passed };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Results</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">View your academic performance and transcripts</p>
        </div>
        {transcript && (
          <button
            onClick={() => success('Download feature coming soon')}
            className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Download className="h-5 w-5" />
            Download Transcript
          </button>
        )}
      </div>

      {transcript && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-700 font-medium">CGPA</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-700">{transcript.cumulativeGPA?.toFixed(2) || '0.00'}</p>
              </div>
              <Award className="h-6 w-6 sm:h-8 sm:w-8 text-purple-700" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-700 font-medium">Total Credits</p>
                <p className="text-2xl sm:text-3xl font-bold text-teal-700">{transcript.totalCreditsEarned || 0}</p>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-teal-700" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-100 to-teal-100 rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-700 font-medium">Percentage</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-700">{transcript.cumulativePercentage?.toFixed(1) || '0.0'}%</p>
              </div>
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-green-700" />
            </div>
          </div>

          <div className={`rounded-xl shadow-md p-4 sm:p-6 ${
            transcript.academicStatus === 'good_standing' ? 'bg-gradient-to-br from-green-100 to-teal-100' : 'bg-gradient-to-br from-yellow-100 to-orange-100'
          }`}>
            <div>
              <p className="text-xs sm:text-sm text-gray-700 font-medium">Academic Status</p>
              <p className={`text-base sm:text-lg font-bold capitalize ${
                transcript.academicStatus === 'good_standing' ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {transcript.academicStatus?.replace('_', ' ') || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Semester Results</h2>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        >
          <option value="all">All Semesters</option>
          {Object.values(groupedMarksheets).map(sem => (
            <option key={sem.semester?._id} value={sem.semester?._id}>
              {sem.semester?.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-6">
        {filteredSemesters.map((semesterData, index) => {
          const stats = calculateSemesterStats(semesterData.marksheets);
          
          return (
            <div key={index} className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">{semesterData.semester?.name || 'Unknown Semester'}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{semesterData.semester?.academicYear?.year || 'N/A'}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.percentage}%</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                    stats.passed ? 'bg-gradient-to-r from-green-100 to-teal-100 text-green-800' : 'bg-gradient-to-r from-red-100 to-orange-100 text-red-800'
                  }`}>
                    {stats.passed ? 'Passed' : 'Failed'}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-50 to-teal-50">
                    <tr>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-700">Subject</th>
                      <th className="px-3 sm:px-4 py-3 text-center text-xs font-medium text-gray-700">Code</th>
                      <th className="px-3 sm:px-4 py-3 text-center text-xs font-medium text-gray-700">Credits</th>
                      <th className="px-3 sm:px-4 py-3 text-center text-xs font-medium text-gray-700">Marks</th>
                      <th className="px-3 sm:px-4 py-3 text-center text-xs font-medium text-gray-700">Grade</th>
                      <th className="px-3 sm:px-4 py-3 text-center text-xs font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {semesterData.marksheets.map((mark) => (
                      <tr key={mark._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium text-gray-900 break-words">
                          {mark.subject?.name || 'N/A'}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-center text-gray-600">
                          {mark.subject?.code || 'N/A'}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-center text-gray-600">
                          {mark.subject?.credits || 0}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-center font-medium text-gray-900">
                          {mark.obtainedMarks || 0} / {mark.totalMarks || 0}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-center">
                          <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${getGradeColor(mark.letterGrade)}`}>
                            {mark.letterGrade || 'N/A'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-center">
                          <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(mark.isPassed ? 'pass' : 'fail')}`}>
                            {mark.isPassed ? 'Pass' : 'Fail'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gradient-to-r from-purple-50 to-teal-50">
                    <tr>
                      <td colSpan="3" className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold text-gray-900">Total</td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-center font-bold text-gray-900">
                        {stats.totalMarks} / {stats.totalPossible}
                      </td>
                      <td colSpan="2" className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-center font-bold text-purple-600">
                        {stats.percentage}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {marksheets.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No results available yet</p>
          <p className="text-sm text-gray-400 mt-2">Your results will appear here once published</p>
        </div>
      )}
    </div>
  );
}
