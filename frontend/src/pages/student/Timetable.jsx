import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, BookOpen, User, ChevronLeft, ChevronRight, Download, Filter, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export default function StudentTimetable() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timetables, setTimetables] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('week');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [filters, setFilters] = useState({ semesterId: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [semesters, setSemesters] = useState([]);
  const { toasts, removeToast, error } = useToast();

  useEffect(() => {
    if (user?._id) {
      fetchData();
      fetchSemesters();
    }
  }, [filters, user]);

  const fetchSemesters = async () => {
    try {
      const response = await axios.get('/semesters?limit=1000');
      setSemesters(response.data.data.items || []);
    } catch (err) {
      error('Failed to fetch semesters');
    }
  };

  const fetchData = async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      
      const enrollmentsRes = await axios.get(`/enrollments?studentId=${user._id}&status=approved`);
      const approvedEnrollments = enrollmentsRes.data.data.items || [];
      setEnrollments(approvedEnrollments);
      
      if (approvedEnrollments.length > 0) {
        const classIds = approvedEnrollments.map(e => e.class?._id).filter(Boolean);
        const timetablePromises = classIds.map(classId => 
          axios.get(`/timetables?classId=${classId}&limit=1000`)
        );
        
        const timetableResponses = await Promise.all(timetablePromises);
        const allTimetables = timetableResponses.flatMap(res => res.data.data.items || []);
        
        let filteredTimetables = allTimetables;
        if (filters.semesterId) {
          filteredTimetables = allTimetables.filter(t => t.semester?._id === filters.semesterId);
        }
        
        setTimetables(filteredTimetables);
      } else {
        setTimetables([]);
      }
    } catch (err) {
      console.error('Failed to load timetable:', err);
      error(err.response?.data?.message || 'Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const getTimetablesByDay = (day) => {
    return timetables
      .filter(t => t.dayOfWeek === day)
      .sort((a, b) => {
        const aTime = a.startTime.split(':').map(Number);
        const bTime = b.startTime.split(':').map(Number);
        return (aTime[0] * 60 + aTime[1]) - (bTime[0] * 60 + bTime[1]);
      });
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getTypeColor = (type) => {
    const colors = {
      lecture: 'bg-gradient-to-r from-purple-500 to-purple-600',
      lab: 'bg-gradient-to-r from-teal-500 to-teal-600',
      tutorial: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
      seminar: 'bg-gradient-to-r from-pink-500 to-pink-600'
    };
    return colors[type] || 'bg-gradient-to-r from-gray-500 to-gray-600';
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'lab': return '🔬';
      case 'tutorial': return '📝';
      case 'seminar': return '🎤';
      default: return '📚';
    }
  };

  const getTotalClassesPerDay = (day) => getTimetablesByDay(day).length;

  const getTotalHoursPerWeek = () => {
    let totalMinutes = 0;
    timetables.forEach(t => {
      const start = t.startTime.split(':').map(Number);
      const end = t.endTime.split(':').map(Number);
      const startMinutes = start[0] * 60 + start[1];
      const endMinutes = end[0] * 60 + end[1];
      totalMinutes += (endMinutes - startMinutes);
    });
    return (totalMinutes / 60).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading timetable...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Class Schedule</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">View your weekly class timetable</p>
      </div>

      {enrollments.length === 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-600 rounded-xl shadow-md p-4 sm:p-6 mb-6 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 text-sm sm:text-base">No Approved Enrollments</h3>
              <p className="text-xs sm:text-sm text-yellow-700 mt-1 break-words">
                You don't have any approved class enrollments yet. Please request enrollment in classes to view your timetable.
              </p>
              <button 
                onClick={() => navigate('/enrollment-request')}
                className="mt-3 px-4 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
              >
                Request Enrollment
              </button>
            </div>
          </div>
        </div>
      )}

      {enrollments.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Classes</p>
                  <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">{timetables.length}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-100 to-teal-100 rounded-lg">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Weekly Hours</p>
                  <p className="text-xl sm:text-2xl font-bold text-teal-600">{getTotalHoursPerWeek()}</p>
                </div>
                <div className="p-3 bg-teal-100 rounded-lg">
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Subjects</p>
                  <p className="text-xl sm:text-2xl font-bold text-indigo-600">
                    {new Set(timetables.map(t => t.subject?._id)).size}
                  </p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Enrollments</p>
                  <p className="text-xl sm:text-2xl font-bold text-pink-600">{enrollments.length}</p>
                </div>
                <div className="p-3 bg-pink-100 rounded-lg">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {filters.semesterId && (
                <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">1</span>
              )}
            </button>

            <button 
              onClick={() => window.print()}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Print
            </button>

            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  viewMode === 'week' ? 'bg-gradient-primary text-white shadow-lg' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Week View
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  viewMode === 'day' ? 'bg-gradient-primary text-white shadow-lg' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Day View
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Filters</h3>
                <button 
                  onClick={() => setFilters({ semesterId: '' })}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Clear All
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                <select
                  value={filters.semesterId}
                  onChange={(e) => setFilters({ semesterId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">All Semesters</option>
                  {semesters.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {viewMode === 'week' && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden animate-fade-in">
              {timetables.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No classes scheduled</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-gradient-to-r from-purple-50 to-teal-50">
                        <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 border-b border-r border-gray-200 w-24 sm:w-32">
                          Time
                        </th>
                        {DAYS_OF_WEEK.map(day => (
                          <th key={day} className="px-2 sm:px-4 py-3 text-center text-xs sm:text-sm font-semibold text-gray-700 border-b border-r border-gray-200 min-w-[140px] sm:min-w-[180px]">
                            <div className="break-words">{day}</div>
                            <div className="text-xs font-normal text-gray-500 mt-1">
                              {getTotalClassesPerDay(day)} {getTotalClassesPerDay(day) === 1 ? 'class' : 'classes'}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {TIME_SLOTS.map((timeSlot, index) => (
                        <tr key={timeSlot} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-3 py-3 text-xs sm:text-sm font-medium text-gray-700 border-r border-b border-gray-200 align-top">
                            {formatTime(timeSlot)}
                          </td>
                          {DAYS_OF_WEEK.map(day => {
                            const dayTimetables = getTimetablesByDay(day);
                            const classesInSlot = dayTimetables.filter(t => {
                              const startHour = parseInt(t.startTime.split(':')[0]);
                              const slotHour = parseInt(timeSlot.split(':')[0]);
                              return startHour === slotHour;
                            });

                            return (
                              <td key={day} className="px-2 py-2 border-r border-b border-gray-200 align-top">
                                {classesInSlot.map(timetable => (
                                  <div
                                    key={timetable._id}
                                    className={`p-2 sm:p-3 rounded-lg mb-2 text-white shadow-sm hover:shadow-md transition-shadow cursor-pointer ${getTypeColor(timetable.type)}`}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-semibold uppercase break-words">
                                        {timetable.type}
                                      </span>
                                      <span className="text-base sm:text-lg">{getTypeIcon(timetable.type)}</span>
                                    </div>
                                    <div className="font-semibold text-xs sm:text-sm mb-1 break-words">
                                      {timetable.subject?.name}
                                    </div>
                                    <div className="text-xs opacity-90 mb-1 break-words">
                                      {timetable.teacher?.profile?.firstName} {timetable.teacher?.profile?.lastName}
                                    </div>
                                    <div className="flex items-center text-xs opacity-90 mb-1">
                                      <Clock className="w-3 h-3 mr-1 shrink-0" />
                                      <span className="break-words">{formatTime(timetable.startTime)} - {formatTime(timetable.endTime)}</span>
                                    </div>
                                    <div className="flex items-center text-xs opacity-90">
                                      <MapPin className="w-3 h-3 mr-1 shrink-0" />
                                      <span className="break-words">
                                        {timetable.room}
                                        {timetable.building && ` (${timetable.building})`}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {viewMode === 'day' && (
            <>
              <div className="flex items-center justify-between mb-4 gap-2">
                <button
                  onClick={() => {
                    const currentIndex = DAYS_OF_WEEK.indexOf(selectedDay);
                    const prevIndex = currentIndex === 0 ? DAYS_OF_WEEK.length - 1 : currentIndex - 1;
                    setSelectedDay(DAYS_OF_WEEK[prevIndex]);
                  }}
                  className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shrink-0"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-2 overflow-x-auto flex-1 hide-scrollbar">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all whitespace-nowrap ${
                        selectedDay === day ? 'bg-gradient-primary text-white shadow-lg' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const currentIndex = DAYS_OF_WEEK.indexOf(selectedDay);
                    const nextIndex = (currentIndex + 1) % DAYS_OF_WEEK.length;
                    setSelectedDay(DAYS_OF_WEEK[nextIndex]);
                  }}
                  className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shrink-0"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-fade-in">
                <h3 className="text-base sm:text-lg font-semibold mb-4">{selectedDay} Schedule</h3>
                
                {getTimetablesByDay(selectedDay).length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No classes scheduled for {selectedDay}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getTimetablesByDay(selectedDay).map(timetable => (
                      <div
                        key={timetable._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getTypeColor(timetable.type)}`}>
                                {getTypeIcon(timetable.type)} {timetable.type}
                              </span>
                              <span className="font-semibold text-gray-900 text-sm sm:text-lg break-words">
                                {timetable.subject?.name}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm mt-3">
                              <div className="flex items-center text-gray-600">
                                <Clock className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                                <span className="font-medium break-words">
                                  {formatTime(timetable.startTime)} - {formatTime(timetable.endTime)}
                                </span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <MapPin className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                                <span className="break-words">
                                  {timetable.room}
                                  {timetable.building && ` (${timetable.building})`}
                                </span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <User className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                                <span className="break-words">
                                  {timetable.teacher?.profile?.firstName} {timetable.teacher?.profile?.lastName}
                                </span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <BookOpen className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                                <span className="break-words">{timetable.subject?.code}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mt-6">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Class Types</h3>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-purple-500 to-purple-600"></div>
                <span className="text-xs sm:text-sm text-gray-700">Lecture</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-teal-500 to-teal-600"></div>
                <span className="text-xs sm:text-sm text-gray-700">Lab</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
                <span className="text-xs sm:text-sm text-gray-700">Tutorial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-pink-500 to-pink-600"></div>
                <span className="text-xs sm:text-sm text-gray-700">Seminar</span>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
