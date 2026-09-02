import { useState, useEffect } from 'react';
import { FileText, Save, Upload, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function TeacherGrades() {
  const { user } = useAuth();
  const [view, setView] = useState('submissions');
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [marksheets, setMarksheets] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    if (user?._id) {
      fetchAssignments();
      fetchTeacherClasses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedAssignment) {
      fetchSubmissions();
    }
  }, [selectedAssignment]);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents();
    }
  }, [selectedClass]);

  const fetchAssignments = async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/assignments/teacher/${user._id}`);
      const assignmentList = response.data.data.items || [];
      setAssignments(assignmentList);
      if (assignmentList.length > 0) {
        setSelectedAssignment(assignmentList[0]._id);
      }
    } catch (err) {
      error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(`/submissions/assignment/${selectedAssignment}`);
      setSubmissions(response.data.data.items || []);
    } catch (err) {
      error('Failed to load submissions');
    }
  };

  const fetchTeacherClasses = async () => {
    if (!user?._id) return;
    
    try {
      const response = await axios.get(`/classes?teacherId=${user._id}`);
      const classList = response.data.data.items || [];
      setClasses(classList);
      if (classList.length > 0) {
        setSelectedClass(classList[0]._id);
      }
    } catch (err) {
      error('Failed to load classes');
    }
  };

  const fetchClassStudents = async () => {
    try {
      const response = await axios.get(`/classes/${selectedClass}/students`);
      setStudents(response.data.data.students || []);
    } catch (err) {
      error('Failed to load students');
    }
  };

  const handleGradeSubmission = async (submissionId, marks, feedback) => {
    try {
      await axios.post(`/submissions/${submissionId}/grade`, {
        marksObtained: marks,
        feedback,
        gradedBy: user._id
      });
      success('Submission graded successfully!');
      fetchSubmissions();
    } catch (err) {
      error(err.response?.data?.error?.message || 'Failed to grade submission');
    }
  };

  const handleMarksheetChange = (studentId, field, value) => {
    setMarksheets(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleUploadMarksheets = async () => {
    try {
      setSaving(true);
      const marksheetRecords = students.map(student => ({
        studentId: student._id,
        subjectId: classes.find(c => c._id === selectedClass)?.subjectId?._id,
        semesterId: classes.find(c => c._id === selectedClass)?.semesterId?._id,
        marksObtained: marksheets[student._id]?.marksObtained || 0,
        totalMarks: marksheets[student._id]?.totalMarks || 100,
        grade: marksheets[student._id]?.grade || 'F',
        status: marksheets[student._id]?.status || 'fail',
        uploadedBy: user._id
      }));

      await axios.post('/marksheets/bulk', { marksheets: marksheetRecords });
      success('Marksheets uploaded successfully!');
      setMarksheets({});
    } catch (err) {
      error(err.response?.data?.error?.message || 'Failed to upload marksheets');
    } finally {
      setSaving(false);
    }
  };

  const calculateGrade = (marks, total) => {
    const percentage = (marks / total) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'A-';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 65) return 'B-';
    if (percentage >= 60) return 'C+';
    if (percentage >= 55) return 'C';
    if (percentage >= 50) return 'C-';
    return 'F';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading grading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Grading</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Grade submissions and upload marksheets</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6 animate-scale-in">
        <div className="flex gap-2">
          <button
            onClick={() => setView('submissions')}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all text-sm sm:text-base ${
              view === 'submissions' ? 'bg-gradient-primary text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Grade Submissions
          </button>
          <button
            onClick={() => setView('marksheets')}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all text-sm sm:text-base ${
              view === 'marksheets' ? 'bg-gradient-primary text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upload Marksheets
          </button>
        </div>
      </div>

      {view === 'submissions' ? (
        <>
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 animate-fade-in">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Assignment</label>
            <select
              value={selectedAssignment || ''}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              {assignments.map((assignment) => (
                <option key={assignment._id} value={assignment._id}>
                  {assignment.title} - {assignment.classId?.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission._id} className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                      {submission.studentId?.profile?.firstName} {submission.studentId?.profile?.lastName}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">{submission.studentId?.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted: {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  {submission.marksObtained !== undefined && (
                    <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-green-100 to-teal-100 text-green-800 flex items-center gap-1 shrink-0">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      Graded
                    </span>
                  )}
                </div>

                {submission.submissionText && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
                    <p className="text-xs sm:text-sm text-gray-700 break-words">{submission.submissionText}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Marks Obtained
                    </label>
                    <input
                      type="number"
                      defaultValue={submission.marksObtained}
                      placeholder="0"
                      min="0"
                      max={submission.assignmentId?.totalMarks}
                      id={`marks-${submission._id}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Out of {submission.assignmentId?.totalMarks}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Feedback
                    </label>
                    <textarea
                      id={`feedback-${submission._id}`}
                      defaultValue={submission.feedback}
                      placeholder="Provide feedback to the student..."
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      const marks = document.getElementById(`marks-${submission._id}`).value;
                      const feedback = document.getElementById(`feedback-${submission._id}`).value;
                      handleGradeSubmission(submission._id, parseInt(marks) || 0, feedback);
                    }}
                    className="px-4 sm:px-6 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Grade
                  </button>
                </div>
              </div>
            ))}

            {submissions.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No submissions yet</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 animate-fade-in">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
            <select
              value={selectedClass || ''}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              {classes.map((classItem) => (
                <option key={classItem._id} value={classItem._id}>
                  {classItem.name} - {classItem.subjectId?.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-gradient-to-r from-purple-50 to-teal-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Marks</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Grade</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student) => {
                    const marks = marksheets[student._id]?.marksObtained || 0;
                    const total = marksheets[student._id]?.totalMarks || 100;
                    const autoGrade = calculateGrade(marks, total);
                    
                    return (
                      <tr key={student._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900 text-xs sm:text-sm break-words">
                              {student.profile?.firstName} {student.profile?.lastName}
                            </p>
                            <p className="text-xs text-gray-600 break-words">{student.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={marksheets[student._id]?.marksObtained || ''}
                            onChange={(e) => handleMarksheetChange(student._id, 'marksObtained', e.target.value)}
                            placeholder="0"
                            min="0"
                            className="w-20 sm:w-24 mx-auto px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm text-center"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={marksheets[student._id]?.totalMarks || 100}
                            onChange={(e) => handleMarksheetChange(student._id, 'totalMarks', e.target.value)}
                            placeholder="100"
                            min="1"
                            className="w-20 sm:w-24 mx-auto px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm text-center"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <select
                            value={marksheets[student._id]?.grade || autoGrade}
                            onChange={(e) => handleMarksheetChange(student._id, 'grade', e.target.value)}
                            className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          >
                            <option value="A+">A+</option>
                            <option value="A">A</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B">B</option>
                            <option value="B-">B-</option>
                            <option value="C+">C+</option>
                            <option value="C">C</option>
                            <option value="C-">C-</option>
                            <option value="F">F</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <select
                            value={marksheets[student._id]?.status || (marks >= total * 0.5 ? 'pass' : 'fail')}
                            onChange={(e) => handleMarksheetChange(student._id, 'status', e.target.value)}
                            className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          >
                            <option value="pass">Pass</option>
                            <option value="fail">Fail</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {students.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No students in this class</p>
              </div>
            )}

            {students.length > 0 && (
              <div className="p-4 sm:p-6 border-t flex justify-end">
                <button
                  onClick={handleUploadMarksheets}
                  disabled={saving}
                  className="px-4 sm:px-6 py-2.5 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      Upload Marksheets
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
