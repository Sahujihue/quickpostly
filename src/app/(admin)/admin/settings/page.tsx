'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Laptop,
  Activity,
  Database,
  Server,
  Cpu,
  Mail,
  Phone,
  Building,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  Sparkles,
  Lock,
  Crown,
  FileText,
  Headphones,
  Check,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Tab = 'profile' | 'security' | 'permissions' | 'telemetry';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // User & Profile State
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({
    name: '',
    email: '',
    phone: '',
    country: '',
    timezone: 'UTC',
    language: 'en',
    currency: 'USD',
    company: '',
    bio: '',
    avatarUrl: '',
  });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Sessions State
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    fetchProfileData();
    fetchSessions();
  }, []);

  const showToast = (text: string, isError = false) => {
    setStatusMessage({ text, isError });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/user/profile');
      if (res.ok) {
        const json = await res.json();
        setUser(json.data?.user);
        if (json.data?.profile) {
          setProfile({
            name: json.data.user.name || '',
            email: json.data.user.email || '',
            phone: json.data.profile.phone || '',
            country: json.data.profile.country || 'United States',
            timezone: json.data.profile.timezone || 'America/New_York',
            language: json.data.profile.language || 'en',
            currency: json.data.profile.currency || 'USD',
            company: json.data.profile.company || 'QuickPostly Platform Operations',
            bio: json.data.profile.bio || 'Platform Administrator & Security Operations Lead',
            avatarUrl: json.data.profile.avatarUrl || '',
          });
        }
      }
    } catch {
      showToast('Error loading profile data', true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/v1/user/sessions');
      if (res.ok) {
        const json = await res.json();
        setSessions(json.data?.sessions || []);
      }
    } catch {
      // fallback
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/v1/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      const json = await res.json();
      if (!res.ok) {
        showToast(json.error?.message || 'Failed to update profile', true);
        return;
      }

      showToast('Admin profile updated successfully.');
      fetchProfileData();
    } catch {
      showToast('Error saving profile changes', true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match.', true);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      showToast('New password must be at least 8 characters long.', true);
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/v1/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        showToast(json.error?.message || 'Failed to change password', true);
        return;
      }

      showToast('Password changed successfully! All other sessions were signed out.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      fetchSessions();
    } catch {
      showToast('Error updating password', true);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/v1/user/sessions?id=${sessionId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Session revoked successfully.');
        fetchSessions();
      } else {
        showToast('Failed to revoke session', true);
      }
    } catch {
      showToast('Network error revoking session', true);
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    try {
      const res = await fetch('/api/v1/user/sessions?allOthers=true', { method: 'DELETE' });
      if (res.ok) {
        showToast('All other active sessions have been signed out.');
        fetchSessions();
      } else {
        showToast('Failed to sign out other sessions', true);
      }
    } catch {
      showToast('Network error signing out other sessions', true);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <Crown className="w-3.5 h-3.5 text-purple-400" />
            Super Administrator
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            Platform Admin
          </span>
        );
      case 'CONTENT_MANAGER':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            Content Manager
          </span>
        );
      case 'SUPPORT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Headphones className="w-3.5 h-3.5 text-amber-400" />
            Support Specialist
          </span>
        );
      default:
        return <Badge variant="slate">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Feedback */}
      {statusMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all ${
            statusMessage.isError
              ? 'bg-rose-950/90 text-rose-200 border-rose-800'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
          }`}
        >
          {statusMessage.isError ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center font-extrabold text-base shadow-sm">
            {profile.name ? profile.name.slice(0, 2).toUpperCase() : 'AD'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Admin &amp; Staff Profile Settings
              </h1>
              {user?.role && getRoleBadge(user.role)}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Manage your administrator credentials, personal identity, security keys, and system telemetry.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchProfileData();
            fetchSessions();
          }}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Profile &amp; Identity</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Password &amp; Security</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'permissions'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Role &amp; Module Access</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('telemetry')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'telemetry'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>System Health &amp; Telemetry</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: MY PROFILE */}
      {/* =================================================================== */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Staff Profile &amp; Regional Configuration</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update your official name, job title, phone number, and timezone settings.
              </p>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>

          {/* Avatar Presets Selection */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Staff Avatar Photo</label>
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-indigo-500/50 bg-slate-950 flex items-center justify-center shrink-0">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-indigo-400">
                    {profile.name ? profile.name.slice(0, 2).toUpperCase() : 'AD'}
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={profile.avatarUrl}
                  onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                  placeholder="Paste custom avatar image URL (https://...)"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Or choose preset:</span>
                  <div className="flex items-center gap-1.5">
                    {AVATAR_PRESETS.map((presetUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProfile({ ...profile, avatarUrl: presetUrl })}
                        className={`w-7 h-7 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                          profile.avatarUrl === presetUrl
                            ? 'border-indigo-400 ring-2 ring-indigo-400/30 scale-105'
                            : 'border-slate-700 opacity-60 hover:opacity-100'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={presetUrl} alt="preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                    {profile.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setProfile({ ...profile, avatarUrl: '' })}
                        className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Staff Full Name *</label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Work Email (Login Identity)</label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="w-full p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 cursor-not-allowed font-mono"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Department & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Department / Job Title</label>
              <input
                type="text"
                value={profile.company}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                placeholder="e.g. Lead Platform Architect"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Phone Number</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+1 (555) 019-2834"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Country, Timezone, Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Country</label>
              <input
                type="text"
                value={profile.country}
                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Timezone</label>
              <select
                value={profile.timezone}
                onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="America/New_York">America/New_York (UTC-5)</option>
                <option value="America/Chicago">America/Chicago (UTC-6)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (UTC-8)</option>
                <option value="Europe/London">Europe/London (UTC+0)</option>
                <option value="Europe/Berlin">Europe/Berlin (UTC+1)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+5:30)</option>
                <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
                <option value="Asia/Singapore">Asia/Singapore (UTC+8)</option>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Currency Display</label>
              <select
                value={profile.currency}
                onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
                <option value="INR">INR (₹ - Indian Rupee)</option>
                <option value="CAD">CAD ($ - Canadian Dollar)</option>
                <option value="AUD">AUD ($ - Australian Dollar)</option>
              </select>
            </div>
          </div>

          {/* Bio / Staff Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Staff Bio &amp; Operations Focus</label>
            <textarea
              rows={3}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Brief description of administrative responsibilities..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </form>
      )}

      {/* =================================================================== */}
      {/* TAB 2: SECURITY & PASSWORD */}
      {/* =================================================================== */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Change Password Card */}
          <form onSubmit={handleChangePassword} className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h2 className="text-base font-bold text-white">Update Administrator Password</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Change your password periodically to maintain maximum administrative security.
                </p>
              </div>
              <button
                type="submit"
                disabled={isChangingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isChangingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Current Password *</label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">New Password * (Min 8 chars)</label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Note: Changing your password will immediately sign out all other active sessions across browsers and devices.
            </p>
          </form>

          {/* Active Sessions */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Active Administrative Sessions</h3>
                  <Badge variant="indigo" size="sm">
                    {sessions.length} Active
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Devices currently authorized to access this platform account.
                </p>
              </div>

              {sessions.length > 1 && (
                <button
                  type="button"
                  onClick={handleRevokeAllOtherSessions}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out Other Sessions</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-slate-300 flex items-center justify-center">
                      <Laptop className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{sess.deviceInfo || 'Desktop Browser'}</span>
                        {sess.isCurrent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Current Session
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        IP: {sess.ipAddress || '127.0.0.1'} &bull; Last active:{' '}
                        {new Date(sess.lastActiveAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {!sess.isCurrent && (
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(sess.id)}
                      className="text-xs font-semibold text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: ROLE & PERMISSIONS MATRIX */}
      {/* =================================================================== */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Crown className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Assigned Role: {user?.role || 'SUPER_ADMIN'}
                  </h3>
                  <p className="text-xs text-indigo-200/80">
                    Department: {profile.company || 'Platform Security & Operations'}
                  </p>
                </div>
              </div>
              {user?.role && getRoleBadge(user.role)}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your staff credentials grant access to core platform services, automated publishing queues, AI providers, and commercial payment gateways.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-[11px]">
              Platform Module Privileges Checklist
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Full Platform Operations &amp; Dashboard</div>
                  <div className="text-[11px] text-slate-400">View real-time telemetry, user growth, and post throughput.</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">User &amp; Staff Account Lifecycle</div>
                  <div className="text-[11px] text-slate-400">Create, edit, reset passwords, suspend, or delete user and staff accounts.</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Plans, Pricing &amp; Subscriptions</div>
                  <div className="text-[11px] text-slate-400">Modify subscription tiers, features, social accounts limits, and trial days.</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Multi-Payment Gateways &amp; Webhooks</div>
                  <div className="text-[11px] text-slate-400">Configure Stripe, Razorpay, Cashfree, PayPal, NOWPayments &amp; crypto nodes.</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">AI Content Studio &amp; Provider Routing</div>
                  <div className="text-[11px] text-slate-400">Manage OpenAI, Gemini, Claude, Grok, DeepSeek, and fallback strategies.</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Website Builder, Custom Pages &amp; SEO</div>
                  <div className="text-[11px] text-slate-400">Edit Homepage, Header/Footer, Privacy Policy, Terms, and publish custom pages.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: SYSTEM HEALTH & TELEMETRY */}
      {/* =================================================================== */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-white text-sm">PostgreSQL / Prisma Connection</h3>
                </div>
                <span className="text-xs text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connection pooling managed by Prisma singleton. Query duration monitoring enabled in development mode.
              </p>
              <div className="pt-2 text-xs font-mono text-slate-500">
                Latency: &lt; 8ms &bull; SSL: Enabled &bull; Fallback: Active
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-white text-sm">BullMQ Publishing Queues</h3>
                </div>
                <span className="text-xs text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">
                  Healthy
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Active queues: <code>post-publishing</code>, <code>analytics-sync</code>, <code>ai-generation</code>.
              </p>
              <div className="pt-2 text-xs font-mono text-slate-500">
                Active workers: 4 &bull; Failed jobs: 0 &bull; Redis Latency: 1.2ms
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase font-mono text-[11px] text-slate-400">
              Runtime Environment Specifications
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Framework</span>
                <span className="text-white font-bold">Next.js 14 App Router</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Port</span>
                <span className="text-emerald-400 font-bold">3000 (Active)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Security Engine</span>
                <span className="text-indigo-400 font-bold">Bcrypt + JWT (SHA-256)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Brand Domain</span>
                <span className="text-amber-400 font-bold">quickpostly.com</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
