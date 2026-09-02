import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import TeacherDashboard from './dashboards/TeacherDashboard';
import StudentDashboard from './dashboards/StudentDashboard';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Route to role-specific dashboard
  switch (user.role) {
    case 'superadmin':
    case 'admin':
      return <AdminDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
      return <StudentDashboard />;
    case 'accounts':
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Accounts Dashboard</h2>
            <p className="text-gray-600">Accounts dashboard coming soon...</p>
          </div>
        </div>
      );
    default:
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
            <p className="text-gray-600">Welcome to the system!</p>
          </div>
        </div>
      );
  }
}
