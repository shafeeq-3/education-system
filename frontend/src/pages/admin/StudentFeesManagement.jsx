import { useState, useEffect } from 'react';
import { Search, DollarSign, CheckCircle, XCircle, AlertCircle, Loader2, X, Eye } from 'lucide-react';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function StudentFeesManagement() {
  const [studentFees, setStudentFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedFee, setSelectedFee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    fetchStudentFees();
  }, [searchTerm, statusFilter, pagination.page]);

  const fetchStudentFees = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, limit: pagination.limit };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      const response = await axios.get('/student-fees', { params });
      setStudentFees(response.data.data.items || []);
      setPagination(prev => ({ ...prev, total: response.data.data.pagination?.total || 0 }));
    } catch (err) {
      error('Failed to load student fees');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      error('Please enter a valid payment amount');
      return;
    }
    try {
      await axios.post(`/student-fees/${selectedFee._id}/payment`, {
        amount: parseFloat(paymentAmount),
        paymentMethod
      });
      success('Payment recorded successfully');
      setShowPaymentModal(false);
      setPaymentAmount('');
      setSelectedFee(null);
      fetchStudentFees();
    } catch (err) {
      error('Failed to record payment');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      paid: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-red-100 text-red-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Student Fees Management</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Track and manage student fee payments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      ) : studentFees.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No fee records found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {studentFees.map((fee) => (
            <div key={fee._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 break-words">
                      {fee.student?.profile?.firstName} {fee.student?.profile?.lastName}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium capitalize ${getStatusBadge(fee.paymentStatus)}`}>
                      {fee.paymentStatus}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 block">Total Amount:</span>
                      <p className="font-medium text-gray-900">${fee.totalAmount}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Paid Amount:</span>
                      <p className="font-medium text-green-600">${fee.paidAmount}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Remaining:</span>
                      <p className="font-medium text-red-600">${fee.remainingAmount}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Due Date:</span>
                      <p className="font-medium text-gray-900">{new Date(fee.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                  {fee.paymentStatus !== 'paid' && (
                    <button
                      onClick={() => { setSelectedFee(fee); setShowPaymentModal(true); }}
                      className="flex-1 lg:flex-none px-3 py-2 bg-green-50 border border-green-300 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <DollarSign className="h-4 w-4" />
                      <span className="hidden xs:inline">Record Payment</span>
                    </button>
                  )}
                  <button
                    onClick={() => { setSelectedFee(fee); setShowModal(true); }}
                    className="flex-1 lg:flex-none px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden xs:inline">View</span>
                  </button>
                </div>
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

      {showPaymentModal && selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Record Payment</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                <p className="text-gray-900 font-medium">
                  {selectedFee.student?.profile?.firstName} {selectedFee.student?.profile?.lastName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remaining Amount</label>
                <p className="text-red-600 font-bold text-lg">${selectedFee.remainingAmount}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  min="0"
                  max={selectedFee.remainingAmount}
                  step="0.01"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => { setShowPaymentModal(false); setPaymentAmount(''); setSelectedFee(null); }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  Record Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Fee Details</h2>
              <button
                onClick={() => { setShowModal(false); setSelectedFee(null); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Student</label>
                  <p className="text-gray-900 font-medium">
                    {selectedFee.student?.profile?.firstName} {selectedFee.student?.profile?.lastName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium capitalize ${getStatusBadge(selectedFee.paymentStatus)}`}>
                    {selectedFee.paymentStatus}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Total Amount</label>
                  <p className="text-gray-900 font-bold text-lg">${selectedFee.totalAmount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Paid Amount</label>
                  <p className="text-green-600 font-bold text-lg">${selectedFee.paidAmount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Remaining</label>
                  <p className="text-red-600 font-bold text-lg">${selectedFee.remainingAmount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Due Date</label>
                  <p className="text-gray-900 font-medium">{new Date(selectedFee.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
              {selectedFee.payments && selectedFee.payments.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment History</h3>
                  <div className="space-y-2">
                    {selectedFee.payments.map((payment, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">${payment.amount}</p>
                          <p className="text-sm text-gray-500">{new Date(payment.date).toLocaleDateString()}</p>
                        </div>
                        <span className="text-sm text-gray-600 capitalize">{payment.method}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
