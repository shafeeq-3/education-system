import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, BookOpen, Users, Download, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TeacherTimetable() {
  const { user } = useAuth();
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const { toasts, removeToast, error } = useToast();

  useEffect(() => {
    if (user?._id) {
      fetchTimetables();
    }
  }, [user]);

  const fetchTimetables = async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/timetables?teacherId=${user._id}&limit=1000`);
      setTimetables(response.data.data.items || []);
    } catch (err) {
      error('Failed to load timetable');
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Timetable</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">View your weekly teaching schedule</p>
      </div>

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
              <p className="text-xs sm:text-sm text-gray-600">Classes</p>
              <p className="text-xl sm:text-2xl font-bold text-pink-600">
                {new Set(timetables.map(t => t.class?._id)).size}
              </p>
            </div>
            <div className="p-3 bg-pink-100 rounded-lg">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar">
        {DAYS_OF_WEEK.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              selectedDay === day ? 'bg-gradient-primary text-white shadow-lg' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold">{selectedDay} Schedule</h3>
          <button 
            onClick={() => window.print()}
            className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-50 to-teal-50 border border-purple-200 text-purple-700 rounded-lg hover:shadow-md transition-all font-medium text-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Print
          </button>
        </div>
        
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
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getTypeColor(timetable.type)}`}>
                    {timetable.type}
                  </span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-lg break-words">
                    {timetable.subject?.name}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
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
                    <Users className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                    <span className="break-words">
                      {timetable.class?.name} - Section {timetable.class?.section}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <BookOpen className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                    <span className="break-words">{timetable.subject?.code}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
