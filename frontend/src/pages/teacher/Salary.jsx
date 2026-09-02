import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function TeacherSalary() {
  const { user } = useAuth();
  const [salaries, setSalaries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { toasts, removeToast, error } = useToast();

  useEffect(() => {
    if (user?._id) {
      fetchSalaries();
    }
  }, [selectedYear, user]);

  const fetchSalaries = async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/salary-payments/teacher/${user._id}?year=${selectedYear}`);
      const salaryData = response.data.data.items || [];
      setSalaries(salaryData);
      calculateSummary(salaryData);
    } catch (err) {
      error('Failed to load salary records');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (salaryData) => {
    const total = salaryData.reduce((sum, sal) => sum + sal.amount, 0);
    const paid = salaryData.filter(sal => sal.status === 'paid').length;
    const pending = salaryData.filter(sal => sal.status === 'unpaid').length;
    const totalPaid = salaryData
      .filter(sal => sal.status === 'paid')
      .reduce((sum, sal) => sum + sal.amount, 0);

    setSummary({ total, paid, pending, totalPaid });
  };

  const getStatusInfo = (status) => {
    if (status === 'paid') {
      return {
        label: 'Paid',
        color: 'bg-gradient-to-r from-green-100 to-teal-100 text-green-800',
        icon: CheckCircle
      };
    }
    return {
      label: 'Pending',
      color: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800',
      icon: Clock
    };
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading salary records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Salary Records</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">View your salary payment history</p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Salary</p>
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
                <p className="text-xs sm:text-sm text-gray-600">Paid Amount</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  Rs. {summary.totalPaid.toLocaleString()}
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
                <p className="text-xs sm:text-sm text-gray-600">Paid Months</p>
                <p className="text-xl sm:text-2xl font-bold text-indigo-600">{summary.paid}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">{summary.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Monthly Breakdown</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {months.map((month) => {
          const salary = salaries.find(s => s.month === month && s.year === selectedYear);
          const statusInfo = salary ? getStatusInfo(salary.status) : null;
          const StatusIcon = statusInfo?.icon;

          return (
            <div 
              key={month} 
              className={`bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in ${
                salary 
                  ? salary.status === 'paid' 
                    ? 'border-l-4 border-green-500' 
                    : 'border-l-4 border-yellow-500'
                  : 'opacity-60'
              }`}
            >
              <div className="flex justify-between items-start gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base break-words">{month}</h3>
                  <p className="text-xs text-gray-500">{selectedYear}</p>
                </div>
                {statusInfo && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shrink-0 ${statusInfo.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {statusInfo.label}
                  </span>
                )}
              </div>

              {salary ? (
                <>
                  <div className="mb-3">
                    <p className="text-xs sm:text-sm text-gray-600">Amount</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      Rs. {salary.amount.toLocaleString()}
                    </p>
                  </div>

                  {salary.paidDate && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-gray-600 break-words">
                        Paid on: <span className="font-medium text-green-600">
                          {new Date(salary.paidDate).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No record</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {salaries.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center mt-6">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No salary records for {selectedYear}</p>
        </div>
      )}

      {summary && summary.total > 0 && (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mt-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Annual Summary</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {summary.paid} of 12 months paid • {((summary.paid / 12) * 100).toFixed(0)}% complete
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
                Rs. {summary.totalPaid.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">Total Received</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-primary h-3 rounded-full transition-all"
                style={{ width: `${(summary.paid / 12) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
