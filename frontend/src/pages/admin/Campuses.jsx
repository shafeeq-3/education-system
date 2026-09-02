import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, MapPin, Building2, Mail, Phone, MapPinned, AlertCircle, Loader2, X } from 'lucide-react';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function Campuses() {
  const [campuses, setCampuses] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    institute: '', name: '', code: '', description: '', address: '', city: '',
    state: '', country: '', postalCode: '', phone: '', email: '', isActive: true
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    fetchCampuses();
    fetchInstitutes();
  }, [searchTerm, pagination.page]);

  const fetchInstitutes = async () => {
    try {
      const response = await axios.get('/institutes');
      setInstitutes(response.data.data.items || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchCampuses = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, limit: pagination.limit };
      if (searchTerm) params.search = searchTerm;
      const response = await axios.get('/campuses', { params });
      setCampuses(response.data.data.items || []);
      setPagination(prev => ({ ...prev, total: response.data.data.pagination?.total || 0 }));
    } catch (err) {
      error('Failed to load campuses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setSubmitting(true);
    try {
      const submitData = {
        instituteId: formData.institute, name: formData.name, code: formData.code,
        description: formData.description, address: formData.address, city: formData.city,
        state: formData.state, country: formData.country, postalCode: formData.postalCode,
        phone: formData.phone, email: formData.email, isActive: formData.isActive
      };
      if (editingId) {
        await axios.put(`/campuses/${editingId}`, submitData);
        success('Campus updated successfully');
      } else {
        await axios.post('/campuses', submitData);
        success('Campus created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchCampuses();
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
      const response = await axios.get(`/campuses/${id}`);
      const data = response.data.data;
      setFormData({
        institute: data.institute?._id || '', name: data.name || '', code: data.code || '',
        description: data.description || '', address: data.address || '', city: data.city || '',
        state: data.state || '', country: data.country || '', postalCode: data.postalCode || '',
        phone: data.phone || '', email: data.email || '', isActive: data.isActive
      });
      setEditingId(id);
      setShowModal(true);
    } catch (err) {
      error('Failed to fetch campus details');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this campus?')) return;
    try {
      await axios.delete(`/campuses/${id}`);
      success('Campus deleted successfully');
      fetchCampuses();
    } catch (err) {
      error('Failed to delete campus');
    }
  };

  const resetForm = () => {
    setFormData({
      institute: '', name: '', code: '', description: '', address: '', city: '',
      state: '', country: '', postalCode: '', phone: '', email: '', isActive: true
    });
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
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Campus Management</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage campus locations and facilities</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="w-full sm:w-auto px-4 py-3 bg-gradient-primary text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Campus
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search campuses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      ) : campuses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No campuses found</p>
          <p className="text-gray-400 text-sm mt-2">Create your first campus to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {campuses.map((campus) => (
            <div key={campus._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex gap-4 flex-1">
                  <div className="shrink-0 w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{campus.name}</h3>
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 font-medium">
                        {campus.code}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        campus.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {campus.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {campus.description && (
                      <p className="text-sm text-gray-600 mb-3">{campus.description}</p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-gray-500 block">Institute:</span>
                          <p className="font-medium text-gray-900">{campus.institute?.name || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-gray-500 block">Location:</span>
                          <p className="font-medium text-gray-900">{campus.city}, {campus.country}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Mail className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-gray-500 block">Email:</span>
                          <p className="font-medium text-gray-900 break-all">{campus.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-gray-500 block">Phone:</span>
                          <p className="font-medium text-gray-900">{campus.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPinned className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-gray-500 block">Address:</span>
                          <p className="font-medium text-gray-900">{campus.address}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex lg:flex-col gap-2">
                  <button
                    onClick={() => handleEdit(campus._id)}
                    className="flex-1 lg:flex-none px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(campus._id)}
                    className="flex-1 lg:flex-none px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Campus' : 'Create Campus'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Institute Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institute <span className="text-red-500">*</span>
                </label>
                <select
                  name="institute"
                  value={formData.institute}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2.5 border ${
                    fieldErrors.institute ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                >
                  <option value="">Select Institute</option>
                  {institutes.map(inst => (
                    <option key={inst._id} value={inst._id}>{inst.name}</option>
                  ))}
                </select>
                {fieldErrors.institute && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {fieldErrors.institute}
                  </p>
                )}
              </div>

              {/* Name and Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campus Name <span className="text-red-500">*</span>
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
                    placeholder="Main Campus"
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
                    Campus Code <span className="text-red-500">*</span>
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
                    placeholder="MC01"
                  />
                  {fieldErrors.code && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {fieldErrors.code}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Campus description..."
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Street address"
                />
              </div>

              {/* City, State, Country, Postal Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Postal code"
                  />
                </div>
              </div>

              {/* Phone and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="+1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="campus@example.com"
                  />
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label className="text-sm font-medium text-gray-700">Active Campus</label>
              </div>

              {/* Buttons */}
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
                    <>{editingId ? 'Update' : 'Create'} Campus</>
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
