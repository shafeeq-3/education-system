import { useState, useEffect } from 'react';
import { Calendar, Users, CheckCircle, XCircle, Clock, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function TeacherAttendance() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    if (user?._id) {
      fetchTeacherClasses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents();
      fetchExistingAttendance();
    }
  }, [selectedClass, attendanceDate]);

  const fetchTeacherClasses = async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/classes?teacherId=${user._id}`);
      const classList = response.data.data.items || [];
      setClasses(classList);
      if (classList.length > 0) {
        setSelectedClass(classList[0]._id);
      }
    } catch (err) {
      error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassStudents = async () => {
    try {
      const response = await axios.get(`/classes/${selectedClass}/students`);
      setStudents(response.data.data.students || []);
    } catch (err) {
      error('Failed to load students');
    }
  };

  const fetchExistingAttendance = async () => {
    try {
      const response = await axios.get(`/attendance?classId=${selectedClass}&date=${attendanceDate}`);
      const existingAttendance = {};
      response.data.data.items?.forEach(record => {
        existingAttendance[record.student?._id || record.student] = record.status;
      });
      setAttendance(existingAttendance);
    } catch (err) {
      setAttendance({});
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status) => {
    const newAttendance = {};
    students.forEach(student => {
      newAttendance[student._id] = status;
    });
    setAttendance(newAttendance);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const attendanceRecords = students.map(student => ({
        studentId: student._id,
        classId: selectedClass,
        date: attendanceDate,
        status: attendance[student._id] || 'absent',
        markedBy: user._id
      }));

      await axios.post('/attendance/bulk', { records: attendanceRecords });
      success('Attendance saved successfully!');
    } catch (err) {
      error(err.response?.data?.error?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-gradient-to-r from-green-100 to-teal-100 text-green-800 border-green-300';
      case 'absent': return 'bg-gradient-to-r from-red-100 to-orange-100 text-red-800 border-red-300';
      case 'late': return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getAttendanceStats = () => {
    const present = Object.values(attendance).filter(s => s === 'present').length;
    const absent = Object.values(attendance).filter(s => s === 'absent').length;
    const late = Object.values(attendance).filter(s => s === 'late').length;
    return { present, absent, late, total: students.length };
  };

  const stats = getAttendanceStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Record student attendance for your classes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
          <select
            value={selectedClass || ''}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            {classes.map((classItem) => (
              <option key={classItem._id} value={classItem._id}>
                {classItem.name} - {classItem.subjectId?.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {selectedClass && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Students</p>
                  <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">{stats.total}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-100 to-teal-100 rounded-lg">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Present</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.present}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Absent</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.absent}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Late</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.late}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleMarkAll('present')}
                className="flex-1 px-4 py-2.5 bg-white border-2 border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Mark All Present
              </button>
              <button
                onClick={() => handleMarkAll('absent')}
                className="flex-1 px-4 py-2.5 bg-white border-2 border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Mark All Absent
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-fade-in">
            <div className="space-y-3">
              {students.map((student, index) => (
                <div
                  key={student._id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg hover:shadow-md transition-all border border-gray-100"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <span className="text-sm font-medium text-gray-500 w-8 shrink-0">{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base break-words">
                        {student.profile?.firstName} {student.profile?.lastName}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 break-words">{student.email}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAttendanceChange(student._id, 'present')}
                      className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium transition-all border-2 text-xs sm:text-sm ${
                        attendance[student._id] === 'present'
                          ? getStatusColor('present')
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(student._id, 'late')}
                      className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium transition-all border-2 text-xs sm:text-sm ${
                        attendance[student._id] === 'late'
                          ? getStatusColor('late')
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Late
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(student._id, 'absent')}
                      className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium transition-all border-2 text-xs sm:text-sm ${
                        attendance[student._id] === 'absent'
                          ? getStatusColor('absent')
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {students.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No students enrolled in this class</p>
              </div>
            )}
          </div>

          {students.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 sm:px-8 py-3 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Attendance
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
