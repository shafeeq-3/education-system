import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, FileText, DollarSign, Calendar, Loader2, AlertCircle } from 'lucide-react';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/notifications/me?limit=100');
      setNotifications(response.data.data.items || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      error(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
      success('Marked as read');
    } catch (err) {
      error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      success('All notifications marked as read');
    } catch (err) {
      error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    if (!confirm('Delete this notification?')) return;
    
    try {
      await axios.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      success('Notification deleted');
    } catch (err) {
      error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'assignment':
        return <FileText className="h-5 w-5 text-purple-600" />;
      case 'deadline':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'result':
        return <CheckCheck className="h-5 w-5 text-green-600" />;
      case 'fee':
        return <DollarSign className="h-5 w-5 text-red-600" />;
      case 'announcement':
        return <Bell className="h-5 w-5 text-teal-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <CheckCheck className="h-5 w-5" />
              Mark All as Read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-md p-2 mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 min-w-[100px] px-4 py-2.5 rounded-lg font-medium transition-all ${
              filter === 'all' ? 'bg-gradient-primary text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 min-w-[100px] px-4 py-2.5 rounded-lg font-medium transition-all ${
              filter === 'unread' ? 'bg-gradient-primary text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`flex-1 min-w-[100px] px-4 py-2.5 rounded-lg font-medium transition-all ${
              filter === 'read' ? 'bg-gradient-primary text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-4 sm:p-6 ${
                !notification.isRead ? 'border-l-4 border-purple-600' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className={`shrink-0 p-3 rounded-xl ${
                  !notification.isRead ? 'bg-gradient-to-br from-purple-100 to-teal-100' : 'bg-gray-100'
                }`}>
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-sm sm:text-base break-words ${
                        !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex sm:flex-col gap-2 shrink-0">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="flex-1 sm:flex-none p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <CheckCheck className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="flex-1 sm:flex-none p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {notification.link && (
                    <a
                      href={notification.link}
                      className="inline-block mt-3 text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      View Details →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {filter === 'unread' ? 'No unread notifications' : 
               filter === 'read' ? 'No read notifications' : 
               'No notifications yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
