'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Plus,
  KeyRound,
  AlertTriangle,
  Clock,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Activity,
  Calendar,
  CreditCard,
  Phone,
  Globe,
  RefreshCw,
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  // Selected User Modal / Drawer State
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<any | null>(null);

  const [editForm, setEditForm] = useState<any>({
    id: '',
    name: '',
    email: '',
    role: 'USER',
    status: 'ACTIVE',
    phone: '',
    country: '',
    timezone: 'UTC',
    password: '',
  });

  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    status: 'ACTIVE',
    phone: '',
    country: '',
    timezone: 'UTC',
  });

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter !== 'ALL') params.set('role', roleFilter);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);

      const res = await fetch(`/api/v1/admin/users?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data || []);
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const showFeedback = (text: string, isError = false) => {
    setFeedback({ text, isError });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Open Full User Details Drawer
  const handleViewUser = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/admin/users/${id}`);
      if (res.ok) {
        const json = await res.json();
        setSelectedUser(json.data);
        setIsDetailsOpen(true);
      }
    } catch {
      showFeedback('Failed to load user details', true);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (userItem: any) => {
    setEditForm({
      id: userItem.id,
      name: userItem.name,
      email: userItem.email,
      role: userItem.role,
      status: userItem.status,
      phone: userItem.phone || '',
      country: userItem.country || '',
      timezone: userItem.timezone || 'UTC',
      password: '',
    });
    setIsEditOpen(true);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...editForm };
      if (!payload.password) {
        delete payload.password; // Do not overwrite password if empty
      }

      const res = await fetch(`/api/v1/admin/users/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        showFeedback(json.error?.message || 'Failed to update user', true);
        return;
      }

      showFeedback('User details updated successfully.');
      setIsEditOpen(false);
      fetchUsers();
      if (selectedUser?.user?.id === editForm.id) {
        handleViewUser(editForm.id);
      }
    } catch {
      showFeedback('Error saving user updates', true);
    }
  };

  // Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });

      const json = await res.json();
      if (!res.ok) {
        showFeedback(json.error?.message || 'Failed to create user', true);
        return;
      }

      showFeedback(`User ${createForm.name} created successfully.`);
      setIsCreateOpen(false);
      setCreateForm({
        name: '',
        email: '',
        password: '',
        role: 'USER',
        status: 'ACTIVE',
        phone: '',
        country: '',
        timezone: 'UTC',
      });
      fetchUsers();
    } catch {
      showFeedback('Error creating user account', true);
    }
  };

  // Delete User
  const handleDeleteUser = async (userItem: any) => {
    try {
      const res = await fetch(`/api/v1/admin/users/${userItem.id}`, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (!res.ok) {
        showFeedback(json.error?.message || 'Failed to delete user', true);
        setDeleteConfirmUser(null);
        return;
      }

      showFeedback(`User ${userItem.name} (${userItem.email}) has been permanently deleted.`);
      setDeleteConfirmUser(null);
      if (selectedUser?.user?.id === userItem.id) {
        setIsDetailsOpen(false);
      }
      fetchUsers();
    } catch {
      showFeedback('Error deleting user account', true);
      setDeleteConfirmUser(null);
    }
  };

  // Toggle Suspend / Activate
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/v1/admin/users/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const json = await res.json();
      if (!res.ok) {
        showFeedback(json.error?.message || 'Failed to update status', true);
        return;
      }

      showFeedback(`User account has been ${nextStatus === 'ACTIVE' ? 'activated' : 'suspended'}.`);
      fetchUsers();
      if (selectedUser?.user?.id === id) {
        handleViewUser(id);
      }
    } catch {
      showFeedback('Error toggling status', true);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800">
            Super Admin
          </span>
        );
      case 'ADMIN':
        return (
          <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-purple-950 text-purple-300 border border-purple-800">
            Admin
          </span>
        );
      case 'SUPPORT':
        return (
          <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-blue-950 text-blue-300 border border-blue-800">
            Support Staff
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-800 text-slate-300">
            Normal User
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Stats Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            <span>Platform User Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage user accounts, roles, statuses, credentials, and full account lifecycles.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/staff"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold text-xs cursor-pointer transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Staff Management</span>
          </Link>
          <button
            type="button"
            onClick={fetchUsers}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 transition-all ${
            feedback.isError
              ? 'bg-rose-950/70 border border-rose-900 text-rose-300'
              : 'bg-emerald-950/70 border border-emerald-900 text-emerald-300'
          }`}
        >
          {feedback.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span className="font-semibold">{feedback.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user name or email address..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="CONTENT_MANAGER">Content Manager</option>
              <option value="SUPPORT">Support Staff</option>
              <option value="USER">Normal User</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 cursor-pointer"
            >
              Apply Filter
            </button>
          </div>
        </form>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">2FA & Security</th>
                <th className="py-3 px-4">Subscription</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm">{u.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">{getRoleBadge(u.role)}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : u.status === 'SUSPENDED'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      {u.twoFactorEnabled ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5" /> 2FA On
                        </span>
                      ) : (
                        <span className="text-slate-500">2FA Off</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-300">{u.plan}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleViewUser(u.id)}
                        title="View Full Profile & Activity"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(u)}
                        title="Edit Details, Role & Password"
                        className="p-1.5 rounded-lg bg-indigo-950/70 border border-indigo-800/80 hover:bg-indigo-900 text-indigo-300 hover:text-white cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {u.role !== 'SUPER_ADMIN' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u.id, u.status)}
                            title={u.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                            className={`p-1.5 rounded-lg cursor-pointer ${
                              u.status === 'ACTIVE'
                                ? 'bg-amber-950/70 border border-amber-800/80 hover:bg-amber-900 text-amber-300'
                                : 'bg-emerald-950/70 border border-emerald-800/80 hover:bg-emerald-900 text-emerald-300'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmUser(u)}
                            title="Delete User Permanently"
                            className="p-1.5 rounded-lg bg-rose-950/70 border border-rose-800/80 hover:bg-rose-900 text-rose-300 hover:text-white cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================================== */}
      {/* DRAWER: VIEW USER DETAILS & ACTIVITY LOG */}
      {/* =================================================================== */}
      {isDetailsOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl h-full bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                  {selectedUser.user.name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{selectedUser.user.name}</h3>
                  <p className="text-slate-400 font-mono text-xs">{selectedUser.user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions in Drawer */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleOpenEdit(selectedUser.user);
                }}
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Profile & Password</span>
              </button>
              {selectedUser.user.role !== 'SUPER_ADMIN' && (
                <button
                  type="button"
                  onClick={() => setDeleteConfirmUser(selectedUser.user)}
                  className="px-3 py-2 rounded-xl bg-rose-950 border border-rose-800 hover:bg-rose-900 text-rose-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </div>

            {/* User Meta Card */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-mono">Assigned Role</span>
                <p className="font-bold text-white">{selectedUser.user.role}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-mono">Account Status</span>
                <p className="font-bold text-white">{selectedUser.user.status}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-mono">Email Verified</span>
                <p className="font-bold text-white">{selectedUser.user.emailVerified ? 'Yes' : 'Pending'}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-mono">Two-Factor Auth</span>
                <p className="font-bold text-white">{selectedUser.user.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>

            {/* Profile Info */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Profile & Contact</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Company:</span>
                  <span className="font-bold text-white">{selectedUser.profile?.company || 'None'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-bold text-white">{selectedUser.profile?.phone || 'Not provided'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Country:</span>
                  <span className="font-bold text-white">{selectedUser.profile?.country || 'Global'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Timezone:</span>
                  <span className="font-mono text-white">{selectedUser.profile?.timezone || 'UTC'}</span>
                </div>
              </div>
            </div>

            {/* Activity Logs */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Account Activity</h4>
              <div className="space-y-2">
                {(selectedUser.activity || []).map((act: any) => (
                  <div key={act.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-mono">{act.action}</span>
                      <span className="text-slate-500 font-mono text-[10px]">
                        {new Date(act.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {act.ipAddress && (
                      <p className="text-slate-400 font-mono text-[10px]">IP: {act.ipAddress}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: EDIT USER & ROLE DETAILS & PASSWORD */}
      {/* =================================================================== */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Edit User Details, Role & Password</h3>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 uppercase font-mono text-[10px]">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 uppercase font-mono text-[10px]">Email Address</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              {/* Password Reset Field */}
              <div className="space-y-1 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <label className="text-amber-400 uppercase font-mono text-[10px] flex items-center gap-1">
                  <KeyRound className="w-3 h-3" />
                  <span>Set New Password (Leave empty to keep current)</span>
                </label>
                <input
                  type="password"
                  placeholder="Min 6 characters to reset password..."
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase font-mono text-[10px]">System Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  >
                    <option value="USER">Normal User</option>
                    <option value="SUPPORT">Support Staff</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 uppercase font-mono text-[10px]">Account Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="PENDING_VERIFICATION">Pending Verification</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase font-mono text-[10px]">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 uppercase font-mono text-[10px]">Country</label>
                  <input
                    type="text"
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: ADD NEW USER */}
      {/* =================================================================== */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Create New User Account</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 uppercase font-mono text-[10px]">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 uppercase font-mono text-[10px]">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. user@quickpostly.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 uppercase font-mono text-[10px]">Temporary Password *</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters..."
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase font-mono text-[10px]">System Role</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  >
                    <option value="USER">Normal User</option>
                    <option value="SUPPORT">Support Staff</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 uppercase font-mono text-[10px]">Account Status</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="ACTIVE">Active (Verified)</option>
                    <option value="PENDING_VERIFICATION">Pending Verification</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase font-mono text-[10px]">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 uppercase font-mono text-[10px]">Country</label>
                  <input
                    type="text"
                    placeholder="e.g. United States"
                    value={createForm.country}
                    onChange={(e) => setCreateForm({ ...createForm, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* =================================================================== */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-rose-900/60 p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-900 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-extrabold text-white text-lg">Permanently Delete User?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-white">{deleteConfirmUser.name}</span> (<span className="font-mono text-indigo-400">{deleteConfirmUser.email}</span>)?
                <br /><br />
                This will permanently remove their account, profile data, workspace associations, and active login sessions. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(deleteConfirmUser)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 cursor-pointer"
              >
                Yes, Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
