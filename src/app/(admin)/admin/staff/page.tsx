'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Users,
  UserCheck,
  UserX,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit,
  Trash2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  FileText,
  Headphones,
  Crown,
  Lock,
  Building,
  Phone,
  Mail,
  Calendar,
  Eye,
  X,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_MANAGER' | 'SUPPORT';
  status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED';
  department: string;
  phone: string | null;
  country: string | null;
  timezone: string;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  permissions: string[];
}

interface StaffStats {
  totalStaff: number;
  superAdmins: number;
  admins: number;
  contentManagers: number;
  support: number;
  active: number;
  suspended: number;
}

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [stats, setStats] = useState<StaffStats>({
    totalStaff: 0,
    superAdmins: 0,
    admins: 0,
    contentManagers: 0,
    support: 0,
    active: 0,
    suspended: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [deleteConfirmStaff, setDeleteConfirmStaff] = useState<StaffMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    role: 'ADMIN' as 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_MANAGER' | 'SUPPORT',
    department: 'Platform Operations',
    phone: '',
    status: 'ACTIVE' as 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED',
    password: '',
  });

  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    email: '',
    role: 'ADMIN' as 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_MANAGER' | 'SUPPORT',
    department: '',
    phone: '',
    status: 'ACTIVE' as 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED',
    password: '',
  });

  useEffect(() => {
    fetchStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, statusFilter]);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter !== 'ALL') params.set('role', roleFilter);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);

      const res = await fetch(`/api/v1/admin/staff?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setStaffList(json.data.staff || []);
        if (json.data.stats) {
          setStats(json.data.stats);
        }
      } else {
        showFeedback('Failed to load staff accounts', true);
      }
    } catch {
      showFeedback('Network error while loading staff', true);
    } finally {
      setIsLoading(false);
    }
  };

  const showFeedback = (text: string, isError = false) => {
    setFeedback({ text, isError });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStaff();
  };

  // Generate strong random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let pwd = '';
    for (let i = 0; i < 14; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  };

  // Open Add Staff Modal
  const handleOpenCreate = () => {
    setCreateForm({
      name: '',
      email: '',
      role: 'ADMIN',
      department: 'Platform Operations',
      phone: '',
      status: 'ACTIVE',
      password: generatePassword(),
    });
    setIsCreateOpen(true);
  };

  // Submit Add Staff
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });

      const json = await res.json();
      if (!res.ok) {
        showFeedback(json.error?.message || 'Failed to create staff member', true);
        return;
      }

      showFeedback(`Staff member "${createForm.name}" created successfully!`);
      setIsCreateOpen(false);
      fetchStaff();
    } catch {
      showFeedback('Unexpected error while creating staff member', true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (staff: StaffMember) => {
    setEditForm({
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      department: staff.department || 'Platform Operations',
      phone: staff.phone || '',
      status: staff.status,
      password: '',
    });
    setIsEditOpen(true);
  };

  // Submit Edit Staff
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = { ...editForm };
      if (!payload.password) {
        delete payload.password; // Do not overwrite password if blank
      }

      const res = await fetch(`/api/v1/admin/staff/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        showFeedback(json.error?.message || 'Failed to update staff member', true);
        return;
      }

      showFeedback(`Staff member "${editForm.name}" updated successfully.`);
      setIsEditOpen(false);
      fetchStaff();
    } catch {
      showFeedback('Unexpected error updating staff member', true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick toggle status (Active / Suspended)
  const handleToggleStatus = async (staff: StaffMember) => {
    if (staff.id === 'usr_superadmin_01') {
      showFeedback('Root Super Admin status cannot be altered.', true);
      return;
    }

    const nextStatus = staff.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/v1/admin/staff/${staff.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        showFeedback(`Staff member set to ${nextStatus}.`);
        fetchStaff();
      } else {
        const json = await res.json();
        showFeedback(json.error?.message || 'Failed to change status', true);
      }
    } catch {
      showFeedback('Network error updating status', true);
    }
  };

  // Delete Staff
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmStaff) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/admin/staff/${deleteConfirmStaff.id}`, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (!res.ok) {
        showFeedback(json.error?.message || 'Failed to delete staff member', true);
        return;
      }

      showFeedback(`Staff account "${deleteConfirmStaff.name}" deleted permanently.`);
      setDeleteConfirmStaff(null);
      fetchStaff();
    } catch {
      showFeedback('Network error deleting staff account', true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: StaffMember['role']) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <Crown className="w-3.5 h-3.5 text-purple-400" />
            Super Admin
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            Admin
          </span>
        );
      case 'CONTENT_MANAGER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            Content Manager
          </span>
        );
      case 'SUPPORT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Headphones className="w-3.5 h-3.5 text-amber-400" />
            Support Staff
          </span>
        );
      default:
        return <Badge variant="slate">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all ${
            feedback.isError
              ? 'bg-rose-950/90 text-rose-200 border-rose-800'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
          }`}
        >
          {feedback.isError ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Staff &amp; Team Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Assign platform administrative roles, departments, permissions, and security controls.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsPermissionsOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-all cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span>Roles &amp; Permissions</span>
          </button>

          <button
            type="button"
            onClick={fetchStaff}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all cursor-pointer"
            title="Refresh staff list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-600/25 transition-all hover:scale-102 active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Staff</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{stats.totalStaff}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {stats.active} Active Members
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Super Admins &amp; Admins</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{stats.superAdmins + stats.admins}</div>
          <div className="text-[11px] text-slate-400">
            {stats.superAdmins} Super, {stats.admins} Admins
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Content Managers</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{stats.contentManagers}</div>
          <div className="text-[11px] text-slate-400">CMS, Blog &amp; Pages</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Support Executives</span>
            <Headphones className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{stats.support}</div>
          <div className="text-[11px] text-slate-400">Tickets &amp; Moderation</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff by name, email, department, or role..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </form>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Role:</span>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="CONTENT_MANAGER">Content Manager</option>
            <option value="SUPPORT">Support Staff</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING_VERIFICATION">Pending</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-400" />
            <p className="text-xs text-slate-400">Loading platform staff members...</p>
          </div>
        ) : staffList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShieldCheck className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-white">No staff members found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No staff records matched your query or filters. Click &quot;Add Staff Member&quot; to invite a new team member.
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Staff Member</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-mono">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role &amp; Department</th>
                  <th className="py-3 px-4">Permissions Scope</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Staff Member */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {staff.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{staff.name}</span>
                            {staff.id === 'usr_superadmin_01' && (
                              <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                                Primary Owner
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-500" />
                            <span>{staff.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role & Department */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div>{getRoleBadge(staff.role)}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-500" />
                          <span>{staff.department}</span>
                        </div>
                      </div>
                    </td>

                    {/* Permissions Scope */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {staff.permissions.map((perm, i) => (
                          <span
                            key={i}
                            className="inline-block px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700/60"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {staff.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Active
                        </span>
                      ) : staff.status === 'SUSPENDED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Last Login */}
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {staff.lastLoginAt ? (
                        <span>{new Date(staff.lastLoginAt).toLocaleDateString()}</span>
                      ) : (
                        <span className="text-slate-600">Never</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(staff)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Edit Staff Member"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {staff.id !== 'usr_superadmin_01' && (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(staff)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              staff.status === 'ACTIVE'
                                ? 'text-amber-400 hover:bg-amber-400/10'
                                : 'text-emerald-400 hover:bg-emerald-400/10'
                            }`}
                            title={staff.status === 'ACTIVE' ? 'Suspend Staff' : 'Activate Staff'}
                          >
                            {staff.status === 'ACTIVE' ? (
                              <UserX className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        {staff.id !== 'usr_superadmin_01' && (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmStaff(staff)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition-colors"
                            title="Delete Staff Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE STAFF MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Platform Staff Member"
        description="Invite or provision a team member with administrative privileges."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Full Name *</label>
              <input
                type="text"
                required
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="e.g. Rachel Adams"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Work Email *</label>
              <input
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="rachel@quickpostly.com"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Staff Role &amp; Access Tier *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div
                onClick={() => setCreateForm({ ...createForm, role: 'SUPER_ADMIN' })}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  createForm.role === 'SUPER_ADMIN'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-purple-300">
                  <Crown className="w-3.5 h-3.5 text-purple-400" />
                  <span>Super Admin</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Full root platform access, user deletion, payment gateway &amp; security keys.
                </p>
              </div>

              <div
                onClick={() => setCreateForm({ ...createForm, role: 'ADMIN' })}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  createForm.role === 'ADMIN'
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-indigo-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Platform Admin</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  User management, plans, subscriptions, AI providers &amp; platform settings.
                </p>
              </div>

              <div
                onClick={() => setCreateForm({ ...createForm, role: 'CONTENT_MANAGER' })}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  createForm.role === 'CONTENT_MANAGER'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-300">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Content Manager</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Website Builder, Homepage CMS, Custom Pages, Blog articles &amp; Media.
                </p>
              </div>

              <div
                onClick={() => setCreateForm({ ...createForm, role: 'SUPPORT' })}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  createForm.role === 'SUPPORT'
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-amber-300">
                  <Headphones className="w-3.5 h-3.5 text-amber-400" />
                  <span>Support Staff</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Customer tickets, Social Inbox monitoring &amp; read-only account assistance.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Department / Title</label>
              <input
                type="text"
                value={createForm.department}
                onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                placeholder="e.g. Technical Operations"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Phone Number (Optional)</label>
              <input
                type="text"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Initial Password with Generator */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Temporary Password *</label>
              <button
                type="button"
                onClick={() => setCreateForm({ ...createForm, password: generatePassword() })}
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                <Sparkles className="w-3 h-3" />
                <span>Generate Strong</span>
              </button>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="Initial password for login"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Provide this temporary password to the staff member so they can log in to QuickPostly.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md shadow-purple-600/25 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Staff Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT STAFF MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Staff Member"
        description="Update staff profile, administrative designation, or reset password."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Full Name *</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Work Email *</label>
              <input
                type="email"
                required
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Role</label>
              <select
                value={editForm.role}
                disabled={editForm.id === 'usr_superadmin_01'}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Platform Admin</option>
                <option value="CONTENT_MANAGER">Content Manager</option>
                <option value="SUPPORT">Support Staff</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Status</label>
              <select
                value={editForm.status}
                disabled={editForm.id === 'usr_superadmin_01'}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
              >
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="PENDING_VERIFICATION">Pending Verification</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Department</label>
              <input
                type="text"
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                placeholder="e.g. Platform Operations"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Phone Number</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Reset Password */}
          <div className="space-y-1 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Reset Staff Password</label>
              <button
                type="button"
                onClick={() => setEditForm({ ...editForm, password: generatePassword() })}
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                <Sparkles className="w-3 h-3" />
                <span>Generate Strong</span>
              </button>
            </div>
            <input
              type="text"
              value={editForm.password}
              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              placeholder="Leave blank to preserve current password"
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
            />
            <p className="text-[10px] text-slate-500">
              Only enter a value if you wish to overwrite this staff member&apos;s current password.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md shadow-purple-600/25 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* PERMISSIONS MATRIX MODAL */}
      <Modal
        isOpen={isPermissionsOpen}
        onClose={() => setIsPermissionsOpen(false)}
        title="Staff Roles & Permissions Matrix"
        description="Granular overview of platform module access per staff designation."
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-mono text-slate-400">
                <tr>
                  <th className="p-2.5">Platform Module</th>
                  <th className="p-2.5 text-center text-purple-400">Super</th>
                  <th className="p-2.5 text-center text-indigo-400">Admin</th>
                  <th className="p-2.5 text-center text-emerald-400">Content</th>
                  <th className="p-2.5 text-center text-amber-400">Support</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="p-2.5 font-medium">Admin Dashboard &amp; Analytics</td>
                  <td className="p-2.5 text-center text-emerald-400">✓ Full</td>
                  <td className="p-2.5 text-center text-emerald-400">✓ Full</td>
                  <td className="p-2.5 text-center text-slate-500">—</td>
                  <td className="p-2.5 text-center text-slate-500">—</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">User Management (Create, Edit, Delete)</td>
                  <td className="p-2.5 text-center text-emerald-400">✓ Full</td>
                  <td className="p-2.5 text-center text-emerald-400">✓ Full</td>
                  <td className="p-2.5 text-center text-slate-500">—</td>
                  <td className="p-2.5 text-center text-amber-400">View Only</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Staff &amp; Role Management</td>
                  <td className="p-2.5 text-center text-emerald-400">✓ Full</td>
                  <td className="p-2.5 text-center text-indigo-400">✓ Non-Super</td>
                  <td className="p-2.5 text-center text-slate-500">—</td>
                  <td className="p-2.5 text-center text-slate-500">—</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Plans, Pricing &amp; Subscriptions</td>
                  <td className="p-2.5 text-center text-emerald-400">✓ Full</td>
                  <td className="p-2.5 text-center text-emerald-400">✓ Full</td>
                  <td className="p-2.5 text-center text-slate-500">—</td>
                  <td className="p-2.5 text-center text-slate-500">—</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Payment Gateways &amp; Webhooks</td>
                  <td className="p-2.5 text-center text-emerald-400">✓ Full</td>
                  <td className="p-2.5 text-center text-emerald-400">✓ Full</td>
                  <td className="p-2.5 text-center text-slate-500">—</td>
                  <td className="p-2.5 text-center text-slate-500">—</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">AI Providers &amp; Routing Rules</td>
                  <td className="p-2.5 text-center text-emerald-400">✓ Full</td>
                  <td className="p-2.5 text-center text-emerald-400">✓ Full</td>
                  <td className="p-2.5 text-center text-slate-500">—</td>
                  <td className="p-2.5 text-center text-slate-500">—</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Website Builder &amp; Homepage CMS</td>
                  <td className="p-2.5 text-center text-emerald-400">✓ Full</td>
                  <td className="p-2.5 text-center text-emerald-400">✓ Full</td>
                  <td className="p-2.5 text-center text-emerald-400">✓ Full</td>
                  <td className="p-2.5 text-center text-slate-500">—</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Custom Pages (Privacy, Terms, About)</td>
                  <td className="p-2.5 text-center text-emerald-400">✓ Full</td>
                  <td className="p-2.5 text-center text-emerald-400">✓ Full</td>
                  <td className="p-2.5 text-center text-emerald-400">✓ Full</td>
                  <td className="p-2.5 text-center text-slate-500">—</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Customer Support &amp; Social Inbox</td>
                  <td className="p-2.5 text-center text-emerald-400">✓ Full</td>
                  <td className="p-2.5 text-center text-emerald-400">✓ Full</td>
                  <td className="p-2.5 text-center text-slate-500">—</td>
                  <td className="p-2.5 text-center text-emerald-400">✓ Full</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Security Settings &amp; Audit Logs</td>
                  <td className="p-2.5 text-center text-emerald-400">✓ Full</td>
                  <td className="p-2.5 text-center text-indigo-400">View Logs</td>
                  <td className="p-2.5 text-center text-slate-500">—</td>
                  <td className="p-2.5 text-center text-slate-500">—</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setIsPermissionsOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            >
              Close Overview
            </button>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deleteConfirmStaff}
        onClose={() => setDeleteConfirmStaff(null)}
        title="Revoke Staff Access"
        description="Permanently delete this staff member's administrative account."
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">This action cannot be undone.</p>
              <p className="mt-1 text-rose-300/90">
                Staff account for <span className="font-mono font-bold text-white">{deleteConfirmStaff?.name}</span> ({deleteConfirmStaff?.email}) will be permanently deleted and all administrative sessions revoked immediately.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setDeleteConfirmStaff(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleDeleteConfirm}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shadow-rose-600/25 disabled:opacity-50"
            >
              {isSubmitting ? 'Deleting...' : 'Permanently Delete Staff'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
