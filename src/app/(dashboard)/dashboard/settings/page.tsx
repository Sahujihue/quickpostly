'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Key,
  Globe,
  Smartphone,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Copy,
  LogOut,
  Laptop,
  Check,
} from 'lucide-react';

type Tab = 'profile' | 'security' | 'sessions' | 'data' | 'billing';

const USER_AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
];

export default function UserSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isLoading, setIsLoading] = useState(true);
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

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // 2FA State
  const [twoFactorSetup, setTwoFactorSetup] = useState<{
    secret?: string;
    qrCodeDataUrl?: string;
    code?: string;
    recoveryCodes?: string[];
  } | null>(null);
  const [disablePassword, setDisablePassword] = useState('');

  // Sessions State
  const [sessions, setSessions] = useState<any[]>([]);

  // Account Deletion State
  const [deleteForm, setDeleteForm] = useState({
    password: '',
    confirmPhrase: '',
  });

  useEffect(() => {
    fetchProfileData();
    fetchSessions();
  }, []);

  const fetchProfileData = async () => {
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
            country: json.data.profile.country || '',
            timezone: json.data.profile.timezone || 'UTC',
            language: json.data.profile.language || 'en',
            currency: json.data.profile.currency || 'USD',
            company: json.data.profile.company || '',
            bio: json.data.profile.bio || '',
            avatarUrl: json.data.profile.avatarUrl || '',
          });
        }
      }
    } catch {
      // fallback
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

  const showFeedback = (text: string, isError = false) => {
    setStatusMessage({ text, isError });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // 1. Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const json = await res.json();
      if (!res.ok) {
        showFeedback(json.error?.message || 'Failed to update profile', true);
        return;
      }
      showFeedback('Profile updated successfully!');
      fetchProfileData();
    } catch {
      showFeedback('Network error updating profile', true);
    }
  };

  // 2. Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showFeedback("New passwords don't match", true);
      return;
    }
    try {
      const res = await fetch('/api/v1/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      });
      const json = await res.json();
      if (!res.ok) {
        showFeedback(json.error?.message || 'Password update failed', true);
        return;
      }
      showFeedback('Password changed successfully! All other sessions were signed out.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      fetchSessions();
    } catch {
      showFeedback('Network error changing password', true);
    }
  };

  // 3. Initiate 2FA Setup
  const handleStart2FASetup = async () => {
    try {
      const res = await fetch('/api/v1/auth/2fa/setup');
      const json = await res.json();
      if (res.ok) {
        setTwoFactorSetup({
          secret: json.data.secret,
          qrCodeDataUrl: json.data.qrCodeDataUrl,
          code: '',
        });
      }
    } catch {
      showFeedback('Failed to initialize 2FA', true);
    }
  };

  // 4. Confirm 2FA Code
  const handleConfirm2FA = async () => {
    if (!twoFactorSetup?.secret || !twoFactorSetup?.code) return;
    try {
      const res = await fetch('/api/v1/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: twoFactorSetup.code,
          secret: twoFactorSetup.secret,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        showFeedback(json.error?.message || 'Invalid code. Try again.', true);
        return;
      }
      setTwoFactorSetup({
        ...twoFactorSetup,
        recoveryCodes: json.data.recoveryCodes,
      });
      showFeedback('2FA successfully enabled!');
      fetchProfileData();
    } catch {
      showFeedback('Error verifying 2FA code', true);
    }
  };

  // 5. Disable 2FA
  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: disablePassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        showFeedback(json.error?.message || 'Incorrect password', true);
        return;
      }
      showFeedback('2FA has been disabled.');
      setDisablePassword('');
      fetchProfileData();
    } catch {
      showFeedback('Error disabling 2FA', true);
    }
  };

  // 6. Revoke Session
  const handleRevokeSession = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/user/sessions?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showFeedback('Session revoked.');
        fetchSessions();
      }
    } catch {
      showFeedback('Error revoking session', true);
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    try {
      const res = await fetch('/api/v1/user/sessions?allOthers=true', { method: 'DELETE' });
      if (res.ok) {
        showFeedback('All other active sessions have been signed out.');
        fetchSessions();
      }
    } catch {
      showFeedback('Error revoking other sessions', true);
    }
  };

  // 7. Delete Account
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/user/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deleteForm),
      });
      const json = await res.json();
      if (!res.ok) {
        showFeedback(json.error?.message || 'Account deletion failed', true);
        return;
      }
      alert('Your account has been deleted. You will now be redirected to the homepage.');
      window.location.href = '/';
    } catch {
      showFeedback('Error during account deletion', true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Account & Workspace Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your personal identity, security credentials, active sessions, and multi-channel preferences.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 transition-all ${
            statusMessage.isError
              ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300'
              : 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
          }`}
        >
          {statusMessage.isError ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span className="font-semibold">{statusMessage.text}</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'profile'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'security'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Security & 2FA</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'sessions'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>Manage Sessions ({sessions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'data'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Data & Danger Zone</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: PROFILE DETAILS */}
      {/* =================================================================== */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm max-w-4xl">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Personal Identity & Regional Settings</h2>
              <p className="text-xs text-slate-500">Configure your name, avatar, timezone, and currency defaults.</p>
            </div>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-sm transition-all"
            >
              Save Profile Changes
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Full Name *
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Email Address (Primary Identity)
              </label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Country
              </label>
              <input
                type="text"
                placeholder="e.g. United States, Germany, India"
                value={profile.country}
                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Currency Preference
              </label>
              <select
                value={profile.currency}
                onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
              >
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
                <option value="CAD">CAD ($ - Canadian Dollar)</option>
                <option value="AUD">AUD ($ - Australian Dollar)</option>
                <option value="INR">INR (₹ - Indian Rupee)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Timezone (Used for Publishing Queues)
              </label>
              <select
                value={profile.timezone}
                onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">America/New_York (EST / EDT)</option>
                <option value="America/Chicago">America/Chicago (CST / CDT)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST / PDT)</option>
                <option value="Europe/London">Europe/London (GMT / BST)</option>
                <option value="Europe/Paris">Europe/Paris (CET / CEST)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Preferred Interface Language
              </label>
              <select
                value={profile.language}
                onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
              >
                <option value="en">English (US)</option>
                <option value="es">Español (Spanish)</option>
                <option value="de">Deutsch (German)</option>
                <option value="fr">Français (French)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Profile Avatar Photo
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-400 bg-slate-100 dark:bg-slate-950 flex items-center justify-center shrink-0">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-slate-700 dark:text-slate-200">
                    {profile.name ? profile.name.slice(0, 2).toUpperCase() : 'US'}
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="url"
                  placeholder="Paste avatar image URL (https://...)"
                  value={profile.avatarUrl}
                  onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm"
                />

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">Or pick preset:</span>
                  <div className="flex items-center gap-1.5">
                    {USER_AVATAR_PRESETS.map((presetUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProfile({ ...profile, avatarUrl: presetUrl })}
                        className={`w-7 h-7 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                          profile.avatarUrl === presetUrl
                            ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105'
                            : 'border-slate-300 dark:border-slate-700 opacity-60 hover:opacity-100'
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
                        className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-white px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* =================================================================== */}
      {/* TAB 2: SECURITY & TWO-FACTOR AUTH */}
      {/* =================================================================== */}
      {activeTab === 'security' && (
        <div className="space-y-6 max-w-4xl">
          {/* Change Password Form */}
          <form onSubmit={handleChangePassword} className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Key className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Change Account Password</h3>
                <p className="text-xs text-slate-500">Requires current password confirmation. Password is encrypted with bcrypt (12 rounds).</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Current Password *
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  New Password *
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Min 8 chars, 1 uppercase, 1 digit"
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Re-type new password"
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 font-bold text-xs transition-colors"
              >
                Update Password & Invalidate Other Sessions
              </button>
            </div>
          </form>

          {/* Two-Factor Authentication Section */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Two-Factor Authentication (TOTP)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add an extra layer of security using Google Authenticator, Authy, or 1Password.
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                  user?.twoFactorEnabled
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {user?.twoFactorEnabled ? '● 2FA Enabled' : '○ 2FA Inactive'}
              </span>
            </div>

            {user?.twoFactorEnabled ? (
              /* When 2FA is active: option to disable */
              <div className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Two-factor authentication is active. To disable it, confirm your current password:
                </p>
                <form onSubmit={handleDisable2FA} className="flex items-center gap-3 max-w-md">
                  <input
                    type="password"
                    placeholder="Enter current password to disable"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                  />
                  <button
                    type="submit"
                    disabled={!disablePassword}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs"
                  >
                    Disable 2FA
                  </button>
                </form>
              </div>
            ) : (
              /* When 2FA is not active */
              <div>
                {!twoFactorSetup ? (
                  <button
                    type="button"
                    onClick={handleStart2FASetup}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Setup Two-Factor Authenticator</span>
                  </button>
                ) : (
                  /* 2FA Setup Flow */
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-6">
                    {twoFactorSetup.recoveryCodes ? (
                      /* Recovery Codes Display */
                      <div className="space-y-4 text-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                          <Check className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          Save Your 2FA Backup Recovery Codes!
                        </h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          If you ever lose access to your mobile device, these single-use codes are the only way to recover your account:
                        </p>
                        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs text-slate-800 dark:text-slate-200">
                          {twoFactorSetup.recoveryCodes.map((c, i) => (
                            <span key={i} className="p-1 rounded bg-slate-100 dark:bg-slate-800">
                              {c}
                            </span>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setTwoFactorSetup(null)}
                          className="px-6 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs"
                        >
                          I Have Safely Stored My Recovery Codes
                        </button>
                      </div>
                    ) : (
                      /* QR Code Scan Step */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                        <div className="space-y-3">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            1. Scan QR Code in Authenticator App
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Open Google Authenticator or your preferred TOTP app and scan this barcode, or manually paste the secret key:
                          </p>
                          <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-amber-600 dark:text-amber-400 select-all break-all">
                            {twoFactorSetup.secret}
                          </div>
                        </div>

                        <div className="flex flex-col items-center space-y-4">
                          {twoFactorSetup.qrCodeDataUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={twoFactorSetup.qrCodeDataUrl}
                              alt="2FA QR Code"
                              className="w-40 h-40 rounded-xl border border-slate-300 dark:border-slate-700 bg-white p-2"
                            />
                          )}
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="000000"
                              value={twoFactorSetup.code || ''}
                              onChange={(e) =>
                                setTwoFactorSetup({ ...twoFactorSetup, code: e.target.value.trim() })
                              }
                              className="w-32 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-center font-mono text-base tracking-widest"
                            />
                            <button
                              type="button"
                              onClick={handleConfirm2FA}
                              disabled={(twoFactorSetup.code?.length || 0) < 6}
                              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold text-xs"
                            >
                              Verify & Enable
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: MANAGE SESSIONS */}
      {/* =================================================================== */}
      {activeTab === 'sessions' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Device Sessions</h2>
              <p className="text-xs text-slate-500">
                You are currently signed in on {sessions.length} devices. Invalidate any suspicious session instantly.
              </p>
            </div>
            {sessions.length > 1 && (
              <button
                type="button"
                onClick={handleRevokeAllOtherSessions}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm transition-colors"
              >
                Sign Out All Other Devices
              </button>
            )}
          </div>

          <div className="space-y-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{s.deviceInfo}</span>
                      {s.isCurrent && (
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          Current Session
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-[11px] font-mono">
                      IP: {s.ipAddress} &bull; Started {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {!s.isCurrent && (
                  <button
                    type="button"
                    onClick={() => handleRevokeSession(s.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-semibold text-[11px] transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Revoke Access</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: DATA EXPORT & ACCOUNT DELETION */}
      {/* =================================================================== */}
      {activeTab === 'data' && (
        <div className="space-y-6 max-w-4xl">
          {/* Data Portability Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-indigo-500" />
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Export Personal Data (GDPR Art. 20)</h3>
                <p className="text-xs text-slate-500">
                  Download a machine-readable JSON archive of your personal profile, audit history, and active sessions.
                </p>
              </div>
            </div>
            <div className="pt-2">
              <a
                href="/api/v1/user/export-data"
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 font-bold text-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Personal Data Archive (.json)</span>
              </a>
            </div>
          </div>

          {/* Danger Zone: Account Deletion */}
          <div className="p-6 sm:p-8 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-5">
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <div>
                <h3 className="font-bold text-sm text-rose-700 dark:text-rose-300">Danger Zone: Permanent Account Deletion</h3>
                <p className="text-xs text-rose-600/80 dark:text-rose-400/80">
                  Once deleted, your account credentials, scheduled posts, and profile history cannot be recovered.
                </p>
              </div>
            </div>

            <form onSubmit={handleDeleteAccount} className="space-y-4 max-w-md">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={deleteForm.password}
                  onChange={(e) => setDeleteForm({ ...deleteForm, password: e.target.value })}
                  placeholder="Your current password"
                  className="w-full px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Type <span className="font-mono text-rose-600 font-bold">DELETE MY ACCOUNT</span> to confirm *
                </label>
                <input
                  type="text"
                  value={deleteForm.confirmPhrase}
                  onChange={(e) => setDeleteForm({ ...deleteForm, confirmPhrase: e.target.value })}
                  placeholder="DELETE MY ACCOUNT"
                  className="w-full px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={!deleteForm.password || deleteForm.confirmPhrase !== 'DELETE MY ACCOUNT'}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs transition-colors"
              >
                Permanently Delete Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
