import { useState, useEffect } from 'react';
import { Monitor, Smartphone, Tablet, MapPin, Clock, Trash2, Loader2, LogOut } from 'lucide-react';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function ActiveSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/auth/sessions');
      setSessions(response.data.data || []);
    } catch (err) {
      error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId) => {
    if (!confirm('Are you sure you want to terminate this session?')) return;

    try {
      await axios.delete(`/auth/sessions/${sessionId}`);
      success('Session terminated successfully');
      fetchSessions();
    } catch (err) {
      error(err.response?.data?.error?.message || 'Failed to terminate session');
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm('This will log you out from all devices. Continue?')) return;

    try {
      await axios.post('/auth/logout-all');
      window.location.href = '/login';
    } catch (err) {
      error(err.response?.data?.error?.message || 'Failed to logout from all devices');
    }
  };

  const getDeviceIcon = (userAgent) => {
    const ua = userAgent?.toLowerCase() || '';
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="h-5 w-5 text-purple-600" />;
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return <Tablet className="h-5 w-5 text-teal-600" />;
    }
    return <Monitor className="h-5 w-5 text-purple-600" />;
  };

  const getDeviceInfo = (userAgent) => {
    const ua = userAgent || 'Unknown Device';
    if (ua.includes('Chrome')) return 'Chrome Browser';
    if (ua.includes('Firefox')) return 'Firefox Browser';
    if (ua.includes('Safari')) return 'Safari Browser';
    if (ua.includes('Edge')) return 'Edge Browser';
    return 'Unknown Browser';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Active Sessions</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your active login sessions across devices</p>
          </div>
          {sessions.length > 1 && (
            <button
              onClick={handleLogoutAll}
              className="w-full sm:w-auto px-4 py-2.5 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <LogOut className="h-5 w-5" />
              Logout All Devices
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-12 bg-white rounded-xl shadow-md">
            <Loader2 className="h-12 w-12 text-purple-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No active sessions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-4 sm:p-6 animate-scale-in">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="shrink-0 p-3 bg-gradient-to-br from-purple-100 to-teal-100 rounded-xl">
                    {getDeviceIcon(session.userAgent)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                        {getDeviceInfo(session.userAgent)}
                      </h3>
                      {session.isCurrent && (
                        <span className="px-2 py-1 bg-gradient-to-r from-green-100 to-teal-100 text-green-800 text-xs rounded-full font-medium">
                          Current Session
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                        <span className="break-words">{session.ipAddress || 'Unknown Location'}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>Last active: {formatDate(session.lastActivity)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Created: {formatDate(session.createdAt)}
                      </div>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <button
                      onClick={() => handleTerminateSession(session._id)}
                      className="w-full lg:w-auto px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="text-sm">Terminate</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 bg-gradient-to-r from-purple-50 to-teal-50 border border-purple-200 p-4 sm:p-6 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Security Tips</h4>
          <ul className="text-xs sm:text-sm text-gray-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5 shrink-0"></span>
              <span>If you see any unfamiliar sessions, terminate them immediately</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5 shrink-0"></span>
              <span>Use "Logout All Devices" if you suspect unauthorized access</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5 shrink-0"></span>
              <span>Change your password regularly to keep your account secure</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
