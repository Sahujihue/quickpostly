'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Save, Loader2, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CmsSecuritySettingRecord } from '@/lib/cms/repository';

export default function AdminSecuritySettingsPage() {
  const [security, setSecurity] = useState<CmsSecuritySettingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchSecurity = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/cms/security');
      const data = await res.json();
      if (data.success) {
        setSecurity(data.data);
      }
    } catch {
      setMessage({ text: 'Failed to load security policies', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurity();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!security) return;

    setSaving(true);
    try {
      const res = await fetch('/api/v1/admin/cms/security', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(security),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Platform security policies updated and enforced', type: 'success' });
      }
    } catch {
      setMessage({ text: 'Error saving security policies', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading security policies...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Lock className="w-6 h-6 text-indigo-500" />
          <span>Platform Security, Auth & Access Rules</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure brute-force lockout thresholds, 2FA enforcement, IP address filters, and maintenance modes.
        </p>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl text-xs font-medium ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
          }`}
        >
          {message.text}
        </div>
      )}

      {security && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Authentication & Lockout Policies */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Brute-Force & Session Protection
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Max Login Failures (Lockout Threshold)
                </label>
                <input
                  type="number"
                  min="3"
                  max="20"
                  required
                  value={security.maxLoginAttempts}
                  onChange={(e) =>
                    setSecurity({ ...security, maxLoginAttempts: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Lockout Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  required
                  value={security.lockoutMinutes}
                  onChange={(e) =>
                    setSecurity({ ...security, lockoutMinutes: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Session Expiration (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="720"
                  required
                  value={security.sessionTimeoutHours}
                  onChange={(e) =>
                    setSecurity({ ...security, sessionTimeoutHours: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={security.enforce2FAForAdmin}
                  onChange={(e) =>
                    setSecurity({ ...security, enforce2FAForAdmin: e.target.checked })
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Mandate Two-Factor Authentication (2FA) for All Administrators</span>
              </label>
            </div>
          </div>

          {/* IP Filtering */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              IP Access Control
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Allowed Admin IPs (Whitelist - comma separated)
                </label>
                <textarea
                  rows={3}
                  value={security.allowedIps || ''}
                  onChange={(e) => setSecurity({ ...security, allowedIps: e.target.value })}
                  placeholder="e.g. 192.168.1.1, 10.0.0.1 (Leave empty to permit any IP)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Blocked IP Addresses (Blacklist - comma separated)
                </label>
                <textarea
                  rows={3}
                  value={security.blockedIps || ''}
                  onChange={(e) => setSecurity({ ...security, blockedIps: e.target.value })}
                  placeholder="e.g. 203.0.113.19, 198.51.100.4"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-rose-200 dark:border-rose-900/40 pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h2 className="text-base font-bold text-rose-950 dark:text-rose-200">
                  Global Maintenance Mode
                </h2>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-rose-600 dark:text-rose-400">
                <input
                  type="checkbox"
                  checked={security.maintenanceMode}
                  onChange={(e) =>
                    setSecurity({ ...security, maintenanceMode: e.target.checked })
                  }
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Enable Maintenance Mode</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Public Maintenance Notice Message
              </label>
              <textarea
                rows={2}
                value={security.maintenanceMessage || ''}
                onChange={(e) =>
                  setSecurity({ ...security, maintenanceMessage: e.target.value })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Enforce Security Policies</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
