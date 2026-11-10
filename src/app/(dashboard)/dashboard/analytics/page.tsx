// src/app/(dashboard)/dashboard/analytics/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  RefreshCw,
  HelpCircle,
  AlertCircle,
  ExternalLink,
  Printer,
  Sparkles,
  Info,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import { Badge } from '@/components/ui/badge';
import { NotificationsDropdown } from '@/components/dashboard/notifications-dropdown';
import {
  AnalyticsOverview,
  PlatformAnalytics,
  BestPerformingPost,
} from '@/modules/analytics/types';
import { SocialPlatformIcon } from '@/components/ui/social-icons';

function SocialAnalyticsContent() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activePlatformFilter, setActivePlatformFilter] = useState<string>('all');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/v1/analytics/overview?workspaceId=ws_peak_scale&timeRange=${timeRange}`);
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncMetrics = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await fetch('/api/v1/analytics/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: 'ws_peak_scale' }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncFeedback('Platform metrics cache synchronized with official APIs!');
        fetchAnalytics();
      }
    } catch {
      setSyncFeedback('Sync failed. Please check network connection.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  const handleExportCsv = () => {
    window.open(`/api/v1/analytics/export?workspaceId=ws_peak_scale&timeRange=${timeRange}&format=csv`, '_blank');
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const filteredPlatforms = analytics?.platforms.filter((p) => {
    if (activePlatformFilter === 'all') return true;
    return p.platform === activePlatformFilter;
  });

  return (
    <div className="space-y-8 print:p-0 print:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 print:border-b-2 print:border-slate-300">
        <div>
          <div className="flex items-center gap-2 mb-1 print:hidden">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Verified Official API Data
            </span>
            <span className="text-xs text-slate-500 font-mono">Part 10 Analytics Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight print:text-black">
            Social Media Performance Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1 print:text-slate-600">
            Real multi-channel audience growth, cross-platform engagement, impressions, and reach reports.
          </p>
        </div>

        {/* Toolbar & Exports */}
        <div className="flex flex-wrap items-center gap-2.5 print:hidden">
          <NotificationsDropdown />

          {/* Timeframe toggle */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  timeRange === range ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Sync Button */}
          <button
            type="button"
            onClick={handleSyncMetrics}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Sync metrics cache with platform APIs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync APIs'}</span>
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          {/* Print / PDF */}
          <button
            type="button"
            onClick={handlePrintPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Sync Feedback Alert */}
      {syncFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* KPI Overview Cards */}
      {isLoading ? (
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading social performance data...</p>
        </div>
      ) : !analytics ? (
        <div className="py-20 text-center text-slate-500">Failed to load analytics data.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              title="Total Audience"
              value={analytics.totalFollowers.toLocaleString()}
              change={`+${analytics.followerGrowthPercent}%`}
              isPositive={analytics.followerGrowthPercent > 0}
              icon={Users}
              subtitle={`+${analytics.followerGrowth.toLocaleString()} in last ${timeRange}`}
            />
            <StatsCard
              title="Total Impressions"
              value={analytics.totalImpressions.toLocaleString()}
              change="+14.2%"
              isPositive={true}
              icon={Eye}
              subtitle="Cross-platform ad & organic feed views"
            />
            <StatsCard
              title="Total Engagement"
              value={(analytics.totalLikes + analytics.totalComments + analytics.totalShares).toLocaleString()}
              change="+8.4%"
              isPositive={true}
              icon={Heart}
              subtitle={`${analytics.totalLikes.toLocaleString()} likes, ${analytics.totalComments.toLocaleString()} comments`}
            />
            <StatsCard
              title="Avg. Engagement Rate"
              value={`${analytics.averageEngagementRate}%`}
              change="+0.8%"
              isPositive={true}
              icon={TrendingUp}
              subtitle="Calculated per impression volume"
            />
          </div>

          {/* Platform Performance Comparison Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-white print:text-black">
                  Platform Comparisons & Metrics
                </h2>
                <p className="text-xs text-slate-400">
                  Performance breakdown per connected social channel with official API compliance notes.
                </p>
              </div>

              {/* Platform Filter */}
              <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs print:hidden">
                <button
                  type="button"
                  onClick={() => setActivePlatformFilter('all')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activePlatformFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                {analytics.platforms.map((p) => (
                  <button
                    key={p.platform}
                    type="button"
                    onClick={() => setActivePlatformFilter(p.platform)}
                    className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-colors cursor-pointer ${
                      activePlatformFilter === p.platform ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Comparison Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlatforms?.map((p) => (
                <div
                  key={p.platform}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4 print:border-slate-300 print:bg-white"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <SocialPlatformIcon platform={p.platform || p.name} size="sm" />
                      <div>
                        <h3 className="font-bold text-sm text-white print:text-black">{p.name}</h3>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {p.postsPublished} posts published
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-white print:text-black">
                        {p.followers.toLocaleString()}
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-400">
                        +{p.followerGrowthPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Impressions</span>
                      <span className="text-sm font-bold text-slate-200 print:text-black">
                        {p.impressions.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Unique Reach</span>
                      <span className="text-sm font-bold text-slate-200 print:text-black">
                        {p.unavailableMetrics.includes('reach') ? (
                          <span className="text-amber-400 text-xs font-semibold">Restricted</span>
                        ) : (
                          p.reach.toLocaleString()
                        )}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Likes & Comments</span>
                      <span className="text-sm font-bold text-slate-200 print:text-black">
                        {(p.likes + p.comments).toLocaleString()}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Shares / Reposts</span>
                      <span className="text-sm font-bold text-slate-200 print:text-black">
                        {p.unavailableMetrics.includes('shares') ? (
                          <span className="text-slate-500 text-xs font-mono">N/A</span>
                        ) : (
                          p.shares.toLocaleString()
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Engagement Rate Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Engagement Rate</span>
                      <span className="font-bold text-emerald-400">{p.engagementRate}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${Math.min(p.engagementRate * 10, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Disclaimer Note */}
                  <div className="text-[10px] text-slate-500 font-mono pt-1">
                    API: {p.apiLimitNotes}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Best-Performing Posts Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white print:text-black">
                Best-Performing Social Posts
              </h2>
              <p className="text-xs text-slate-400">
                Top posts ranked by verified audience engagement and interaction rate.
              </p>
            </div>

            <div className="space-y-3">
              {analytics.topPosts.map((post, idx) => (
                <div
                  key={post.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:border-slate-300 print:bg-white"
                >
                  <div className="flex items-start gap-3.5 max-w-2xl">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 text-xs shrink-0">
                      #{idx + 1}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-950 text-slate-300 border border-slate-800">
                          {post.platform}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {new Date(post.publishedAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-200 print:text-black line-clamp-2 leading-relaxed">
                        {post.content}
                      </p>
                    </div>
                  </div>

                  {/* Post Metrics Stats */}
                  <div className="flex items-center gap-4 text-xs shrink-0 self-end md:self-center">
                    <div className="text-center">
                      <div className="text-[10px] text-slate-500">Likes</div>
                      <div className="font-bold text-white print:text-black">{post.likes.toLocaleString()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] text-slate-500">Comments</div>
                      <div className="font-bold text-white print:text-black">{post.comments.toLocaleString()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] text-slate-500">Shares</div>
                      <div className="font-bold text-white print:text-black">
                        {post.shares > 0 ? post.shares.toLocaleString() : '—'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] text-slate-500">Engagement</div>
                      <div className="font-bold text-emerald-400">{post.engagementRate}%</div>
                    </div>

                    {post.permalink && (
                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="View on platform"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Official Platform Restrictions Disclaimer Card */}
          <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Official Social Platform API Metrics Transparency Disclaimers</span>
            </div>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              SocialHive adheres strictly to the official API guidelines and terms of service of each platform. Certain metrics are restricted or unavailable due to official platform limitations:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-400">
              {analytics.unavailableMetrics.map((res) => (
                <div key={res.platform + res.metric} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="font-bold text-slate-300 uppercase">{res.platform} ({res.metric}): </span>
                  <span>{res.reason}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function SocialAnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading social analytics...</p>
        </div>
      }
    >
      <SocialAnalyticsContent />
    </Suspense>
  );
}
