import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Download, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function TeacherSalaries() {
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
      console.error('Salary fetch error:', err);
      error('Failed to load salary records');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (salaryData) => {
    const totalEarned = salaryData
      .filter(s => s.status === 'paid')
      .reduce((sum, s) => sum + (s.netSalary || 0), 0);
    
    const totalPending = salaryData
      .filter(s => s.status !== 'paid')
      .reduce((sum, s) => sum + (s.netSalary || 0), 0);
    
    const paidCount = salaryData.filter(s => s.status === 'paid').length;
    const pendingCount = salaryData.filter(s => s.status !== 'paid').length;

    setSummary({ totalEarned, totalPending, paidCount, pendingCount });
  };

  const getMonthName = (monthStr) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[parseInt(monthStr) - 1] || monthStr;
  };

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
                <p className="text-xs sm:text-sm text-gray-600">Total Earned</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">₹{summary.totalEarned.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">₹{summary.totalPending.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Paid Months</p>
                <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">{summary.paidCount}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-100 to-teal-100 rounded-lg">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Avg/Month</p>
                <p className="text-xl sm:text-2xl font-bold text-indigo-600">
                  ₹{summary.paidCount > 0 ? Math.round(summary.totalEarned / summary.paidCount).toLocaleString() : 0}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {salaries.map((salary) => (
          <div key={salary._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-4 sm:p-6 animate-scale-in">
            <div className="flex justify-between items-start gap-2 mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                  {getMonthName(salary.month)} {salary.year}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                  <span className="break-words">
                    {salary.status === 'paid' && salary.paymentDate 
                      ? `Paid on ${new Date(salary.paymentDate).toLocaleDateString()}`
                      : 'Payment Pending'}
                  </span>
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium shrink-0 ${
                salary.status === 'paid' 
                  ? 'bg-gradient-to-r from-green-100 to-teal-100 text-green-800' 
                  : 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800'
              }`}>
                {salary.status === 'paid' ? 'Paid' : salary.status === 'approved' ? 'Approved' : 'Pending'}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Base Salary:</span>
                <span className="font-medium">₹{(salary.baseSalary || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Allowances:</span>
                <span className="font-medium text-green-600">+₹{(salary.totalAllowances || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Deductions:</span>
                <span className="font-medium text-red-600">-₹{(salary.totalDeductions || 0).toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t flex justify-between">
                <span className="text-sm font-semibold text-gray-900">Net Salary:</span>
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
                  ₹{(salary.netSalary || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {salary.status === 'paid' && (
              <button className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-50 to-teal-50 border border-purple-200 text-purple-700 rounded-lg hover:shadow-md transition-all font-medium flex items-center justify-center gap-2 text-sm">
                <Download className="h-4 w-4" />
                Download Slip
              </button>
            )}

            {salary.status !== 'paid' && (
              <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <p className="text-xs sm:text-sm text-yellow-700 break-words">
                  {salary.status === 'approved' ? 'Payment will be processed soon' : 'Awaiting approval'}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {salaries.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No salary records found for {selectedYear}</p>
        </div>
      )}
    </div>
  );
}
