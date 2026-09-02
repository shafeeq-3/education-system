import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, DollarSign, AlertCircle, Loader2, X } from 'lucide-react';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function SalaryStructures() {
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    designation: '',
    baseSalary: '',
    allowances: [
      { name: 'Housing Allowance', amount: '', isPercentage: false },
      { name: 'Transport Allowance', amount: '', isPercentage: false }
    ],
    deductions: [
      { name: 'Tax', amount: '', isPercentage: false },
      { name: 'Insurance', amount: '', isPercentage: false }
    ],
    effectiveFrom: '',
    description: ''
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    fetchSalaryStructures();
  }, [searchTerm, pagination.page]);

  const fetchSalaryStructures = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, limit: pagination.limit };
      if (searchTerm) params.search = searchTerm;
      const response = await axios.get('/salary-structures', { params });
      setSalaryStructures(response.data.data.items || []);
      setPagination(prev => ({ ...prev, total: response.data.data.pagination?.total || 0 }));
    } catch (err) {
      error('Failed to load salary structures');
    } finally {
      setLoading(false);
    }
  };

  const calculateNet = () => {
    const totalAllowances = formData.allowances.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0;
      if (item.isPercentage) {
        return sum + ((parseFloat(formData.baseSalary) || 0) * amount / 100);
      }
      return sum + amount;
    }, 0);
    
    const grossSalary = (parseFloat(formData.baseSalary) || 0) + totalAllowances;
    
    const totalDeductions = formData.deductions.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0;
      if (item.isPercentage) {
        return sum + (grossSalary * amount / 100);
      }
      return sum + amount;
    }, 0);
    
    return Math.max(0, grossSalary - totalDeductions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setSubmitting(true);
    try {
      const submitData = {
        designation: formData.designation,
        baseSalary: parseFloat(formData.baseSalary),
        allowances: formData.allowances.filter(a => a.amount && parseFloat(a.amount) > 0).map(a => ({
          name: a.name,
          amount: parseFloat(a.amount),
          isPercentage: a.isPercentage
        })),
        deductions: formData.deductions.filter(d => d.amount && parseFloat(d.amount) > 0).map(d => ({
          name: d.name,
          amount: parseFloat(d.amount),
          isPercentage: d.isPercentage
        })),
        effectiveFrom: formData.effectiveFrom ? new Date(formData.effectiveFrom).toISOString() : new Date().toISOString(),
        description: formData.description
      };
      
      if (editingId) {
        await axios.put(`/salary-structures/${editingId}`, submitData);
        success('Salary structure updated successfully');
      } else {
        await axios.post('/salary-structures', submitData);
        success('Salary structure created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchSalaryStructures();
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
      const response = await axios.get(`/salary-structures/${id}`);
      const data = response.data.data;
      
      setFormData({
        designation: data.designation || '',
        baseSalary: data.baseSalary?.toString() || '',
        allowances: data.allowances && data.allowances.length > 0 
          ? data.allowances.map(a => ({
              name: a.name,
              amount: a.amount.toString(),
              isPercentage: a.isPercentage || false
            }))
          : [
              { name: 'Housing Allowance', amount: '', isPercentage: false },
              { name: 'Transport Allowance', amount: '', isPercentage: false }
            ],
        deductions: data.deductions && data.deductions.length > 0
          ? data.deductions.map(d => ({
              name: d.name,
              amount: d.amount.toString(),
              isPercentage: d.isPercentage || false
            }))
          : [
              { name: 'Tax', amount: '', isPercentage: false },
              { name: 'Insurance', amount: '', isPercentage: false }
            ],
        effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom).toISOString().split('T')[0] : '',
        description: data.description || ''
      });
      setEditingId(id);
      setShowModal(true);
    } catch (err) {
      error('Failed to fetch salary structure details');
    }
  };

  const resetForm = () => {
    setFormData({
      designation: '',
      baseSalary: '',
      allowances: [
        { name: 'Housing Allowance', amount: '', isPercentage: false },
        { name: 'Transport Allowance', amount: '', isPercentage: false }
      ],
      deductions: [
        { name: 'Tax', amount: '', isPercentage: false },
        { name: 'Insurance', amount: '', isPercentage: false }
      ],
      effectiveFrom: '',
      description: ''
    });
    setEditingId(null);
    setFieldErrors({});
  };

  const handleAllowanceChange = (index, field, value) => {
    const newAllowances = [...formData.allowances];
    newAllowances[index][field] = value;
    setFormData(prev => ({ ...prev, allowances: newAllowances }));
  };

  const handleDeductionChange = (index, field, value) => {
    const newDeductions = [...formData.deductions];
    newDeductions[index][field] = value;
    setFormData(prev => ({ ...prev, deductions: newDeductions }));
  };

  const addAllowance = () => {
    setFormData(prev => ({
      ...prev,
      allowances: [...prev.allowances, { name: '', amount: '', isPercentage: false }]
    }));
  };

  const addDeduction = () => {
    setFormData(prev => ({
      ...prev,
      deductions: [...prev.deductions, { name: '', amount: '', isPercentage: false }]
    }));
  };

  const removeAllowance = (index) => {
    setFormData(prev => ({
      ...prev,
      allowances: prev.allowances.filter((_, i) => i !== index)
    }));
  };

  const removeDeduction = (index) => {
    setFormData(prev => ({
      ...prev,
      deductions: prev.deductions.filter((_, i) => i !== index)
    }));
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this salary structure?')) return;
    try {
      await axios.delete(`/salary-structures/${id}`);
      success('Salary structure deleted successfully');
      fetchSalaryStructures();
    } catch (err) {
      error('Failed to delete salary structure');
    }
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Salary Structure Management</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage salary structures for different positions</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="w-full sm:w-auto px-4 py-3 bg-gradient-primary text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Salary Structure
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search salary structures..."
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
      ) : salaryStructures.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No salary structures found</p>
          <p className="text-gray-400 text-sm mt-2">Create your first salary structure to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {salaryStructures.map((salary) => (
            <div key={salary._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3 flex-1">
                  <div className="shrink-0 w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 break-words">{salary.designation}</h3>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Basic Salary:</span>
                  <span className="font-medium text-gray-900">${salary.baseSalary}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Allowances:</span>
                  <span className="font-medium text-green-600">${salary.totalAllowances || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Deductions:</span>
                  <span className="font-medium text-red-600">${salary.totalDeductions || 0}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-semibold">
                  <span className="text-gray-900">Net Salary:</span>
                  <span className="text-purple-600">${salary.netSalary}</span>
                </div>
              </div>
              {salary.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 pb-4 border-b">{salary.description}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(salary._id)}
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Edit2 className="h-4 w-4" />
                  <span className="hidden xs:inline">Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(salary._id)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Salary Structure' : 'Create Salary Structure'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(90vh-120px)] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2.5 border ${
                    fieldErrors.designation ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                  placeholder="Assistant Professor"
                />
                {fieldErrors.designation && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {fieldErrors.designation}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Salary <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="baseSalary"
                  value={formData.baseSalary}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2.5 border ${
                    fieldErrors.baseSalary ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                  placeholder="0.00"
                />
                {fieldErrors.baseSalary && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {fieldErrors.baseSalary}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">Allowances</label>
                  <button
                    type="button"
                    onClick={addAllowance}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    + Add
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.allowances.map((allowance, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <input
                        type="text"
                        value={allowance.name}
                        onChange={(e) => handleAllowanceChange(index, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                        placeholder="Allowance name"
                      />
                      <input
                        type="number"
                        value={allowance.amount}
                        onChange={(e) => handleAllowanceChange(index, 'amount', e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                        placeholder="0.00"
                      />
                      <select
                        value={allowance.isPercentage ? 'percent' : 'fixed'}
                        onChange={(e) => handleAllowanceChange(index, 'isPercentage', e.target.value === 'percent')}
                        className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                      >
                        <option value="fixed">$</option>
                        <option value="percent">%</option>
                      </select>
                      {formData.allowances.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAllowance(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">Deductions</label>
                  <button
                    type="button"
                    onClick={addDeduction}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    + Add
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.deductions.map((deduction, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <input
                        type="text"
                        value={deduction.name}
                        onChange={(e) => handleDeductionChange(index, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                        placeholder="Deduction name"
                      />
                      <input
                        type="number"
                        value={deduction.amount}
                        onChange={(e) => handleDeductionChange(index, 'amount', e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                        placeholder="0.00"
                      />
                      <select
                        value={deduction.isPercentage ? 'percent' : 'fixed'}
                        onChange={(e) => handleDeductionChange(index, 'isPercentage', e.target.value === 'percent')}
                        className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                      >
                        <option value="fixed">$</option>
                        <option value="percent">%</option>
                      </select>
                      {formData.deductions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDeduction(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Net Salary:</span>
                  <span className="text-xl font-bold text-purple-600">${calculateNet().toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Effective From</label>
                <input
                  type="date"
                  name="effectiveFrom"
                  value={formData.effectiveFrom}
                  onChange={handleChange}
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
                  placeholder="Salary structure description..."
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
                    <>{editingId ? 'Update' : 'Create'} Salary Structure</>
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
