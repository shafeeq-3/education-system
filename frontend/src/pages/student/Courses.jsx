import { useState, useEffect } from 'react';
import { BookOpen, Users, Calendar, Clock, Loader2, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function StudentCourses() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toasts, removeToast, error } = useToast();

  useEffect(() => {
    if (user?._id) {
      fetchEnrollments();
    }
  }, [user]);

  const fetchEnrollments = async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/enrollments/student/${user._id}`);
      const enrollmentData = response.data.data.items || [];
      
      // Group enrollments by semester
      const groupedBySemester = enrollmentData.reduce((acc, enrollment) => {
        const semesterId = enrollment.semester?._id || 'unknown';
        if (!acc[semesterId]) {
          acc[semesterId] = {
            semester: enrollment.semester,
            academicYear: enrollment.academicYear,
            classes: []
          };
        }
        acc[semesterId].classes.push({
          ...enrollment,
          classData: enrollment.class
        });
        return acc;
      }, {});
      
      setEnrollments(Object.values(groupedBySemester));
    } catch (err) {
      console.error('Failed to load courses:', err);
      error(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">View your enrolled courses and class details</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No enrollments found</p>
          <p className="text-sm text-gray-400 mt-2">Contact your administrator to enroll in courses</p>
        </div>
      ) : (
        <div className="space-y-6">
          {enrollments.map((semesterGroup, idx) => (
            <div key={semesterGroup.semester?._id || idx} className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-scale-in">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    {semesterGroup.semester?.name || 'Semester'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {semesterGroup.academicYear?.year || 'Academic Year'}
                  </p>
                </div>
                <span className="inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-green-100 to-teal-100 text-green-800">
                  {semesterGroup.classes.length} Course{semesterGroup.classes.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {semesterGroup.classes?.map((enrollment) => {
                  const classData = enrollment.classData || {};
                  const subject = enrollment.subject || {};
                  
                  return (
                    <div key={enrollment._id} className="bg-gradient-to-br from-purple-50 to-teal-50 rounded-xl p-4 hover:shadow-lg transition-all border border-purple-100">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="shrink-0 p-2 bg-gradient-primary rounded-lg">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                            {subject.name || 'Subject'}
                          </h3>
                          <p className="text-xs sm:text-sm text-purple-600 font-medium">
                            {subject.code || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                        {classData.teacher && (
                          <div className="flex items-start gap-2">
                            <Users className="h-4 w-4 shrink-0 mt-0.5 text-purple-600" />
                            <span className="break-words">
                              {classData.teacher.profile?.firstName} {classData.teacher.profile?.lastName}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 shrink-0 mt-0.5 text-teal-600" />
                          <span className="break-words">
                            {classData.name || 'Class'} {classData.section ? `- Section ${classData.section}` : ''}
                          </span>
                        </div>

                        {classData.room && (
                          <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 shrink-0 mt-0.5 text-purple-600" />
                            <span>{classData.room}</span>
                          </div>
                        )}

                        {subject.credits && (
                          <div className="pt-2 border-t border-purple-200 mt-2 flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-teal-600" />
                            <span className="font-semibold text-gray-900">{subject.credits} Credits</span>
                          </div>
                        )}
                        
                        <div className="pt-2 border-t border-purple-200 mt-2">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            enrollment.status === 'approved' ? 'bg-green-100 text-green-800' :
                            enrollment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {enrollment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {(!semesterGroup.classes || semesterGroup.classes.length === 0) && (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No classes assigned yet</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
