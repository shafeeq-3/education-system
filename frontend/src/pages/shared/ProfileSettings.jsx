import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Loader2, AlertCircle } from 'lucide-react';
import axios from '../../lib/axios';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function ProfileSettings() {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', phone: '', address: '', city: '', state: '', country: '', postalCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    if (user?.profile) {
      setFormData({
        firstName: user.profile.firstName || '', lastName: user.profile.lastName || '',
        phone: user.profile.phone || '', address: user.profile.address || '',
        city: user.profile.city || '', state: user.profile.state || '',
        country: user.profile.country || '', postalCode: user.profile.postalCode || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setLoading(true);

    try {
      const response = await axios.patch('/auth/profile', { profile: formData });
      
      // Check if response is successful
      if (response.data && response.data.success) {
        // Refresh user data from server
        await refreshUser();
        success('Profile updated successfully!');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      if (err.response?.data?.error?.errors) {
        const errors = {};
        err.response.data.error.errors.forEach(e => {
          errors[e.field] = e.message;
        });
        setFieldErrors(errors);
      } else {
        error(err.response?.data?.error?.message || err.message || 'Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
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
      
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your personal information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile Summary Card */}
          <div className="bg-white rounded-xl shadow-md p-6 animate-scale-in">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                <User className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                {user?.profile?.firstName} {user?.profile?.lastName}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 break-all">{user?.email}</p>
              <span className="inline-block mt-3 px-3 py-1 bg-gradient-primary text-white text-xs sm:text-sm rounded-full capitalize font-medium">
                {user?.role}
              </span>
              <div className="mt-4 pt-4 border-t text-left space-y-3">
                <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                  <Mail className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="break-all">{user?.email}</span>
                </div>
                {user?.profile?.phone && (
                  <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                    <Phone className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="break-words">{user.profile.phone}</span>
                  </div>
                )}
                {user?.profile?.city && (
                  <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="break-words">{user.profile.city}, {user.profile.country}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={loading}
                      className={`w-full px-3 py-2.5 border ${
                        fieldErrors.firstName ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50`}
                    />
                    {fieldErrors.firstName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {fieldErrors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={loading}
                      className={`w-full px-3 py-2.5 border ${
                        fieldErrors.lastName ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50`}
                    />
                    {fieldErrors.lastName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {fieldErrors.lastName}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    if (user?.profile) {
                      setFormData({
                        firstName: user.profile.firstName || '', lastName: user.profile.lastName || '',
                        phone: user.profile.phone || '', address: user.profile.address || '',
                        city: user.profile.city || '', state: user.profile.state || '',
                        country: user.profile.country || '', postalCode: user.profile.postalCode || ''
                      });
                    }
                  }}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
