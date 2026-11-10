'use client';

import React, { useState, useEffect } from 'react';
import {
  Share2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Shield,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Zap,
  Info,
  Server,
  Lock,
  Search,
  Filter,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SocialPlatformConfigDTO, SocialPlatformId } from '@/modules/social/types';
import { SocialPlatformIcon } from '@/components/ui/social-icons';

export default function AdminIntegrationsPage() {
  const [platforms, setPlatforms] = useState<SocialPlatformConfigDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  
  // Local form state per platform: [id]: { clientId, clientSecret, scopes, isEnabled, appReviewStatus }
  const [formState, setFormState] = useState<Record<string, {
    clientId: string;
    clientSecret: string;
    scopes: string;
    isEnabled: boolean;
    appReviewStatus: 'APPROVED' | 'PENDING_REVIEW' | 'IN_DEVELOPMENT' | 'REJECTED';
  }>>({});

  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});
  const [testingId, setTestingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id?: string; message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/admin/social/platforms');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPlatforms(data.data);
        const forms: typeof formState = {};
        data.data.forEach((p: SocialPlatformConfigDTO) => {
          forms[p.id] = {
            clientId: p.clientId || '',
            clientSecret: p.clientSecret || '',
            scopes: (p.scopes || []).join(', '),
            isEnabled: p.isEnabled,
            appReviewStatus: p.appReviewStatus,
          };
        });
        setFormState(forms);
      }
    } catch (err) {
      console.error('Failed to load platform configs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePlatform = async (platformId: SocialPlatformId, currentState: boolean) => {
    const newState = !currentState;
    setFormState((prev) => ({
      ...prev,
      [platformId]: { ...prev[platformId], isEnabled: newState },
    }));

    try {
      const res = await fetch(`/api/v1/admin/social/platforms/${platformId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: newState }),
      });
      const data = await res.json();
      if (data.success) {
        setPlatforms((prev) =>
          prev.map((p) => (p.id === platformId ? { ...p, isEnabled: newState } : p))
        );
        showFeedback(platformId, `${data.data.name} is now ${newState ? 'Enabled' : 'Disabled'}.`, 'success');
      }
    } catch {
      showFeedback(platformId, 'Failed to toggle platform state', 'error');
    }
  };

  const handleSavePlatform = async (platformId: SocialPlatformId) => {
    const form = formState[platformId];
    if (!form) return;

    setSavingId(platformId);
    try {
      const scopesArray = form.scopes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch(`/api/v1/admin/social/platforms/${platformId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: form.clientId,
          clientSecret: form.clientSecret,
          scopes: scopesArray,
          isEnabled: form.isEnabled,
          appReviewStatus: form.appReviewStatus,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPlatforms((prev) =>
          prev.map((p) => (p.id === platformId ? data.data : p))
        );
        showFeedback(platformId, `Settings for ${data.data.name} saved successfully!`, 'success');
      } else {
        showFeedback(platformId, data.error?.message || 'Failed to save settings', 'error');
      }
    } catch {
      showFeedback(platformId, 'An error occurred while saving platform configuration', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const handleTestConnection = async (platformId: SocialPlatformId) => {
    setTestingId(platformId);
    try {
      const res = await fetch(`/api/v1/admin/social/platforms/${platformId}/test`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setPlatforms((prev) =>
          prev.map((p) =>
            p.id === platformId
              ? {
                  ...p,
                  connectionStatus: data.data.status,
                  latencyMs: data.data.latencyMs,
                  lastTestedAt: data.data.timestamp,
                }
              : p
          )
        );
        showFeedback(
          platformId,
          `Connection verified: ${data.data.latencyMs}ms response time.`,
          'success'
        );
      } else {
        showFeedback(platformId, data.error?.message || 'Connection test failed', 'error');
      }
    } catch {
      showFeedback(platformId, 'Failed to ping platform developer API', 'error');
    } finally {
      setTestingId(null);
    }
  };

  const handleTestAll = async () => {
    setTestingId('all');
    try {
      for (const p of platforms) {
        await fetch(`/api/v1/admin/social/platforms/${p.id}/test`, { method: 'POST' });
      }
      await fetchPlatforms();
      showFeedback(undefined, 'Completed health checks on all social API endpoints.', 'success');
    } finally {
      setTestingId(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const showFeedback = (id: string | undefined, message: string, type: 'success' | 'error') => {
    setFeedback({ id, message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const filteredPlatforms = platforms.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'enabled'
        ? p.isEnabled
        : !p.isEnabled;
    return matchesSearch && matchesStatus;
  });

  const activeCount = platforms.filter((p) => p.isEnabled).length;
  const approvedCount = platforms.filter((p) => p.appReviewStatus === 'APPROVED').length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Enterprise OAuth 2.0
            </span>
            <span className="text-xs text-slate-500 font-mono">Part 8 Multi-Platform Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Official Social Platform API Settings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure direct developer applications, Client IDs, API secrets, OAuth redirect URIs, and enterprise scopes for all 8 supported platforms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTestAll}
            disabled={testingId !== null}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${testingId === 'all' ? 'animate-spin' : ''}`} />
            <span>{testingId === 'all' ? 'Testing All Pings...' : 'Test All Platforms'}</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && !feedback.id && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Supported Platforms</span>
            <Share2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{platforms.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Instagram, TikTok, X, YouTube, etc.</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Active Integrations</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{activeCount} / {platforms.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Ready for client workspace OAuth</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>App Review Approved</span>
            <Shield className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">{approvedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Official platform production approvals</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Architecture</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-white">OAuth 2.0 PKCE</div>
          <div className="text-[11px] text-slate-500 mt-1">Strict zero-simulation policy</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/50 p-3 rounded-2xl border border-slate-800/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search platforms by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({platforms.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('enabled')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === 'enabled' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Enabled ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('disabled')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === 'disabled' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Disabled ({platforms.length - activeCount})
            </button>
          </div>
        </div>
      </div>

      {/* Platform Cards */}
      {isLoading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading social platform developer configurations...</p>
        </div>
      ) : filteredPlatforms.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl">
          <Share2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">No platforms found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filter options.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPlatforms.map((platform) => {
            const form = formState[platform.id] || {
              clientId: platform.clientId || '',
              clientSecret: platform.clientSecret || '',
              scopes: (platform.scopes || []).join(', '),
              isEnabled: platform.isEnabled,
              appReviewStatus: platform.appReviewStatus,
            };
            const isSecretVisible = !!visibleSecrets[platform.id];
            const isTesting = testingId === platform.id;
            const isSaving = savingId === platform.id;
            const meta = platform.meta;

            return (
              <div
                key={platform.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  platform.isEnabled
                    ? 'bg-slate-900/80 border-slate-800 shadow-md'
                    : 'bg-slate-900/30 border-slate-800/60 opacity-80'
                }`}
              >
                {/* Platform Card Header */}
                <div className="p-6 border-b border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <SocialPlatformIcon
                      platform={platform.id || platform.name}
                      size="lg"
                    />

                    <div>
                      <div className="flex items-center flex-wrap gap-2.5">
                        <h2 className="text-lg font-bold text-white">{platform.name}</h2>

                        {platform.connectionStatus === 'CONFIGURED' ? (
                          <Badge variant="emerald" size="sm">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            CONFIGURED
                          </Badge>
                        ) : platform.connectionStatus === 'ERROR' ? (
                          <Badge variant="rose" size="sm">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            ERROR
                          </Badge>
                        ) : (
                          <Badge variant="slate" size="sm">
                            NOT CONFIGURED
                          </Badge>
                        )}

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            form.appReviewStatus === 'APPROVED'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : form.appReviewStatus === 'PENDING_REVIEW'
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                              : form.appReviewStatus === 'IN_DEVELOPMENT'
                              ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          }`}
                        >
                          App Review: {form.appReviewStatus}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 flex-wrap">
                        {platform.latencyMs && (
                          <span className="flex items-center gap-1 font-mono text-emerald-400">
                            <Server className="w-3 h-3" />
                            Latency: {platform.latencyMs}ms
                          </span>
                        )}
                        {platform.lastTestedAt && (
                          <span className="text-slate-500">
                            Last checked: {new Date(platform.lastTestedAt).toLocaleTimeString()}
                          </span>
                        )}
                        {meta?.developerPortalUrl && (
                          <a
                            href={meta.developerPortalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium underline-offset-2 hover:underline ml-1"
                          >
                            <span>Developer Portal</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Enable / Disable Toggle Switch */}
                  <div className="flex items-center gap-3 self-end md:self-center">
                    <span className="text-xs font-semibold text-slate-400">
                      {form.isEnabled ? 'Active' : 'Disabled'}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.isEnabled}
                      onClick={() => handleTogglePlatform(platform.id, form.isEnabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        form.isEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          form.isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Important Platform Account Prerequisites Notice */}
                {meta?.accountPrerequisites && (
                  <div className="px-6 py-3 bg-amber-500/5 border-b border-amber-500/10 flex items-start gap-2.5 text-xs text-amber-200/90">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-300">Account Prerequisites: </span>
                      {meta.accountPrerequisites}
                    </div>
                  </div>
                )}

                {/* Platform Settings Form Body */}
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Client ID / App ID */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                        <span>App ID / Client ID</span>
                        <span className="text-[10px] text-slate-500 font-mono">CLIENT_ID</span>
                      </label>
                      <input
                        type="text"
                        value={form.clientId}
                        onChange={(e) =>
                          setFormState((prev) => ({
                            ...prev,
                            [platform.id]: { ...prev[platform.id], clientId: e.target.value },
                          }))
                        }
                        placeholder={`e.g. ${platform.id === 'instagram' || platform.id === 'facebook' ? '194820194829104' : `${platform.id}_client_id_live`}`}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-hidden focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    {/* Client Secret */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                        <span>App Secret / Client Secret</span>
                        <span className="text-[10px] text-slate-500 font-mono">CLIENT_SECRET</span>
                      </label>
                      <div className="relative">
                        <input
                          type={isSecretVisible ? 'text' : 'password'}
                          value={form.clientSecret}
                          onChange={(e) =>
                            setFormState((prev) => ({
                              ...prev,
                              [platform.id]: { ...prev[platform.id], clientSecret: e.target.value },
                            }))
                          }
                          placeholder="••••••••••••••••••••••••"
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-hidden focus:border-indigo-500 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setVisibleSecrets((prev) => ({ ...prev, [platform.id]: !isSecretVisible }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {isSecretVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* OAuth Redirect URI */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                        <span>OAuth 2.0 Redirect URI</span>
                        <span className="text-[10px] text-indigo-400 font-semibold">Copy to Developer Console</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={platform.redirectUri}
                          className="w-full pl-3.5 pr-20 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-hidden select-all"
                        />
                        <button
                          type="button"
                          onClick={() => copyToClipboard(platform.redirectUri, platform.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedId === platform.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* App Review Status Selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                        <span>Official App Review Status</span>
                        <span className="text-[10px] text-slate-500">Platform Portal Approval</span>
                      </label>
                      <select
                        value={form.appReviewStatus}
                        onChange={(e) =>
                          setFormState((prev) => ({
                            ...prev,
                            [platform.id]: {
                              ...prev[platform.id],
                              appReviewStatus: e.target.value as any,
                            },
                          }))
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-hidden focus:border-indigo-500 transition-colors"
                      >
                        <option value="APPROVED">APPROVED (Full Live Production)</option>
                        <option value="PENDING_REVIEW">PENDING_REVIEW (Submitted to Provider)</option>
                        <option value="IN_DEVELOPMENT">IN_DEVELOPMENT (Dev / Sandbox Testers Only)</option>
                        <option value="REJECTED">REJECTED (Requires Re-submission)</option>
                      </select>
                    </div>
                  </div>

                  {/* Scopes & Permissions */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Configured OAuth Scopes (Comma-separated)</span>
                      <span className="text-[10px] text-slate-500 font-mono">SCOPES</span>
                    </label>
                    <input
                      type="text"
                      value={form.scopes}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          [platform.id]: { ...prev[platform.id], scopes: e.target.value },
                        }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-hidden focus:border-indigo-500 transition-colors"
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {form.scopes
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((scope) => (
                          <span
                            key={scope}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-indigo-300 border border-indigo-900/40"
                          >
                            {scope}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* Form Feedback Message */}
                  {feedback && feedback.id === platform.id && (
                    <div
                      className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                        feedback.type === 'success'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                      }`}
                    >
                      {feedback.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{feedback.message}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTestConnection(platform.id)}
                        disabled={isTesting || !form.clientId}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-indigo-400' : ''}`} />
                        <span>{isTesting ? 'Pinging Endpoint...' : 'Test Connection'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSavePlatform(platform.id)}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Save Platform Settings</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
