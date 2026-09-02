import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, BookMarked, AlertCircle, Loader2, X } from 'lucide-react';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function Semesters() {
  const [semesters, setSemesters] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '', code: '', academicYearId: '', startDate: '', endDate: '', isActive: true
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    fetchSemesters();
    fetchAcademicYears();
  }, [searchTerm, pagination.page]);

  const fetchAcademicYears = async () => {
    try {
      const response = await axios.get('/academic-years');
      setAcademicYears(response.data.data.items || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, limit: pagination.limit };
      if (searchTerm) params.search = searchTerm;
      const response = await axios.get('/semesters', { params });
      setSemesters(response.data.data.items || []);
      setPagination(prev => ({ ...prev, total: response.data.data.pagination?.total || 0 }));
    } catch (err) {
      error('Failed to load semesters');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setSubmitting(true);
    try {
      if (editingId) {
        await axios.put(`/semesters/${editingId}`, formData);
        success('Semester updated successfully');
      } else {
        await axios.post('/semesters', formData);
        success('Semester created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchSemesters();
    } catch (err) {
      if (err.response?.data?.error?.errors) {
        const errors = {};
        err.response.data.error.errors.forEach(e => {
          errors[e.field] = e.message;
        });
        setFieldErrors(errors);
      } else {
        error(err.response?.data?.error?.message || 'Operation failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      const response = await axios.get(`/semesters/${id}`);
      const data = response.data.data;
      setFormData({
        name: data.name || '', code: data.code || '', 
        academicYearId: data.academicYear?._id || '',
        startDate: data.startDate?.split('T')[0] || '', 
        endDate: data.endDate?.split('T')[0] || '',
        isActive: data.isActive
      });
      setEditingId(id);
      setShowModal(true);
    } catch (err) {
      error('Failed to fetch semester details');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this semester?')) return;
    try {
      await axios.delete(`/semesters/${id}`);
      success('Semester deleted successfully');
      fetchSemesters();
    } catch (err) {
      error('Failed to delete semester');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', code: '', academicYearId: '', startDate: '', endDate: '', isActive: true });
    setEditingId(null);
    setFieldErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Semester Management</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage academic semesters</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="w-full sm:w-auto px-4 py-3 bg-gradient-primary text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Semester
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search semesters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      ) : semesters.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <BookMarked className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No semesters found</p>
          <p className="text-gray-400 text-sm mt-2">Create your first semester to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {semesters.map((semester) => (
            <div key={semester._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3 flex-1">
                  <div className="shrink-0 w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <BookMarked className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{semester.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 font-medium">
                        {semester.code}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        semester.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {semester.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Academic Year:</span>
                  <span className="font-medium text-gray-900">{semester.academicYear?.year || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Start:</span>
                  <span className="font-medium text-gray-900">{new Date(semester.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">End:</span>
                  <span className="font-medium text-gray-900">{new Date(semester.endDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleEdit(semester._id)}
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(semester._id)}
                  className="flex-1 px-3 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.total > pagination.limit && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
          <button 
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            className="w-full sm:w-auto px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 font-medium">
            Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button 
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            className="w-full sm:w-auto px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Next
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Semester' : 'Create Semester'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2.5 border ${
                    fieldErrors.name ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                  placeholder="Fall 2024"
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2.5 border ${
                    fieldErrors.code ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                  placeholder="FALL24"
                />
                {fieldErrors.code && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {fieldErrors.code}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year <span className="text-red-500">*</span>
                </label>
                <select
                  name="academicYearId"
                  value={formData.academicYearId}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2.5 border ${
                    fieldErrors.academicYearId ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map(year => (
                    <option key={year._id} value={year._id}>{year.year}</option>
                  ))}
                </select>
                {fieldErrors.academicYearId && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {fieldErrors.academicYearId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2.5 border ${
                    fieldErrors.startDate ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                />
                {fieldErrors.startDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {fieldErrors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2.5 border ${
                    fieldErrors.endDate ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                />
                {fieldErrors.endDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {fieldErrors.endDate}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label className="text-sm font-medium text-gray-700">Active Semester</label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {editingId ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>{editingId ? 'Update' : 'Create'} Semester</>
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
