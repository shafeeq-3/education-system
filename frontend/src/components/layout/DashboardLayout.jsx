import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, GraduationCap, BookOpen, Calendar, 
  DollarSign, BarChart3, Bell, Settings, LogOut, Menu, X,
  Building2, MapPin, Briefcase, FileText, ClipboardList, UserCheck,
  Award, TrendingUp, ChevronDown, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const adminMenuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/dashboard' 
    },
    {
      id: 'academic',
      label: 'Academic',
      icon: GraduationCap,
      submenu: [
        { label: 'Institutes', path: '/admin/institutes', icon: Building2 },
        { label: 'Campuses', path: '/admin/campuses', icon: MapPin },
        { label: 'Departments', path: '/admin/departments', icon: Briefcase },
        { label: 'Programs', path: '/admin/programs', icon: BookOpen },
        { label: 'Academic Years', path: '/admin/academic-years', icon: Calendar },
        { label: 'Semesters', path: '/admin/semesters', icon: Calendar },
        { label: 'Subjects', path: '/admin/subjects', icon: FileText },
      ]
    },
    {
      id: 'classes',
      label: 'Classes',
      icon: Users,
      submenu: [
        { label: 'Classes', path: '/admin/classes', icon: Users },
        { label: 'Enrollments', path: '/admin/enrollments', icon: UserCheck },
        { label: 'Timetables', path: '/admin/timetables', icon: Calendar },
      ]
    },
    {
      id: 'finance',
      label: 'Finance',
      icon: DollarSign,
      submenu: [
        { label: 'Fee Structures', path: '/admin/fee-structures', icon: FileText },
        { label: 'Student Fees', path: '/admin/student-fees', icon: DollarSign },
        { label: 'Salary Structures', path: '/admin/salary-structures', icon: Award },
        { label: 'Salary Payments', path: '/admin/salary-payments', icon: DollarSign },
        { label: 'Financial Reports', path: '/admin/financial-reports', icon: BarChart3 },
      ]
    },
    { 
      id: 'users', 
      label: 'Users', 
      icon: Users, 
      path: '/admin/users' 
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: TrendingUp, 
      path: '/admin/analytics' 
    },
  ];

  const teacherMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList, path: '/teacher/assignments' },
    { id: 'attendance', label: 'Attendance', icon: UserCheck, path: '/teacher/attendance' },
    { id: 'grades', label: 'Grades', icon: Award, path: '/teacher/grades' },
    { id: 'timetable', label: 'Timetable', icon: Calendar, path: '/teacher/timetable' },
    { id: 'salary', label: 'Salary', icon: DollarSign, path: '/teacher/salary' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/teacher/analytics' },
  ];

  const studentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'courses', label: 'My Courses', icon: BookOpen, path: '/student/courses' },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList, path: '/student/assignments' },
    { id: 'attendance', label: 'Attendance', icon: UserCheck, path: '/student/attendance' },
    { id: 'results', label: 'Results', icon: Award, path: '/student/results' },
    { id: 'fees', label: 'Fees', icon: DollarSign, path: '/student/fees' },
    { id: 'timetable', label: 'Timetable', icon: Calendar, path: '/student/timetable' },
  ];

  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
      case 'superadmin':
        return adminMenuItems;
      case 'teacher':
        return teacherMenuItems;
      case 'student':
        return studentMenuItems;
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const isActive = (path) => location.pathname === path;
  const isSubmenuActive = (submenu) => submenu?.some(item => location.pathname === item.path);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">ERP System</h1>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto custom-scrollbar px-4 py-6">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <div key={item.id}>
                  {item.submenu ? (
                    <div>
                      <button
                        onClick={() => toggleMenu(item.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                          isSubmenuActive(item.submenu)
                            ? 'bg-gradient-primary text-white shadow-lg'
                            : 'text-gray-700 hover:bg-purple-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        {expandedMenus[item.id] ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      {expandedMenus[item.id] && (
                        <div className="mt-2 ml-4 space-y-1">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              onClick={() => setSidebarOpen(false)}
                              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                                isActive(subItem.path)
                                  ? 'bg-purple-100 text-purple-700 font-medium'
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              <subItem.icon className="w-4 h-4" />
                              <span className="text-sm">{subItem.label}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive(item.path)
                          ? 'bg-gradient-primary text-white shadow-lg'
                          : 'text-gray-700 hover:bg-purple-50'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* User Profile & Logout */}
          <div className="border-t border-gray-200 p-4 space-y-2">
            <Link
              to="/profile"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-purple-50 transition-all"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-72">
        {/* Top Bar */}
        <header className="h-20 bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:flex-none">
              <h2 className="text-xl font-bold text-gray-900 truncate">
                {location.pathname.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/notifications"
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Link>

              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                  {user?.profile?.firstName?.[0]}{user?.profile?.lastName?.[0]}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.profile?.firstName} {user?.profile?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
