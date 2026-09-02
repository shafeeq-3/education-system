import { useState, useEffect } from 'react';
import { Search, DollarSign, TrendingUp, TrendingDown, Download, Calendar } from 'lucide-react';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function FinancialReports() {
  const [reports, setReports] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
    feeCollection: 0,
    salaryPayments: 0,
    pendingFees: 0
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/financial-reports', {
        params: dateRange
      });
      setReports(response.data.data || {});
    } catch (err) {
      error('Failed to load financial reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get('/financial-reports/export', {
        params: dateRange,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `financial-report-${dateRange.startDate}-${dateRange.endDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      success('Report exported successfully');
    } catch (err) {
      error('Failed to export report');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">View financial analytics and reports</p>
        </div>
        <button
          onClick={handleExport}
          className="w-full sm:w-auto px-4 py-3 bg-gradient-primary text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Download className="h-5 w-5" />
          Export Report
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Revenue</h3>
            <p className="text-2xl font-bold text-gray-900">${reports.totalRevenue?.toLocaleString() || 0}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Expenses</h3>
            <p className="text-2xl font-bold text-gray-900">${reports.totalExpenses?.toLocaleString() || 0}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Net Income</h3>
            <p className={`text-2xl font-bold ${reports.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${reports.netIncome?.toLocaleString() || 0}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-teal-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Fee Collection</h3>
            <p className="text-2xl font-bold text-gray-900">${reports.feeCollection?.toLocaleString() || 0}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Salary Payments</h3>
            <p className="text-2xl font-bold text-gray-900">${reports.salaryPayments?.toLocaleString() || 0}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Pending Fees</h3>
            <p className="text-2xl font-bold text-gray-900">${reports.pendingFees?.toLocaleString() || 0}</p>
          </div>
        </div>
      )}
    </div>
  );
}
