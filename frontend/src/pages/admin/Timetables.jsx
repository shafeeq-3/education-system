import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Calendar, Clock, MapPin, AlertCircle, Loader2, X } from 'lucide-react';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIMETABLE_TYPES = ['lecture', 'lab', 'tutorial', 'seminar'];

export default function Timetables() {
  const [timetables, setTimetables] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dayFilter, setDayFilter] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    classId: '', teacherId: '', subjectId: '', semesterId: '', dayOfWeek: '',
    startTime: '', endTime: '', room: '', building: '', type: 'lecture'
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    fetchTimetables();
    fetchDropdownData();
  }, [searchTerm, dayFilter, pagination.page]);

  const fetchDropdownData = async () => {
    try {
      const [classesRes, teachersRes, subjectsRes, semestersRes] = await Promise.all([
        axios.get('/classes'),
        axios.get('/users?role=teacher&status=approved'),
        axios.get('/subjects'),
        axios.get('/semesters')
      ]);
      setClasses(classesRes.data.data.items || []);
      setTeachers(teachersRes.data.data.items || []);
      setSubjects(subjectsRes.data.data.items || []);
      setSemesters(semestersRes.data.data.items || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchTimetables = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, limit: pagination.limit };
      if (searchTerm) params.search = searchTerm;
      if (dayFilter) params.dayOfWeek = dayFilter;
      const response = await axios.get('/timetables', { params });
      setTimetables(response.data.data.items || []);
      setPagination(prev => ({ ...prev, total: response.data.data.pagination?.total || 0 }));
    } catch (err) {
      error('Failed to load timetables');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setSubmitting(true);
    try {
      if (editingId) {
        await axios.put(`/timetables/${editingId}`, formData);
        success('Timetable updated successfully');
      } else {
        await axios.post('/timetables', formData);
        success('Timetable created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchTimetables();
    } catch (err) {
      if (err.response?.data?.error?.errors) {
        const errors = {};
        err.response.data.error.errors.forEach(e => {
          errors[e.field] = e.message;
        });
        setFieldErrors(errors);
      } else {
        error(err.response?.data?.error?.message || 'Operation failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      const response = await axios.get(`/timetables/${id}`);
      const data = response.data.data;
      setFormData({
        classId: data.class?._id || '', teacherId: data.teacher?._id || '',
        subjectId: data.subject?._id || '', semesterId: data.semester?._id || '',
        dayOfWeek: data.dayOfWeek || '', startTime: data.startTime || '',
        endTime: data.endTime || '', room: data.room || '', building: data.building || '',
        type: data.type || 'lecture'
      });
      setEditingId(id);
      setShowModal(true);
    } catch (err) {
      error('Failed to fetch timetable details');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this timetable entry?')) return;
    try {
      await axios.delete(`/timetables/${id}`);
      success('Timetable deleted successfully');
      fetchTimetables();
    } catch (err) {
      error('Failed to delete timetable');
    }
  };

  const resetForm = () => {
    setFormData({
      classId: '', teacherId: '', subjectId: '', semesterId: '', dayOfWeek: '',
      startTime: '', endTime: '', room: '', building: '', type: 'lecture'
    });
    setEditingId(null);
    setFieldErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Timetable Management</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage class schedules and timetables</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="w-full sm:w-auto px-4 py-3 bg-gradient-primary text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Timetable
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search timetables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <select
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="">All Days</option>
            {DAYS_OF_WEEK.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      ) : timetables.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No timetable entries found</p>
          <p className="text-gray-400 text-sm mt-2">Create your first timetable entry to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {timetables.map((tt) => (
            <div key={tt._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 break-words">
                      {tt.subject?.name || 'N/A'}
                    </h3>
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 font-medium">
                      {tt.dayOfWeek}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-teal-100 text-teal-800 font-medium capitalize">
                      {tt.type}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-gray-500 block">Time:</span>
                        <p className="font-medium text-gray-900">{tt.startTime} - {tt.endTime}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Class:</span>
                      <p className="font-medium text-gray-900 break-words">{tt.class?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Teacher:</span>
                      <p className="font-medium text-gray-900 break-words">
                        {tt.teacher?.profile?.firstName} {tt.teacher?.profile?.lastName}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-gray-500 block">Location:</span>
                        <p className="font-medium text-gray-900">{tt.room}, {tt.building}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Semester:</span>
                      <p className="font-medium text-gray-900 break-words">{tt.semester?.name || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(tt._id)}
                    className="flex-1 lg:flex-none px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="hidden xs:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(tt._id)}
                    className="flex-1 lg:flex-none px-3 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden xs:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.total > pagination.limit && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
          <button 
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            className="w-full sm:w-auto px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 font-medium">
            Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button 
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            className="w-full sm:w-auto px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Next
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Timetable' : 'Create Timetable'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(90vh-120px)] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="classId"
                    value={formData.classId}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2.5 border ${
                      fieldErrors.classId ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls._id} value={cls._id}>{cls.name} - Section {cls.section}</option>
                    ))}
                  </select>
                  {fieldErrors.classId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {fieldErrors.classId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2.5 border ${
                      fieldErrors.subjectId ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject._id} value={subject._id}>{subject.name}</option>
                    ))}
                  </select>
                  {fieldErrors.subjectId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {fieldErrors.subjectId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teacher <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2.5 border ${
                      fieldErrors.teacherId ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.profile?.firstName} {teacher.profile?.lastName}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.teacherId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {fieldErrors.teacherId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="semesterId"
                    value={formData.semesterId}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2.5 border ${
                      fieldErrors.semesterId ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                  >
                    <option value="">Select Semester</option>
                    {semesters.map(sem => (
                      <option key={sem._id} value={sem._id}>{sem.name}</option>
                    ))}
                  </select>
                  {fieldErrors.semesterId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {fieldErrors.semesterId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Day of Week <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="dayOfWeek"
                    value={formData.dayOfWeek}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2.5 border ${
                      fieldErrors.dayOfWeek ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                  >
                    <option value="">Select Day</option>
                    {DAYS_OF_WEEK.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  {fieldErrors.dayOfWeek && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {fieldErrors.dayOfWeek}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    {TIMETABLE_TYPES.map(type => (
                      <option key={type} value={type} className="capitalize">{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2.5 border ${
                      fieldErrors.startTime ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                  />
                  {fieldErrors.startTime && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {fieldErrors.startTime}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2.5 border ${
                      fieldErrors.endTime ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                  />
                  {fieldErrors.endTime && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {fieldErrors.endTime}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                  <input
                    type="text"
                    name="room"
                    value={formData.room}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Room 101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Building</label>
                  <input
                    type="text"
                    name="building"
                    value={formData.building}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Main Building"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {editingId ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>{editingId ? 'Update' : 'Create'} Timetable</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
