import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  FileText, 
  DollarSign,
  Bell,
  BarChart3,
  Settings,
  Clock,
  UserCheck,
  ChevronDown,
  ChevronRight,
  User,
  Lock,
  Monitor,
  Building2,
  MapPin
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navigation = {
  admin: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Campuses', href: '/campuses', icon: MapPin },
    { name: 'Departments', href: '/academic/departments', icon: BookOpen },
    { name: 'Programs', href: '/academic/programs', icon: BookOpen },
    { name: 'Academic Years', href: '/academic/academic-years', icon: Calendar },
    { name: 'Semesters', href: '/academic/semesters', icon: Calendar },
    { name: 'Subjects', href: '/academic/subjects', icon: BookOpen },
    { name: 'Classes', href: '/classes', icon: Calendar },
    { name: 'Timetables', href: '/timetables', icon: Clock },
    { name: 'Enrollments', href: '/enrollments', icon: UserCheck },
    { 
      name: 'Finance', 
      icon: DollarSign,
      submenu: [
        { name: 'Fee Structures', href: '/finance/fee-structures' },
        { name: 'Student Fees', href: '/finance/student-fees' },
        { name: 'Salary Structures', href: '/finance/salary-structures' },
        { name: 'Salary Payments', href: '/finance/salary-payments' },
        { name: 'Financial Reports', href: '/finance/reports' }
      ]
    },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { 
      name: 'Settings', 
      icon: Settings,
      submenu: [
        { name: 'Profile', href: '/profile' },
        { name: 'Change Password', href: '/change-password' },
        { name: 'Active Sessions', href: '/sessions' }
      ]
    },
  ],
  superadmin: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Institutes', href: '/institutes', icon: Building2 },
    { name: 'Campuses', href: '/campuses', icon: MapPin },
    { name: 'Departments', href: '/academic/departments', icon: BookOpen },
    { name: 'Programs', href: '/academic/programs', icon: BookOpen },
    { name: 'Academic Years', href: '/academic/academic-years', icon: Calendar },
    { name: 'Semesters', href: '/academic/semesters', icon: Calendar },
    { name: 'Subjects', href: '/academic/subjects', icon: BookOpen },
    { name: 'Classes', href: '/classes', icon: Calendar },
    { name: 'Timetables', href: '/timetables', icon: Clock },
    { name: 'Enrollments', href: '/enrollments', icon: UserCheck },
    { 
      name: 'Finance', 
      icon: DollarSign,
      submenu: [
        { name: 'Fee Structures', href: '/finance/fee-structures' },
        { name: 'Student Fees', href: '/finance/student-fees' },
        { name: 'Salary Structures', href: '/finance/salary-structures' },
        { name: 'Salary Payments', href: '/finance/salary-payments' },
        { name: 'Financial Reports', href: '/finance/reports' }
      ]
    },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { 
      name: 'Settings', 
      icon: Settings,
      submenu: [
        { name: 'Profile', href: '/profile' },
        { name: 'Change Password', href: '/change-password' },
        { name: 'Active Sessions', href: '/sessions' }
      ]
    },
  ],
  teacher: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Classes', href: '/classes', icon: Calendar },
    { name: 'Timetable', href: '/timetable', icon: Clock },
    { name: 'Assignments', href: '/assignments', icon: FileText },
    { name: 'Attendance', href: '/attendance', icon: BookOpen },
    { name: 'Grades', href: '/grades', icon: BarChart3 },
    { name: 'Salary', href: '/salaries', icon: DollarSign },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { 
      name: 'Settings', 
      icon: Settings,
      submenu: [
        { name: 'Profile', href: '/profile' },
        { name: 'Change Password', href: '/change-password' },
        { name: 'Active Sessions', href: '/sessions' }
      ]
    },
  ],
  student: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', href: '/courses', icon: BookOpen },
    { name: 'Enroll in Classes', href: '/enrollment-request', icon: UserCheck },
    { name: 'Timetable', href: '/timetable', icon: Clock },
    { name: 'Assignments', href: '/assignments', icon: FileText },
    { name: 'Attendance', href: '/attendance', icon: Calendar },
    { name: 'Results', href: '/results', icon: BarChart3 },
    { name: 'Fees', href: '/fees', icon: DollarSign },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { 
      name: 'Settings', 
      icon: Settings,
      submenu: [
        { name: 'Profile', href: '/profile' },
        { name: 'Change Password', href: '/change-password' },
        { name: 'Active Sessions', href: '/sessions' }
      ]
    },
  ],
  accounts: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { 
      name: 'Finance', 
      icon: DollarSign,
      submenu: [
        { name: 'Fee Structures', href: '/finance/fee-structures' },
        { name: 'Student Fees', href: '/finance/student-fees' },
        { name: 'Salary Structures', href: '/finance/salary-structures' },
        { name: 'Salary Payments', href: '/finance/salary-payments' },
        { name: 'Financial Reports', href: '/finance/reports' }
      ]
    },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { 
      name: 'Settings', 
      icon: Settings,
      submenu: [
        { name: 'Profile', href: '/profile' },
        { name: 'Change Password', href: '/change-password' },
        { name: 'Active Sessions', href: '/sessions' }
      ]
    },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  
  const userNavigation = navigation[user?.role] || navigation.student;

  const toggleSubmenu = (itemName) => {
    setOpenSubmenu(openSubmenu === itemName ? null : itemName);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600">ERP System</h1>
        <p className="text-sm text-gray-600 mt-1 capitalize">{user?.role} Portal</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {userNavigation.map((item) => {
          if (item.submenu) {
            const isOpen = openSubmenu === item.name;
            const isActive = item.submenu.some(sub => location.pathname === sub.href);
            
            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleSubmenu(item.name)}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                {isOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.submenu.map((subItem) => {
                      const isSubActive = location.pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.href}
                          to={subItem.href}
                          className={cn(
                            'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm',
                            isSubActive
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          )}
                        >
                          <span>{subItem.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
