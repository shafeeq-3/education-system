import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, UserCheck, UserX, CheckCircle, XCircle, AlertCircle, Loader2, X, Eye, Filter, Shield, ShieldOff } from 'lucide-react';
import axios from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

const ROLES = ['student', 'teacher', 'admin'];
const STATUSES = ['', 'pending', 'approved', 'blocked'];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, statusFilter, pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, limit: pagination.limit };
      if (searchTerm) params.search = searchTerm;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      const response = await axios.get('/users', { params });
      setUsers(response.data.data.items || []);
      setPagination(prev => ({ ...prev, total: response.data.data.pagination?.total || 0 }));
    } catch (err) {
      error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, approve = true) => {
    if (!confirm(`Are you sure you want to ${approve ? 'approve' : 'reject'} this user?`)) return;
    try {
      await axios.patch(`/users/${id}/approve`, { isApproved: approve });
      success(`User ${approve ? 'approved' : 'rejected'} successfully`);
      fetchUsers();
    } catch (err) {
      error(`Failed to ${approve ? 'approve' : 'reject'} user`);
    }
  };

  const handleBlock = async (id, block = true) => {
    if (!confirm(`Are you sure you want to ${block ? 'block' : 'unblock'} this user?`)) return;
    try {
      await axios.patch(`/users/${id}/block`, { isBlocked: block });
      success(`User ${block ? 'blocked' : 'unblocked'} successfully`);
      fetchUsers();
    } catch (err) {
      error(`Failed to ${block ? 'block' : 'unblock'} user`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/users/${id}`);
      success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      error('Failed to delete user');
    }
  };

  const getStatusBadge = (user) => {
    if (user.isBlocked) {
      return { style: 'bg-red-100 text-red-800', text: 'Blocked' };
    }
    if (user.isApproved) {
      return { style: 'bg-green-100 text-green-800', text: 'Approved' };
    }
    return { style: 'bg-yellow-100 text-yellow-800', text: 'Pending' };
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800',
      teacher: 'bg-blue-100 text-blue-800',
      student: 'bg-teal-100 text-teal-800'
    };
    return styles[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage users and approvals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="">All Roles</option>
            {ROLES.map(role => (
              <option key={role} value={role} className="capitalize">{role}</option>
            ))}
          </select>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="">All Status</option>
            {STATUSES.filter(s => s).map(status => (
              <option key={status} value={status} className="capitalize">{status}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No users found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {users.map((user) => (
            <div key={user._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 break-words">
                      {user.profile?.firstName} {user.profile?.lastName}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium capitalize ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusBadge(user).style}`}>
                      {getStatusBadge(user).text}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 block">Email:</span>
                      <p className="font-medium text-gray-900 break-all">{user.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Username:</span>
                      <p className="font-medium text-gray-900">{user.username}</p>
                    </div>
                    {user.profile?.phone && (
                      <div>
                        <span className="text-gray-500 block">Phone:</span>
                        <p className="font-medium text-gray-900">{user.profile.phone}</p>
                      </div>
                    )}
                    {user.campus && (
                      <div>
                        <span className="text-gray-500 block">Campus:</span>
                        <p className="font-medium text-gray-900 break-words">{user.campus?.name || 'N/A'}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500 block">Registered:</span>
                      <p className="font-medium text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row flex-wrap lg:flex-col gap-2 shrink-0">
                  {!user.isApproved && !user.isBlocked && (
                    <>
                      <button
                        onClick={() => handleApprove(user._id, true)}
                        className="flex-1 lg:flex-none min-w-[100px] px-3 py-2 bg-green-50 border border-green-300 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleApprove(user._id, false)}
                        className="flex-1 lg:flex-none min-w-[100px] px-3 py-2 bg-orange-50 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                  {user.isApproved && !user.isBlocked && (
                    <button
                      onClick={() => handleBlock(user._id, true)}
                      className="flex-1 lg:flex-none min-w-[100px] px-3 py-2 bg-red-50 border border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <ShieldOff className="h-4 w-4" />
                      <span>Block</span>
                    </button>
                  )}
                  {user.isBlocked && (
                    <button
                      onClick={() => handleBlock(user._id, false)}
                      className="flex-1 lg:flex-none min-w-[100px] px-3 py-2 bg-green-50 border border-green-300 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Unblock</span>
                    </button>
                  )}
                  <button
                    onClick={() => { setSelectedUser(user); setShowModal(true); }}
                    className="flex-1 lg:flex-none min-w-[100px] px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="flex-1 lg:flex-none min-w-[100px] px-3 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
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

      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => { setShowModal(false); setSelectedUser(null); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                  <p className="text-gray-900 font-medium">
                    {selectedUser.profile?.firstName} {selectedUser.profile?.lastName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Username</label>
                  <p className="text-gray-900 font-medium">{selectedUser.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-gray-900 font-medium break-all">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium capitalize ${getRoleBadge(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusBadge(selectedUser).style}`}>
                    {getStatusBadge(selectedUser).text}
                  </span>
                </div>
                {selectedUser.profile?.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                    <p className="text-gray-900 font-medium">{selectedUser.profile.phone}</p>
                  </div>
                )}
                {selectedUser.profile?.gender && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Gender</label>
                    <p className="text-gray-900 font-medium capitalize">{selectedUser.profile.gender}</p>
                  </div>
                )}
                {selectedUser.profile?.dateOfBirth && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Date of Birth</label>
                    <p className="text-gray-900 font-medium">
                      {new Date(selectedUser.profile.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedUser.campus && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Campus</label>
                    <p className="text-gray-900 font-medium">{selectedUser.campus?.name || 'N/A'}</p>
                  </div>
                )}
                {selectedUser.department && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
                    <p className="text-gray-900 font-medium">{selectedUser.department?.name || 'N/A'}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Registered</label>
                  <p className="text-gray-900 font-medium">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                  <p className="text-gray-900 font-medium">{new Date(selectedUser.updatedAt).toLocaleString()}</p>
                </div>
                {selectedUser.approvedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Approved At</label>
                    <p className="text-gray-900 font-medium">{new Date(selectedUser.approvedAt).toLocaleString()}</p>
                  </div>
                )}
                {selectedUser.lastActivity && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Last Activity</label>
                    <p className="text-gray-900 font-medium">{new Date(selectedUser.lastActivity).toLocaleString()}</p>
                  </div>
                )}
              </div>
              
              {/* Action Buttons in Modal */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                {!selectedUser.isApproved && !selectedUser.isBlocked && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedUser._id, true);
                        setShowModal(false);
                      }}
                      className="flex-1 min-w-[120px] px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <CheckCircle className="h-5 w-5" />
                      Approve User
                    </button>
                    <button
                      onClick={() => {
                        handleApprove(selectedUser._id, false);
                        setShowModal(false);
                      }}
                      className="flex-1 min-w-[120px] px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <XCircle className="h-5 w-5" />
                      Reject User
                    </button>
                  </>
                )}
                {selectedUser.isApproved && !selectedUser.isBlocked && (
                  <button
                    onClick={() => {
                      handleBlock(selectedUser._id, true);
                      setShowModal(false);
                    }}
                    className="flex-1 min-w-[120px] px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <ShieldOff className="h-5 w-5" />
                    Block User
                  </button>
                )}
                {selectedUser.isBlocked && (
                  <button
                    onClick={() => {
                      handleBlock(selectedUser._id, false);
                      setShowModal(false);
                    }}
                    className="flex-1 min-w-[120px] px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Shield className="h-5 w-5" />
                    Unblock User
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this user?')) {
                      handleDelete(selectedUser._id);
                      setShowModal(false);
                    }
                  }}
                  className="flex-1 min-w-[120px] px-4 py-2.5 bg-white border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Trash2 className="h-5 w-5" />
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
