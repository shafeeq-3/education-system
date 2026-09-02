import { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, Clock, AlertCircle, BookOpen, User, Calendar, Filter, Loader2, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function EnrollmentRequest() {
  const { user } = useAuth();
  const [availableClasses, setAvailableClasses] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({ search: '', subjectId: '', semesterId: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [activeTab, setActiveTab] = useState('available');
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    if (user?._id) {
      fetchData();
      fetchDropdownData();
    }
  }, [filters, user]);

  const fetchDropdownData = async () => {
    try {
      const [subjectsRes, semestersRes] = await Promise.all([
        axios.get('/subjects?limit=1000'),
        axios.get('/semesters?limit=1000')
      ]);
      
      setSubjects(subjectsRes.data.data.items || []);
      setSemesters(semestersRes.data.data.items || []);
    } catch (err) {
      error('Failed to load filters');
    }
  };

  const fetchData = async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      
      const classParams = new URLSearchParams({
        limit: 100,
        isActive: 'true',
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });
      const classesRes = await axios.get(`/classes?${classParams}`);
      const enrollmentsRes = await axios.get(`/enrollments?studentId=${user._id}`);
      
      setAvailableClasses(classesRes.data.data.items || []);
      setMyEnrollments(enrollmentsRes.data.data.items || []);
    } catch (err) {
      error('Failed to load enrollment data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestEnrollment = async () => {
    if (!selectedClass) return;
    
    try {
      setSubmitting(true);
      const user = JSON.parse(localStorage.getItem('user'));
      
      await axios.post('/enrollments', {
        studentId: user._id,
        classId: selectedClass._id,
        subjectId: selectedClass.subjectId?._id || selectedClass.subject?._id,
        semesterId: selectedClass.semesterId?._id || selectedClass.semester?._id,
        academicYearId: selectedClass.semesterId?.academicYear || selectedClass.semester?.academicYear || selectedClass.academicYear?._id,
        status: 'pending'
      });
      
      success('Enrollment request submitted successfully!');
      fetchData();
      setShowRequestModal(false);
      setSelectedClass(null);
    } catch (err) {
      error(err.response?.data?.error?.message || 'Failed to request enrollment');
    } finally {
      setSubmitting(false);
    }
  };

  const isAlreadyEnrolled = (classId) => myEnrollments.some(e => e.class?._id === classId);
  const getEnrollmentStatus = (classId) => myEnrollments.find(e => e.class?._id === classId)?.status;

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800',
      approved: 'bg-gradient-to-r from-green-100 to-teal-100 text-green-800',
      rejected: 'bg-gradient-to-r from-red-100 to-orange-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />;
      default: return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />;
    }
  };

  const pendingCount = myEnrollments.filter(e => e.status === 'pending').length;
  const approvedCount = myEnrollments.filter(e => e.status === 'approved').length;
  const rejectedCount = myEnrollments.filter(e => e.status === 'rejected').length;

  if (loading && availableClasses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Course Enrollment</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Request enrollment in available classes</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Approved</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{approvedCount}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Pending</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Rejected</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{rejectedCount}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap text-sm sm:text-base ${
            activeTab === 'available' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Available Classes
        </button>
        <button
          onClick={() => setActiveTab('my-enrollments')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap text-sm sm:text-base ${
            activeTab === 'my-enrollments' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          My Enrollments
          {pendingCount > 0 && (
            <span className="ml-2 bg-yellow-500 text-white text-xs rounded-full px-2 py-0.5">{pendingCount}</span>
          )}
        </button>
      </div>

      {activeTab === 'available' && (
        <>
          {showFilters && (
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Filter Classes</h3>
                <button 
                  onClick={() => setFilters({ search: '', subjectId: '', semesterId: '' })}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Clear All
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="Search..."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    value={filters.subjectId}
                    onChange={(e) => setFilters(prev => ({ ...prev, subjectId: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                  <select
                    value={filters.semesterId}
                    onChange={(e) => setFilters(prev => ({ ...prev, semesterId: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="">All Semesters</option>
                    {semesters.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="mb-6 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableClasses.map(classItem => {
              const enrolled = isAlreadyEnrolled(classItem._id);
              const status = getEnrollmentStatus(classItem._id);
              
              return (
                <div key={classItem._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-4 sm:p-5 animate-scale-in">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base sm:text-lg break-words">{classItem.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 break-words">Section {classItem.section}</p>
                    </div>
                    {enrolled && (
                      <span className={`px-2 py-1 rounded text-xs font-medium shrink-0 ${getStatusColor(status)}`}>{status}</span>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <BookOpen className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                      <span className="font-medium break-words">{classItem.subjectId?.name || classItem.subject?.name}</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                      <span className="break-words">{classItem.teacherId?.profile?.firstName || classItem.teacher?.profile?.firstName} {classItem.teacherId?.profile?.lastName || classItem.teacher?.profile?.lastName}</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                      <span className="break-words">{classItem.semesterId?.name || classItem.semester?.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="text-xs sm:text-sm text-gray-600">
                      <span className="font-medium">{classItem.enrolledCount || 0}</span>
                      <span className="text-gray-500">/{classItem.maxStudents}</span>
                    </div>
                    
                    {!enrolled ? (
                      <button
                        onClick={() => {
                          setSelectedClass(classItem);
                          setShowRequestModal(true);
                        }}
                        disabled={classItem.enrolledCount >= classItem.maxStudents}
                        className="px-3 sm:px-4 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition-all font-medium text-xs sm:text-sm disabled:opacity-50 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Enroll
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">{getStatusIcon(status)}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'my-enrollments' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {myEnrollments.length === 0 ? (
            <div className="text-center py-12 p-4">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500">No enrollments yet</p>
              <button 
                onClick={() => setActiveTab('available')} 
                className="mt-4 px-6 py-2.5 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Browse Classes
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-gradient-to-r from-purple-50 to-teal-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {myEnrollments.map(enrollment => (
                    <tr key={enrollment._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 break-words">
                          {enrollment.class?.name} - {enrollment.class?.section}
                        </div>
                        <div className="text-xs text-gray-500 break-words">{enrollment.subject?.name}</div>
                      </td>
                      <td className="px-4 py-4 text-xs sm:text-sm text-gray-900 break-words">
                        {enrollment.class?.teacher?.profile?.firstName} {enrollment.class?.teacher?.profile?.lastName}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                          {enrollment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showRequestModal && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Confirm Enrollment</h2>
              <button onClick={() => { setShowRequestModal(false); setSelectedClass(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-teal-50 border border-purple-200 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-3 text-sm sm:text-base">Class Details</h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div><span className="text-purple-700 font-medium">Class:</span> {selectedClass.name}</div>
                  <div><span className="text-purple-700 font-medium">Subject:</span> {selectedClass.subjectId?.name || selectedClass.subject?.name}</div>
                  <div><span className="text-purple-700 font-medium">Teacher:</span> {selectedClass.teacherId?.profile?.firstName || selectedClass.teacher?.profile?.firstName} {selectedClass.teacherId?.profile?.lastName || selectedClass.teacher?.profile?.lastName}</div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button
                  onClick={() => { setShowRequestModal(false); setSelectedClass(null); }}
                  disabled={submitting}
                  className="w-full sm:flex-1 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRequestEnrollment}
                  disabled={submitting}
                  className="w-full sm:flex-1 px-6 py-2.5 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <><Loader2 className="h-5 w-5 animate-spin" />Submitting...</> : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}
