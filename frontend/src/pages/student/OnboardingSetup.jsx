import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, BookOpen, GraduationCap, Calendar, Loader2, ArrowRight } from 'lucide-react';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function OnboardingSetup() {
  const navigate = useNavigate();
  const { toasts, removeToast, success, error } = useToast();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  
  const [formData, setFormData] = useState({
    programId: '',
    semesterId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      
      // Fetch programs
      const programsRes = await axios.get('/programs');
      setPrograms(programsRes.data.data.items || []);
      
      // Fetch active semesters
      const semestersRes = await axios.get('/semesters?isCurrent=true');
      setSemesters(semestersRes.data.data.items || []);
      
    } catch (err) {
      console.error('Failed to fetch data:', err);
      error('Failed to load setup data. Please refresh the page.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.programId || !formData.semesterId) {
      error('Please select both program and semester');
      return;
    }

    setLoading(true);
    try {
      // Update user profile with selected program
      await axios.patch('/users/me', {
        program: formData.programId
      });

      success('Profile setup complete! Welcome to your dashboard.');
      setTimeout(() => {
        navigate('/student/dashboard');
        window.location.reload(); // Refresh to load new data
      }, 1500);
    } catch (err) {
      console.error('Setup failed:', err);
      error(err.response?.data?.error?.message || 'Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex items-center justify-center p-4">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4 shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome! Let's Set Up Your Profile</h1>
          <p className="text-gray-600">Complete your academic profile to get started</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200'
              }`}>
                {step > 1 ? <CheckCircle className="h-5 w-5" /> : '1'}
              </div>
              <span className="hidden sm:inline font-medium">Select Program</span>
            </div>
            
            <div className="w-12 h-0.5 bg-gray-300"></div>
            
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="hidden sm:inline font-medium">Select Semester</span>
            </div>
          </div>
        </div>

        {/* Setup Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 animate-scale-in">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-purple-600" />
                Select Your Program
              </h2>
              <p className="text-gray-600 mb-6">Choose the degree program you're enrolled in</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {programs.length > 0 ? (
                  programs.map((program) => (
                    <label
                      key={program._id}
                      className={`relative flex flex-col p-6 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.programId === program._id
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="programId"
                        value={program._id}
                        checked={formData.programId === program._id}
                        onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                        className="sr-only"
                      />
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">{program.name}</h3>
                        {formData.programId === program._id && (
                          <CheckCircle className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{program.code}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-auto">
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                          {program.duration} years
                        </span>
                        <span className="capitalize">{program.degreeLevel}</span>
                      </div>
                      {program.description && (
                        <p className="text-xs text-gray-500 mt-3 line-clamp-2">{program.description}</p>
                      )}
                    </label>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No programs available</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    if (!formData.programId) {
                      error('Please select a program');
                      return;
                    }
                    setStep(2);
                  }}
                  disabled={!formData.programId}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next Step
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-purple-600" />
                Select Current Semester
              </h2>
              <p className="text-gray-600 mb-6">Choose the semester you're currently enrolled in</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {semesters.length > 0 ? (
                  semesters.map((semester) => (
                    <label
                      key={semester._id}
                      className={`relative flex flex-col p-6 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.semesterId === semester._id
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="semesterId"
                        value={semester._id}
                        checked={formData.semesterId === semester._id}
                        onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}
                        className="sr-only"
                      />
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">{semester.name}</h3>
                        {formData.semesterId === semester._id && (
                          <CheckCircle className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{semester.code}</p>
                      <div className="flex flex-col gap-2 text-sm text-gray-600">
                        <span>
                          {new Date(semester.startDate).toLocaleDateString()} - {new Date(semester.endDate).toLocaleDateString()}
                        </span>
                        {semester.isCurrent && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium w-fit">
                            Current Semester
                          </span>
                        )}
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No active semesters available</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:border-gray-400 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.semesterId}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <CheckCircle className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Skip for now (you can set this up later)
          </button>
        </div>
      </div>
    </div>
  );
}
