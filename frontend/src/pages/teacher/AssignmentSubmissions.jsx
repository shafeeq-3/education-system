import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, XCircle, Clock, Download, Eye } from 'lucide-react';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function AssignmentSubmissions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    fetchAssignmentDetails();
    fetchSubmissions();
  }, [id]);

  const fetchAssignmentDetails = async () => {
    try {
      const response = await axios.get(`/assignments/${id}`);
      setAssignment(response.data.data);
    } catch (err) {
      error('Failed to load assignment details');
    }
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/assignments/${id}/submissions`);
      setSubmissions(response.data.data || []);
    } catch (err) {
      error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (submissionId) => {
    if (!grade || parseFloat(grade) < 0 || parseFloat(grade) > (assignment?.totalMarks || 100)) {
      error('Please enter a valid grade');
      return;
    }

    try {
      setGrading(true);
      await axios.put(`/submissions/${submissionId}/grade`, {
        obtainedMarks: parseFloat(grade),
        feedback: feedback
      });
      success('Submission graded successfully');
      setSelectedSubmission(null);
      setGrade('');
      setFeedback('');
      fetchSubmissions();
    } catch (err) {
      error('Failed to grade submission');
    } finally {
      setGrading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      submitted: 'bg-blue-100 text-blue-800',
      graded: 'bg-green-100 text-green-800',
      late: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'graded':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'submitted':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'late':
        return <XCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="mb-6">
        <button
          onClick={() => navigate('/teacher/assignments')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Assignments
        </button>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{assignment?.title}</h1>
          <p className="text-gray-600 mb-4">{assignment?.description}</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total Marks:</span>
              <span className="ml-2 font-semibold text-gray-900">{assignment?.totalMarks || 100}</span>
            </div>
            <div>
              <span className="text-gray-500">Due Date:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {assignment?.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Submissions:</span>
              <span className="ml-2 font-semibold text-gray-900">{submissions.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Student Submissions</h2>
        
        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No submissions yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-medium">
                        {submission.student?.profile?.firstName?.[0]}{submission.student?.profile?.lastName?.[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {submission.student?.profile?.firstName} {submission.student?.profile?.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">{submission.student?.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm mt-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(submission.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(submission.status)}`}>
                          {submission.status}
                        </span>
                      </div>
                      <div className="text-gray-600">
                        Submitted: {new Date(submission.submittedAt).toLocaleString()}
                      </div>
                      {submission.obtainedMarks !== undefined && (
                        <div className="font-semibold text-green-600">
                          Grade: {submission.obtainedMarks}/{assignment?.totalMarks || 100}
                        </div>
                      )}
                    </div>

                    {submission.content && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{submission.content}</p>
                      </div>
                    )}

                    {submission.feedback && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-900 mb-1">Feedback:</p>
                        <p className="text-sm text-blue-700">{submission.feedback}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    {submission.attachments && submission.attachments.length > 0 && (
                      <a
                        href={submission.attachments[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-50 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    )}
                    
                    {submission.status !== 'graded' && (
                      <button
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setGrade(submission.obtainedMarks?.toString() || '');
                          setFeedback(submission.feedback || '');
                        }}
                        className="px-4 py-2 bg-green-50 border border-green-300 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Grade
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Grade Submission</h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedSubmission.student?.profile?.firstName} {selectedSubmission.student?.profile?.lastName}
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade (out of {assignment?.totalMarks || 100}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  min="0"
                  max={assignment?.totalMarks || 100}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter grade"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter feedback for student..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setSelectedSubmission(null);
                    setGrade('');
                    setFeedback('');
                  }}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleGradeSubmission(selectedSubmission._id)}
                  disabled={grading}
                  className="flex-1 px-4 py-2.5 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50"
                >
                  {grading ? 'Grading...' : 'Submit Grade'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
