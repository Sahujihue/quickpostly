'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Save, Loader2, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { CmsEmailSettingRecord } from '@/lib/cms/repository';

export default function AdminEmailSettingsPage() {
  const [email, setEmail] = useState<CmsEmailSettingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testRecipient, setTestRecipient] = useState('admin@quickpostly.com');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchEmailSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/cms/email');
      const data = await res.json();
      if (data.success) {
        setEmail(data.data);
      }
    } catch {
      setMessage({ text: 'Failed to load email settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSaving(true);
    try {
      const res = await fetch('/api/v1/admin/cms/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(email),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Email & SMTP settings saved successfully', type: 'success' });
      }
    } catch {
      setMessage({ text: 'Failed to update email settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    setTestSending(true);
    try {
      const res = await fetch('/api/v1/admin/cms/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail: testRecipient }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({
          text: `Test email sent: ${data.data.smtpResponse} (${data.data.recipient})`,
          type: 'success',
        });
      }
    } catch {
      setMessage({ text: 'Error dispatching test email', type: 'error' });
    } finally {
      setTestSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading SMTP and email delivery configurations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Mail className="w-6 h-6 text-indigo-500" />
          <span>Email & Transactional SMTP Dispatch</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure email gateways for user verification, password resets, client invite notices, and digest reports.
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

      {email && (
        <div className="space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Sender Details */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Sender Identity & Provider
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Provider
                  </label>
                  <select
                    value={email.provider}
                    onChange={(e) => setEmail({ ...email, provider: e.target.value as CmsEmailSettingRecord['provider'] })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="SMTP">Custom SMTP</option>
                    <option value="RESEND">Resend</option>
                    <option value="SENDGRID">SendGrid</option>
                    <option value="POSTMARK">Postmark</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    From Sender Name
                  </label>
                  <input
                    type="text"
                    required
                    value={email.fromName}
                    onChange={(e) => setEmail({ ...email, fromName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    From Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email.fromEmail}
                    onChange={(e) => setEmail({ ...email, fromEmail: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reply-To Email Address
                </label>
                <input
                  type="email"
                  value={email.replyToEmail || ''}
                  onChange={(e) => setEmail({ ...email, replyToEmail: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* SMTP Server Configuration */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                SMTP Server Credentials
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    required
                    value={email.smtpHost}
                    onChange={(e) => setEmail({ ...email, smtpHost: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    required
                    value={email.smtpPort}
                    onChange={(e) => setEmail({ ...email, smtpPort: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    SMTP Username / API Key
                  </label>
                  <input
                    type="text"
                    value={email.smtpUser || ''}
                    onChange={(e) => setEmail({ ...email, smtpUser: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    SMTP Password / Secret
                  </label>
                  <input
                    type="password"
                    value={email.smtpPassword || ''}
                    onChange={(e) => setEmail({ ...email, smtpPassword: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={email.smtpSecure}
                    onChange={(e) => setEmail({ ...email, smtpSecure: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Enforce SSL / TLS Encryption</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Email Settings</span>
              </button>
            </div>
          </form>

          {/* Test Email Dispatch Box */}
          <div className="rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Dispatch Test Diagnostic Email
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Trigger a test message through the configured credentials to verify connection handshakes and deliverability.
            </p>

            <div className="flex gap-2 max-w-md pt-2">
              <input
                type="email"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="recipient@example.com"
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                disabled={testSending}
                onClick={handleSendTestEmail}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                {testSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send Test</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
