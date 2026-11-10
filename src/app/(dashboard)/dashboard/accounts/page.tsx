'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Share2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Layers,
  AlertCircle,
  HelpCircle,
  Users,
  Clock,
  ArrowRight,
  Info,
  Check,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  SocialPlatformId,
  ConnectedSocialAccountDTO,
} from '@/modules/social/types';
import { SOCIAL_PLATFORMS_CATALOG } from '@/modules/social/platforms';
import { SocialPlatformIcon } from '@/components/ui/social-icons';

function AccountsPageContent() {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<ConnectedSocialAccountDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<SocialPlatformId | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Check URL query params for callbacks
  useEffect(() => {
    const connected = searchParams.get('connected');
    const accountName = searchParams.get('accountName');
    const errorParam = searchParams.get('error');

    if (connected) {
      setSuccessBanner(
        `Successfully linked ${connected.toUpperCase()} account ${
          accountName ? `'${accountName}'` : ''
        }!`
      );
      setTimeout(() => setSuccessBanner(null), 6000);
    }

    if (errorParam) {
      setErrorBanner(decodeURIComponent(errorParam));
      setTimeout(() => setErrorBanner(null), 8000);
    }

    fetchAccounts();
  }, [searchParams]);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/social/accounts?workspaceId=ws_peak_scale');
      const json = await res.json();
      if (json.success) {
        setAccounts(json.data);
      }
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  // Initiate OAuth Connection
  const handleConnectPlatform = async (platformId: SocialPlatformId) => {
    setConnectingPlatform(platformId);
    setErrorBanner(null);

    try {
      const res = await fetch(`/api/v1/social/connect/${platformId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: 'ws_peak_scale',
          userId: 'usr_current',
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to initialize OAuth connection.');
      }

      // In real browser redirect to official provider OAuth authorization screen
      window.location.href = json.data.authUrl;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection initialization failed';
      setErrorBanner(msg);
      setConnectingPlatform(null);
    }
  };

  // Disconnect Account
  const handleDisconnect = async (id: string) => {
    setDisconnectingId(id);
    try {
      const res = await fetch(`/api/v1/social/accounts/${id}?workspaceId=ws_peak_scale`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setAccounts((prev) => prev.filter((a) => a.id !== id));
        setSuccessBanner('Social account disconnected and permissions revoked.');
        setTimeout(() => setSuccessBanner(null), 4000);
      } else {
        throw new Error(json.error?.message || 'Failed to disconnect');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Disconnection failed';
      setErrorBanner(msg);
    } finally {
      setDisconnectingId(null);
    }
  };

  // Refresh Token
  const handleRefreshToken = async (id: string) => {
    setRefreshingId(id);
    try {
      const res = await fetch(`/api/v1/social/accounts/${id}/refresh`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success) {
        setSuccessBanner('Access token refreshed and validated successfully.');
        setTimeout(() => setSuccessBanner(null), 4000);
        fetchAccounts();
      } else {
        throw new Error(json.error?.message || 'Token refresh failed');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Refresh failed';
      setErrorBanner(msg);
    } finally {
      setRefreshingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Connected Social Accounts
            <Badge variant="indigo" className="text-[10px]">
              OAuth 2.0 Engine
            </Badge>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage official API connections for Instagram, Facebook, LinkedIn, TikTok, YouTube, Pinterest, X, and Google Business Profile.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsConnectModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Connect Social Account</span>
        </button>
      </div>

      {/* Success Notification */}
      {successBanner && (
        <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/50 flex items-center gap-2.5 text-emerald-300 text-xs shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{successBanner}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorBanner && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/50 flex items-start gap-2.5 text-rose-300 text-xs shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Account Connection Notice</span>
            <span>{errorBanner}</span>
          </div>
        </div>
      )}

      {/* Account Capacity Metric Card */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-white font-bold block">
              Workspace Social Account Usage: {accounts.length} / 10 Connected
            </span>
            <span className="text-slate-400">
              Each connected account is isolated to your active brand workspace.
            </span>
          </div>
        </div>

        <div className="w-full sm:w-48 bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (accounts.length / 10) * 100)}%` }}
          />
        </div>
      </div>

      {/* Connected Accounts Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
          <span className="text-xs">Synchronizing verified social accounts...</span>
        </div>
      ) : accounts.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <Share2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white">No Social Accounts Connected</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Link your brand profiles, Facebook Pages, Instagram Creators, or LinkedIn Company Pages to start publishing and recycling evergreen queues.
          </p>
          <button
            type="button"
            onClick={() => setIsConnectModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Connect First Account</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map((acc) => {
            const meta = SOCIAL_PLATFORMS_CATALOG.find((p) => p.id === acc.platform);
            const isDisconnecting = disconnectingId === acc.id;
            const isRefreshing = refreshingId === acc.id;

            return (
              <div
                key={acc.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Account Header with Platform Badge */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img
                          src={
                            acc.profilePictureUrl ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                          }
                          alt={acc.accountName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700"
                        />
                        <div
                          className="w-3.5 h-3.5 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-slate-900"
                          style={{ backgroundColor: meta?.brandColor || '#6366f1' }}
                        />
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">
                          {acc.accountName}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {acc.accountHandle}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant={
                        acc.connectionStatus === 'CONNECTED'
                          ? 'emerald'
                          : acc.connectionStatus === 'EXPIRING'
                          ? 'amber'
                          : 'rose'
                      }
                      className="text-[9px]"
                    >
                      {acc.connectionStatus}
                    </Badge>
                  </div>

                  {/* Metadata & Status */}
                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Platform:</span>
                      <span className="font-bold text-white">{meta?.name || acc.platform}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Account Type:</span>
                      <span className="font-mono text-indigo-400">{acc.accountType}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Audience Reach:</span>
                      <span className="font-bold text-emerald-400">
                        {acc.followersCount > 1000
                          ? `${(acc.followersCount / 1000).toFixed(1)}K followers`
                          : `${acc.followersCount} followers`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Last Synchronized:</span>
                      <span>
                        {acc.lastSyncAt
                          ? new Date(acc.lastSyncAt).toLocaleDateString()
                          : 'Just now'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleRefreshToken(acc.id)}
                    disabled={isRefreshing}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>{isRefreshing ? 'Checking...' : 'Check Health'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDisconnect(acc.id)}
                    disabled={isDisconnecting}
                    className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>{isDisconnecting ? 'Revoking...' : 'Disconnect'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Connect Account Modal (8 Platforms) */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white">Connect Official Social Media Account</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select a platform below to authenticate via official OAuth 2.0.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsConnectModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Platform Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
              {SOCIAL_PLATFORMS_CATALOG.map((p) => {
                const isConnecting = connectingPlatform === p.id;
                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                        <div className="flex items-center gap-2">
                          <SocialPlatformIcon platform={p.id} size="sm" />
                          <span className="text-xs font-bold text-white">{p.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {p.badgeText}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                        {p.description}
                      </p>

                      <div className="mt-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                        <strong className="text-slate-300 block">Requirement:</strong>
                        <span>{p.accountPrerequisites}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleConnectPlatform(p.id)}
                      disabled={isConnecting}
                      className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isConnecting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <span>Connect {p.name}</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 text-center">
              <span className="text-[11px] text-slate-500">
                🔒 All tokens are securely encrypted and stored server-side. No automated actions are performed without your approval.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading social accounts...</p>
        </div>
      }
    >
      <AccountsPageContent />
    </Suspense>
  );
}
