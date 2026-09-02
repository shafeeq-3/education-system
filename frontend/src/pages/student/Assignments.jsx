import { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle, Clock, AlertCircle, Loader2, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function StudentAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    if (user?._id) {
      fetchAssignments();
    }
  }, [user]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/assignments/student/${user._id}`);
      const assignmentData = response.data.data.items || [];
      
      // Fetch submissions for each assignment
      const assignmentsWithSubmissions = await Promise.all(
        assignmentData.map(async (assignment) => {
          try {
            const submissionRes = await axios.get(`/submissions?assignmentId=${assignment._id}&studentId=${user._id}`);
            const submissions = submissionRes.data.data.items || [];
            return {
              ...assignment,
              submission: submissions.length > 0 ? submissions[0] : null
            };
          } catch (err) {
            return { ...assignment, submission: null };
          }
        })
      );
      
      setAssignments(assignmentsWithSubmissions);
    } catch (err) {
      console.error('Assignment fetch error:', err);
      error(err.response?.data?.error?.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await axios.post('/submissions', {
        assignment: selectedAssignment._id,
        student: user._id,
        content: submissionText,
        status: 'submitted'
      });
      
      success('Assignment submitted successfully!');
      setShowSubmitModal(false);
      setSelectedAssignment(null);
      setSubmissionText('');
      fetchAssignments();
    } catch (err) {
      error(err.response?.data?.error?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const getAssignmentStatus = (assignment) => {
    if (assignment.submission) {
      if (assignment.submission.obtainedMarks !== undefined && assignment.submission.obtainedMarks !== null) {
        return { status: 'graded', label: 'Graded', color: 'bg-gradient-to-r from-green-100 to-teal-100 text-green-800', icon: CheckCircle };
      }
      return { status: 'submitted', label: 'Submitted', color: 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800', icon: CheckCircle };
    }
    
    const now = new Date();
    const due = new Date(assignment.dueDate);
    
    if (now > due) {
      return { status: 'overdue', label: 'Overdue', color: 'bg-gradient-to-r from-red-100 to-orange-100 text-red-800', icon: AlertCircle };
    }
    
    return { status: 'pending', label: 'Pending', color: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800', icon: Clock };
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getAssignmentStatus(assignment).status;
    const matchesFilter = filterStatus === 'all' || status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Assignments</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">View and submit your assignments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4">
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="all">All Assignments</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="graded">Graded</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredAssignments.map((assignment) => {
          const statusInfo = getAssignmentStatus(assignment);
          const StatusIcon = statusInfo.icon;
          
          return (
            <div key={assignment._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-4 sm:p-6 animate-scale-in">
              <div className="mb-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words flex-1">{assignment.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shrink-0 ${statusInfo.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {statusInfo.label}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 break-words">
                  {assignment.class?.name || 'Class'} - {assignment.subject?.name || 'Subject'}
                </p>
              </div>

              {assignment.description && (
                <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2 break-words">{assignment.description}</p>
              )}
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Total Marks:</span>
                  <span className="font-medium">{assignment.totalMarks}</span>
                </div>

                {assignment.submission && assignment.submission.obtainedMarks !== undefined && assignment.submission.obtainedMarks !== null && (
                  <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t">
                    <span className="text-gray-600">Your Score:</span>
                    <span className="font-bold text-green-600">
                      {assignment.submission.obtainedMarks} / {assignment.totalMarks}
                    </span>
                  </div>
                )}

                {!assignment.submission && statusInfo.status !== 'overdue' && (
                  <button
                    onClick={() => {
                      setSelectedAssignment(assignment);
                      setShowSubmitModal(true);
                    }}
                    className="w-full mt-4 px-4 py-2.5 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Submit Assignment
                  </button>
                )}

                {assignment.submission && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-teal-50 rounded-lg">
                    <p className="text-xs text-gray-600">
                      Submitted on {new Date(assignment.submission.submittedAt).toLocaleDateString()}
                    </p>
                    {assignment.submission.feedback && (
                      <p className="text-xs text-gray-700 mt-2 break-words">
                        <span className="font-medium">Feedback:</span> {assignment.submission.feedback}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No assignments found</p>
        </div>
      )}

      {showSubmitModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Submit Assignment</h2>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  setSelectedAssignment(null);
                  setSubmissionText('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <p className="text-sm text-gray-600 break-words">{selectedAssignment.title}</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Submission <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Enter your submission text or paste links to your work..."
                  rows="6"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSubmitModal(false);
                    setSelectedAssignment(null);
                    setSubmissionText('');
                  }}
                  className="w-full sm:flex-1 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:flex-1 px-6 py-2.5 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
