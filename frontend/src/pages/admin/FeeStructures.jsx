import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, DollarSign, AlertCircle, Loader2, X } from 'lucide-react';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function FeeStructures() {
  const [feeStructures, setFeeStructures] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    programId: '', 
    academicYearId: '', 
    name: '',
    components: [
      { name: 'tuition', label: 'Tuition Fee', amount: '', isMandatory: true },
      { name: 'lab', label: 'Lab Fee', amount: '', isMandatory: false },
      { name: 'library', label: 'Library Fee', amount: '', isMandatory: false },
      { name: 'sports', label: 'Sports Fee', amount: '', isMandatory: false },
      { name: 'other', label: 'Other Fees', amount: '', isMandatory: false }
    ],
    dueDate: '',
    description: ''
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    fetchFeeStructures();
    fetchDropdownData();
  }, [searchTerm, pagination.page]);

  const fetchDropdownData = async () => {
    try {
      const [programsRes, yearsRes] = await Promise.all([
        axios.get('/programs'),
        axios.get('/academic-years')
      ]);
      setPrograms(programsRes.data.data.items || []);
      setAcademicYears(yearsRes.data.data.items || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchFeeStructures = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, limit: pagination.limit };
      if (searchTerm) params.search = searchTerm;
      const response = await axios.get('/fee-structures', { params });
      setFeeStructures(response.data.data.items || []);
      setPagination(prev => ({ ...prev, total: response.data.data.pagination?.total || 0 }));
    } catch (err) {
      error('Failed to load fee structures');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const total = formData.components.reduce((sum, comp) => {
      return sum + (parseFloat(comp.amount) || 0);
    }, 0);
    return total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setSubmitting(true);
    try {
      // Filter out components with no amount
      const validComponents = formData.components.filter(c => c.amount && parseFloat(c.amount) > 0);
      
      const submitData = {
        ...formData,
        components: validComponents.map(c => ({
          name: c.name,
          label: c.label,
          amount: parseFloat(c.amount),
          isMandatory: c.isMandatory
        }))
      };
      
      if (editingId) {
        await axios.put(`/fee-structures/${editingId}`, submitData);
        success('Fee structure updated successfully');
      } else {
        await axios.post('/fee-structures', submitData);
        success('Fee structure created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchFeeStructures();
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
      const response = await axios.get(`/fee-structures/${id}`);
      const data = response.data.data;
      
      // Map components or create default structure
      const components = data.components && data.components.length > 0 
        ? data.components.map(c => ({
            name: c.name,
            label: c.label || c.name,
            amount: c.amount.toString(),
            isMandatory: c.isMandatory !== undefined ? c.isMandatory : true
          }))
        : [
            { name: 'tuition', label: 'Tuition Fee', amount: '', isMandatory: true },
            { name: 'lab', label: 'Lab Fee', amount: '', isMandatory: false },
            { name: 'library', label: 'Library Fee', amount: '', isMandatory: false },
            { name: 'sports', label: 'Sports Fee', amount: '', isMandatory: false },
            { name: 'other', label: 'Other Fees', amount: '', isMandatory: false }
          ];
      
      setFormData({
        programId: data.program?._id || '',
        academicYearId: data.academicYear?._id || '',
        name: data.name || '',
        components: components,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '',
        description: data.description || ''
      });
      setEditingId(id);
      setShowModal(true);
    } catch (err) {
      error('Failed to fetch fee structure details');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this fee structure?')) return;
    try {
      await axios.delete(`/fee-structures/${id}`);
      success('Fee structure deleted successfully');
      fetchFeeStructures();
    } catch (err) {
      error('Failed to delete fee structure');
    }
  };

  const resetForm = () => {
    setFormData({
      programId: '', 
      academicYearId: '', 
      name: '',
      components: [
        { name: 'tuition', label: 'Tuition Fee', amount: '', isMandatory: true },
        { name: 'lab', label: 'Lab Fee', amount: '', isMandatory: false },
        { name: 'library', label: 'Library Fee', amount: '', isMandatory: false },
        { name: 'sports', label: 'Sports Fee', amount: '', isMandatory: false },
        { name: 'other', label: 'Other Fees', amount: '', isMandatory: false }
      ],
      dueDate: '',
      description: ''
    });
    setEditingId(null);
    setFieldErrors({});
  };

  const handleComponentChange = (index, field, value) => {
    const newComponents = [...formData.components];
    newComponents[index][field] = value;
    setFormData(prev => ({ ...prev, components: newComponents }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Fee Structure Management</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage program fee structures</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="w-full sm:w-auto px-4 py-3 bg-gradient-primary text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Fee Structure
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search fee structures..."
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
      ) : feeStructures.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No fee structures found</p>
          <p className="text-gray-400 text-sm mt-2">Create your first fee structure to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {feeStructures.map((fee) => (
            <div key={fee._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3 flex-1">
                  <div className="shrink-0 w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 break-words">{fee.program?.name || 'N/A'}</h3>
                    <p className="text-sm text-gray-600">{fee.academicYear?.year || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm mb-4">
                {fee.components && fee.components.length > 0 ? (
                  <>
                    {fee.components.map((component, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-500 capitalize">{component.label || component.name}:</span>
                        <span className="font-medium text-gray-900">${component.amount}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 border-t font-semibold">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-purple-600">${fee.totalAmount}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500 text-center py-2">No fee components</div>
                )}
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleEdit(fee._id)}
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Edit2 className="h-4 w-4" />
                  <span className="hidden xs:inline">Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(fee._id)}
                  className="flex-1 px-3 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden xs:inline">Delete</span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Fee Structure' : 'Create Fee Structure'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(90vh-120px)] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="programId"
                    value={formData.programId}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2.5 border ${
                      fieldErrors.programId ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                  >
                    <option value="">Select Program</option>
                    {programs.map(program => (
                      <option key={program._id} value={program._id}>{program.name}</option>
                    ))}
                  </select>
                  {fieldErrors.programId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {fieldErrors.programId}
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Fee structure name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Fee Components <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {formData.components.map((component, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={component.label}
                          onChange={(e) => handleComponentChange(index, 'label', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                          placeholder="Fee name"
                        />
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          value={component.amount}
                          onChange={(e) => handleComponentChange(index, 'amount', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="flex items-center pt-2">
                        <input
                          type="checkbox"
                          checked={component.isMandatory}
                          onChange={(e) => handleComponentChange(index, 'isMandatory', e.target.checked)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <label className="ml-2 text-xs text-gray-600">Required</label>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                    <span className="text-lg font-bold text-purple-600">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Fee structure description..."
                />
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
                    <>{editingId ? 'Update' : 'Create'} Fee Structure</>
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
