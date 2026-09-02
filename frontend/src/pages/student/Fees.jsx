import { useState, useEffect } from 'react';
import { DollarSign, Download, AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function StudentFees() {
  const { user } = useAuth();
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    if (user?._id) {
      fetchFees();
    }
  }, [user]);

  const fetchFees = async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/student-fees/student/${user._id}`);
      const feeData = response.data.data.items || [];
      setFees(feeData);
      calculateSummary(feeData);
    } catch (err) {
      console.error('Failed to load fee records:', err);
      error(err.response?.data?.message || 'Failed to load fee records');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (feeData) => {
    const total = feeData.reduce((sum, fee) => sum + (fee.totalAmount || 0), 0);
    const paid = feeData.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
    const pending = total - paid;
    const overdue = feeData.filter(fee => 
      fee.paymentStatus !== 'paid' && new Date(fee.dueDate) < new Date()
    ).length;

    setSummary({ total, paid, pending, overdue });
  };

  const getStatusInfo = (fee) => {
    if (fee.paymentStatus === 'paid') {
      return { 
        label: 'Paid', 
        color: 'bg-green-100 text-green-800', 
        icon: CheckCircle 
      };
    }
    
    const dueDate = new Date(fee.dueDate);
    const now = new Date();
    
    if (now > dueDate) {
      return { 
        label: 'Overdue', 
        color: 'bg-red-100 text-red-800', 
        icon: AlertCircle 
      };
    }
    
    if (fee.paymentStatus === 'partially_paid') {
      return { 
        label: 'Partial', 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: Clock 
      };
    }
    
    return { 
      label: 'Pending', 
      color: 'bg-gray-100 text-gray-800', 
      icon: Clock 
    };
  };

  const handleDownloadVoucher = async (feeId) => {
    try {
      const response = await axios.get(`/student-fees/${feeId}/voucher`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fee-voucher-${feeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      success('Voucher downloaded successfully!');
    } catch (err) {
      error('Failed to download voucher');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading fee records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Fee Management</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">View and manage your fee payments</p>
      </div>

      {summary && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Fees</p>
                  <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
                    Rs. {summary.total.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-100 to-teal-100 rounded-lg">
                  <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Paid</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    Rs. {summary.paid.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                    Rs. {summary.pending.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Overdue</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">{summary.overdue}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {summary.overdue > 0 && (
            <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-600 rounded-xl shadow-md p-4 sm:p-6 animate-fade-in">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 text-sm sm:text-base">Payment Overdue</h3>
                  <p className="text-xs sm:text-sm text-red-700 mt-1 break-words">
                    You have {summary.overdue} overdue payment{summary.overdue > 1 ? 's' : ''}. 
                    Please clear your dues to avoid any academic restrictions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Fee Records</h2>

      <div className="space-y-4">
        {fees.map((fee) => {
          const statusInfo = getStatusInfo(fee);
          const StatusIcon = statusInfo.icon;
          const totalAmount = fee.totalAmount || 0;
          const paidAmount = fee.paidAmount || 0;
          const percentage = totalAmount > 0 ? (paidAmount / totalAmount * 100) : 0;

          return (
            <div key={fee._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-4 sm:p-6 animate-scale-in">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                    {fee.semester?.name || 'Semester Fee'}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 break-words">
                    {fee.academicYear?.year || 'Academic Year'}
                  </p>
                  {fee.feeStructure?.name && (
                    <p className="text-xs text-gray-500 mt-1 break-words">
                      {fee.feeStructure.name}
                    </p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 shrink-0 ${statusInfo.color}`}>
                  <StatusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  {statusInfo.label}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Amount</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">
                    Rs. {totalAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Paid Amount</p>
                  <p className="text-lg sm:text-xl font-bold text-green-600">
                    Rs. {paidAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Balance</p>
                  <p className="text-lg sm:text-xl font-bold text-red-600">
                    Rs. {(fee.remainingAmount || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {fee.paymentStatus !== 'paid' && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs sm:text-sm text-gray-600">Payment Progress</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900">{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-primary h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-4 border-t">
                <div className="text-xs sm:text-sm text-gray-600 break-words">
                  <span>Due Date: </span>
                  <span className="font-medium text-gray-900">
                    {new Date(fee.dueDate).toLocaleDateString()}
                  </span>
                  {fee.payments && fee.payments.length > 0 && (
                    <>
                      <span className="mx-2">•</span>
                      <span>Last Payment: </span>
                      <span className="font-medium text-green-600">
                        {new Date(fee.payments[fee.payments.length - 1].paymentDate).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
                <button
                  onClick={() => handleDownloadVoucher(fee._id)}
                  className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {fees.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No fee records found</p>
        </div>
      )}
    </div>
  );
}
