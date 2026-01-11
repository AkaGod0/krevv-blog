"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Ban,
  CheckCircle,
  Mail,
  MapPin,
  Calendar,
  Loader2,
  AlertCircle,
  X,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  ShieldX,
  BadgeCheck,
} from "lucide-react";
import { adminApi } from "../context/AdminContext";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  isBlocked: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  blockedReason?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  // ✅ UPDATED: Added verified and unverified to filter options
  const [filter, setFilter] = useState<"all" | "active" | "blocked" | "verified" | "unverified">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, filter, users]);

  const fetchUsers = async () => {
    try {
      const res = await adminApi.get("/admin/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // ✅ UPDATED: Added verified and unverified filter logic
    if (filter === "active") {
      filtered = filtered.filter((u) => !u.isBlocked);
    } else if (filter === "blocked") {
      filtered = filtered.filter((u) => u.isBlocked);
    } else if (filter === "verified") {
      filtered = filtered.filter((u) => u.isEmailVerified);
    } else if (filter === "unverified") {
      filtered = filtered.filter((u) => !u.isEmailVerified);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (u) =>
          u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleBlockUser = (user: User) => {
    setSelectedUser(user);
    if (user.isBlocked) {
      setShowUnblockModal(true);
    } else {
      setBlockReason("");
      setShowBlockModal(true);
    }
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmBlockUser = async () => {
    if (!selectedUser || !blockReason.trim()) {
      setErrorMessage("Please provide a reason for blocking this user");
      setShowErrorModal(true);
      return;
    }

    setActionLoading(selectedUser._id);
    try {
      await adminApi.post(`/admin/users/${selectedUser._id}/block`, { 
        reason: blockReason 
      });
      
      setShowBlockModal(false);
      setSuccessMessage(`${selectedUser.firstName} ${selectedUser.lastName} has been blocked successfully`);
      setShowSuccessModal(true);
      fetchUsers();
    } catch (error: any) {
      console.error("Error blocking user:", error);
      setShowBlockModal(false);
      setErrorMessage(error.response?.data?.message || "Failed to block user");
      setShowErrorModal(true);
    } finally {
      setActionLoading(null);
    }
  };

  const confirmUnblockUser = async () => {
    if (!selectedUser) return;

    setActionLoading(selectedUser._id);
    try {
      await adminApi.post(`/admin/users/${selectedUser._id}/unblock`);
      
      setShowUnblockModal(false);
      setSuccessMessage(`${selectedUser.firstName} ${selectedUser.lastName} has been unblocked successfully`);
      setShowSuccessModal(true);
      fetchUsers();
    } catch (error: any) {
      console.error("Error unblocking user:", error);
      setShowUnblockModal(false);
      setErrorMessage(error.response?.data?.message || "Failed to unblock user");
      setShowErrorModal(true);
    } finally {
      setActionLoading(null);
    }
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    setActionLoading(selectedUser._id);
    try {
      const response = await adminApi.delete(`/admin/users/${selectedUser._id}`);
      
      setShowDeleteModal(false);
      setSuccessMessage(
        `${selectedUser.firstName} ${selectedUser.lastName} has been permanently deleted. ${
          response.data.deletedJobs ? `${response.data.deletedJobs} jobs were also deleted.` : ''
        }`
      );
      setShowSuccessModal(true);
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      setShowDeleteModal(false);
      setErrorMessage(error.response?.data?.message || "Failed to delete user");
      setShowErrorModal(true);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500 w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white"
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <Users size={24} className="sm:w-8 sm:h-8" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">User Management</h1>
        </div>
        <p className="text-sm sm:text-base text-blue-100">
          Manage all registered users on the platform
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg sm:rounded-xl shadow p-4 sm:p-6">
          <p className="text-gray-600 text-xs sm:text-sm mb-1">Total Users</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-800">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow p-4 sm:p-6">
          <p className="text-gray-600 text-xs sm:text-sm mb-1">Active Users</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">
            {users.filter((u) => !u.isBlocked).length}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow p-4 sm:p-6">
          <p className="text-gray-600 text-xs sm:text-sm mb-1">Verified Users</p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">
            {users.filter((u) => u.isEmailVerified).length}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow p-4 sm:p-6">
          <p className="text-gray-600 text-xs sm:text-sm mb-1">Blocked Users</p>
          <p className="text-2xl sm:text-3xl font-bold text-red-600">
            {users.filter((u) => u.isBlocked).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base text-gray-800"
            />
          </div>

          {/* ✅ UPDATED: Added Verified and Unverified options */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base text-gray-800"
          >
            <option value="all">All Users</option>
            <option value="active">Active Users</option>
            <option value="blocked">Blocked Users</option>
            <option value="verified">✓ Verified Users</option>
            <option value="unverified">✗ Unverified Users</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg sm:rounded-xl shadow p-8 sm:p-12 text-center">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={40} />
            <p className="text-sm sm:text-base text-gray-600">No users found</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg sm:rounded-xl shadow hover:shadow-lg transition p-4 sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="bg-blue-600 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm sm:text-base">
                    {user.firstName.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-base sm:text-lg font-bold text-gray-800 break-words">
                        {user.firstName} {user.lastName}
                      </h3>
                      
                      {user.isEmailVerified ? (
                        <span className="px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded flex items-center gap-1">
                          <BadgeCheck size={12} />
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded flex items-center gap-1">
                          <AlertCircle size={12} />
                          Unverified
                        </span>
                      )}

                      {user.isBlocked ? (
                        <span className="px-2 py-0.5 sm:py-1 bg-red-100 text-red-600 text-xs font-semibold rounded">
                          Blocked
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 sm:py-1 bg-green-100 text-green-600 text-xs font-semibold rounded">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                        <span className="break-all">{user.email}</span>
                      </div>
                      {user.location && (
                        <div className="flex items-center gap-2">
                          <MapPin size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                          <span>{user.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                        <span>
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {user.isBlocked && user.blockedReason && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs sm:text-sm text-red-700">
                        <strong>Reason:</strong> {user.blockedReason}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleBlockUser(user)}
                    disabled={actionLoading === user._id}
                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition disabled:opacity-50 text-xs sm:text-sm whitespace-nowrap ${
                      user.isBlocked
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    {actionLoading === user._id ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : user.isBlocked ? (
                      <>
                        <CheckCircle size={14} />
                        Unblock
                      </>
                    ) : (
                      <>
                        <Ban size={14} />
                        Block
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteUser(user)}
                    disabled={actionLoading === user._id}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition disabled:opacity-50 text-xs sm:text-sm bg-gray-800 hover:bg-gray-900 text-white whitespace-nowrap"
                  >
                    {actionLoading === user._id ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <>
                        <Trash2 size={14} />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* ✅ BLOCK USER MODAL - Same as before */}
      <AnimatePresence>
        {showBlockModal && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBlockModal(false)}
              className="fixed inset-0 bg-black/60 z-50"
            />

            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-lg p-5 sm:p-6 md:p-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setShowBlockModal(false)}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition"
                  >
                    <X size={20} className="sm:w-6 sm:h-6" />
                  </button>

                  <div className="bg-red-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <ShieldAlert className="text-red-600" size={32} />
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 text-center">
                    Block User
                  </h2>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">User:</p>
                    <p className="font-semibold text-sm sm:text-base text-gray-800 break-words">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 break-all">{selectedUser.email}</p>
                  </div>

                  <div className="mb-4 sm:mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Reason for blocking <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      placeholder="Enter the reason for blocking this user..."
                      rows={4}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none text-sm sm:text-base text-gray-800"
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                    <p className="text-xs sm:text-sm text-yellow-800">
                      <strong>⚠️ Warning:</strong> This user will not be able to login until unblocked.
                    </p>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <button
                      onClick={confirmBlockUser}
                      disabled={!blockReason.trim() || actionLoading === selectedUser._id}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      {actionLoading === selectedUser._id ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Blocking User...
                        </>
                      ) : (
                        <>
                          <Ban size={18} />
                          Block User
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setShowBlockModal(false)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 sm:py-3 rounded-lg transition-all text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ✅ UNBLOCK USER MODAL - Same as before */}
      <AnimatePresence>
        {showUnblockModal && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUnblockModal(false)}
              className="fixed inset-0 bg-black/60 z-50"
            />

            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-lg p-5 sm:p-6 md:p-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setShowUnblockModal(false)}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition"
                  >
                    <X size={20} className="sm:w-6 sm:h-6" />
                  </button>

                  <div className="bg-green-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <ShieldCheck className="text-green-600" size={32} />
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 text-center">
                    Unblock User
                  </h2>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">User:</p>
                    <p className="font-semibold text-sm sm:text-base text-gray-800 break-words">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 break-all">{selectedUser.email}</p>
                  </div>

                  {selectedUser.blockedReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                      <p className="text-xs sm:text-sm text-red-800">
                        <strong>Previously blocked for:</strong> {selectedUser.blockedReason}
                      </p>
                    </div>
                  )}

                  <p className="text-sm sm:text-base text-gray-600 text-center mb-4 sm:mb-6">
                    This user will be able to login and access the platform again.
                  </p>

                  <div className="space-y-2 sm:space-y-3">
                    <button
                      onClick={confirmUnblockUser}
                      disabled={actionLoading === selectedUser._id}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      {actionLoading === selectedUser._id ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Unblocking User...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          Unblock User
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setShowUnblockModal(false)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 sm:py-3 rounded-lg transition-all text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ✅ NEW: DELETE USER MODAL */}
      <AnimatePresence>
        {showDeleteModal && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="fixed inset-0 bg-black/60 z-50"
            />

            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-lg p-5 sm:p-6 md:p-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition"
                  >
                    <X size={20} className="sm:w-6 sm:h-6" />
                  </button>

                  <div className="bg-gray-900 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <ShieldX className="text-white" size={32} />
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 text-center">
                    Delete User Permanently
                  </h2>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">User:</p>
                    <p className="font-semibold text-sm sm:text-base text-gray-800 break-words">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 break-all">{selectedUser.email}</p>
                  </div>

                  <div className="bg-red-50 border-2 border-red-500 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                    <p className="text-xs sm:text-sm text-red-800 font-semibold mb-2">
                      ⚠️ This action is PERMANENT and CANNOT be undone!
                    </p>
                    <ul className="text-xs sm:text-sm text-red-700 space-y-1 list-disc list-inside">
                      <li>User account will be permanently deleted</li>
                      <li>All jobs posted by this user will be deleted</li>
                      <li>Profile images and CV will be removed</li>
                      <li>User data cannot be recovered</li>
                    </ul>
                  </div>

                  <p className="text-sm sm:text-base text-gray-600 text-center mb-4 sm:mb-6 font-medium">
                    Are you absolutely sure you want to proceed?
                  </p>

                  <div className="space-y-2 sm:space-y-3">
                    <button
                      onClick={confirmDeleteUser}
                      disabled={actionLoading === selectedUser._id}
                      className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-300 text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      {actionLoading === selectedUser._id ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Deleting User...
                        </>
                      ) : (
                        <>
                          <Trash2 size={18} />
                          Yes, Delete Permanently
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 sm:py-3 rounded-lg transition-all text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ✅ SUCCESS MODAL - Same as before */}
      <AnimatePresence>
        {showSuccessModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessModal(false)}
              className="fixed inset-0 bg-black/60 z-50"
            />

            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-green-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <CheckCircle className="text-green-600" size={32} />
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 text-center">
                    Success!
                  </h2>

                  <p className="text-sm sm:text-base text-gray-600 text-center mb-4 sm:mb-6 px-2">
                    {successMessage}
                  </p>

                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-all text-sm sm:text-base"
                  >
                    Got it!
                  </button>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ✅ ERROR MODAL - Same as before */}
      <AnimatePresence>
        {showErrorModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowErrorModal(false)}
              className="fixed inset-0 bg-black/60 z-50"
            />

            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-red-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <AlertCircle className="text-red-600" size={32} />
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 text-center">
                    Error
                  </h2>

                  <p className="text-sm sm:text-base text-gray-600 text-center mb-4 sm:mb-6 px-2">
                    {errorMessage}
                  </p>

                  <button
                    onClick={() => setShowErrorModal(false)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-all text-sm sm:text-base"
                  >
                    Close
                  </button>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}