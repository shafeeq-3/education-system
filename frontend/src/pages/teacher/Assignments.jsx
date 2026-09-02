import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, FileText, Loader2, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function TeacherAssignments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    dueDate: '',
    totalMarks: '',
    attachments: []
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    if (user?._id) {
      fetchAssignments();
      fetchTeacherClasses();
    }
  }, [user]);

  const fetchAssignments = async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/assignments/teacher/${user._id}`);
      setAssignments(response.data.data.items || []);
    } catch (err) {
      error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherClasses = async () => {
    if (!user?._id) return;
    
    try {
      const response = await axios.get(`/classes?teacherId=${user._id}`);
      setClasses(response.data.data.items || []);
    } catch (err) {
      error('Failed to load classes');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      if (editingAssignment) {
        await axios.put(`/assignments/${editingAssignment._id}`, formData);
        success('Assignment updated successfully!');
      } else {
        await axios.post('/assignments', formData);
        success('Assignment created successfully!');
      }
      
      setShowModal(false);
      setEditingAssignment(null);
      setFormData({ title: '', description: '', classId: '', dueDate: '', totalMarks: '', attachments: [] });
      fetchAssignments();
    } catch (err) {
      if (err.response?.data?.error?.details) {
        const newErrors = {};
        err.response.data.error.details.forEach(detail => {
          newErrors[detail.field] = detail.message;
        });
        setErrors(newErrors);
      } else {
        error(err.response?.data?.error?.message || 'Failed to save assignment');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description || '',
      classId: assignment.classId?._id || assignment.classId,
      dueDate: assignment.dueDate?.split('T')[0] || '',
      totalMarks: assignment.totalMarks,
      attachments: assignment.attachments || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    
    try {
      await axios.delete(`/assignments/${id}`);
      success('Assignment deleted successfully!');
      fetchAssignments();
    } catch (err) {
      error(err.response?.data?.error?.message || 'Failed to delete assignment');
    }
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) return 'bg-gradient-to-r from-red-100 to-orange-100 text-red-800';
    if (daysUntilDue <= 3) return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800';
    return 'bg-gradient-to-r from-green-100 to-teal-100 text-green-800';
  };

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
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Assignments</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Create and manage assignments for your classes</p>
        </div>
        <button
          onClick={() => {
            setEditingAssignment(null);
            setFormData({ title: '', description: '', classId: '', dueDate: '', totalMarks: '', attachments: [] });
            setErrors({});
            setShowModal(true);
          }}
          className="px-4 sm:px-6 py-2.5 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Plus className="h-5 w-5" />
          Create Assignment
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6 animate-scale-in">
        <input
          type="text"
          placeholder="Search assignments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredAssignments.map((assignment) => (
          <div key={assignment._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-4 sm:p-6 animate-scale-in">
            <div className="flex justify-between items-start gap-2 mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 break-words">{assignment.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 break-words">{assignment.classId?.name}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleEdit(assignment)}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(assignment._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {assignment.description && (
              <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2 break-words">{assignment.description}</p>
            )}
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Due Date:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.dueDate)}`}>
                  {new Date(assignment.dueDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Total Marks:</span>
                <span className="font-medium">{assignment.totalMarks}</span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Submissions:</span>
                <span className="font-medium">{assignment.submissionCount || 0}</span>
              </div>

              <button
                onClick={() => navigate(`/assignments/${assignment._id}/submissions`)}
                className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-purple-50 to-teal-50 border border-purple-200 text-purple-700 rounded-lg hover:shadow-md transition-all font-medium flex items-center justify-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View Submissions
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No assignments found</p>
          <p className="text-sm text-gray-400 mt-2">Create your first assignment to get started</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                {editingAssignment ? 'Edit Assignment' : 'Create Assignment'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingAssignment(null);
                  setErrors({});
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Assignment 1: Data Structures"
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Assignment description and instructions..."
                  rows="4"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.classId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Class</option>
                  {classes.map((classItem) => (
                    <option key={classItem._id} value={classItem._id}>
                      {classItem.name} - {classItem.subjectId?.name}
                    </option>
                  ))}
                </select>
                {errors.classId && <p className="text-red-500 text-xs mt-1">{errors.classId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.dueDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Marks <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                  placeholder="100"
                  min="1"
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.totalMarks ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.totalMarks && <p className="text-red-500 text-xs mt-1">{errors.totalMarks}</p>}
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingAssignment(null);
                    setErrors({});
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
                      {editingAssignment ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingAssignment ? 'Update' : 'Create'
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
