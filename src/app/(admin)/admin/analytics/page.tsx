// src/app/(admin)/admin/analytics/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
  BarChart3,
  TrendingUp,
  Cpu,
  Share2,
  AlertTriangle,
  Users,
  Activity,
  Layers,
  CheckCircle2,
  RefreshCw,
  Server,
  DollarSign,
  Shield,
  Clock,
} from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import { Badge } from '@/components/ui/badge';
import { AdminAnalyticsSummary } from '@/modules/analytics/types';

function AdminAnalyticsContent() {
  const [summary, setSummary] = useState<AdminAnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminAnalytics();
  }, []);

  const fetchAdminAnalytics = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/admin/analytics');
      const data = await res.json();
      if (data.success) {
        setSummary(data.data);
      }
    } catch (err) {
      console.error('Failed to load admin analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Executive Telemetry & Infrastructure
            </span>
            <span className="text-xs text-slate-500 font-mono">Part 10 Admin Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Platform Analytics & System Health
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time monitoring of global AI token consumption, social publishing throughput, API errors, and user activity.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAdminAnalytics}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading platform telemetry...</p>
        </div>
      ) : !summary ? (
        <div className="py-20 text-center text-slate-500">Failed to load platform telemetry.</div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              title="Total AI Generations"
              value={summary.aiUsage.totalGenerations.toLocaleString()}
              change="+22.4%"
              isPositive={true}
              icon={Cpu}
              subtitle={`${(summary.aiUsage.totalTokens / 1000000).toFixed(1)}M tokens consumed`}
            />
            <StatsCard
              title="Estimated AI Spend"
              value={`$${summary.aiUsage.estimatedCostUsd.toFixed(2)}`}
              change="+11.2%"
              isPositive={false}
              icon={DollarSign}
              subtitle="OpenAI, Gemini, Claude, DeepSeek"
            />
            <StatsCard
              title="Connected Accounts"
              value={summary.connectedAccounts.total.toString()}
              change={`${summary.connectedAccounts.active} Active`}
              isPositive={true}
              icon={Share2}
              subtitle={`${summary.connectedAccounts.expiring} tokens expiring soon`}
            />
            <StatsCard
              title="Publishing Success Rate"
              value={`${(100 - summary.apiErrors.errorRatePercent).toFixed(1)}%`}
              change={`${summary.publishingActivity.throughputPerDay}/day`}
              isPositive={true}
              icon={Activity}
              subtitle={`${summary.apiErrors.totalErrors} total platform errors`}
            />
          </div>

          {/* AI Usage & Platform Distribution Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* AI Provider Cost Breakdown (6 cols) */}
            <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">AI Provider Usage & Cost</h3>
                  <p className="text-xs text-slate-400">Breakdown of model executions and token costs.</p>
                </div>
                <Badge variant="indigo" size="sm">
                  ${summary.aiUsage.estimatedCostUsd.toFixed(2)} Total
                </Badge>
              </div>

              <div className="space-y-3 pt-2">
                {Object.entries(summary.aiUsage.byProvider).map(([provider, data]) => {
                  const percent = Math.round((data.cost / summary.aiUsage.estimatedCostUsd) * 100);
                  return (
                    <div key={provider} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-white uppercase font-bold">{provider}</span>
                        <span className="text-slate-300">
                          {data.count.toLocaleString()} calls &bull; ${data.cost.toFixed(2)} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Platform Usage Distribution (6 cols) */}
            <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Platform Usage Share</h3>
                  <p className="text-xs text-slate-400">Share of posts published across official social APIs.</p>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {summary.publishingActivity.totalPublished.toLocaleString()} Dispatched
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {summary.platformUsage.map((p) => (
                  <div key={p.platform} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{p.name}</span>
                      <span className="font-mono text-slate-300">
                        {p.postsCount} posts ({p.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${p.percentage}%`, backgroundColor: p.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Publishing Activity & API Errors Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Publishing Activity Stats (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Publishing Pipeline</h3>
                <p className="text-xs text-slate-400">BullMQ queue volume and status distribution.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Confirmed Published</span>
                  <span className="text-lg font-extrabold text-emerald-400">
                    {summary.publishingActivity.totalPublished.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Scheduled in Queue</span>
                  <span className="text-lg font-extrabold text-indigo-400">
                    {summary.publishingActivity.totalScheduled}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Active Drafts</span>
                  <span className="text-lg font-extrabold text-slate-300">
                    {summary.publishingActivity.totalDrafts}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Failed Dispatches</span>
                  <span className="text-lg font-extrabold text-rose-400">
                    {summary.publishingActivity.totalFailed}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
                <span>Daily Throughput:</span>
                <span className="font-mono font-bold">{summary.publishingActivity.throughputPerDay} posts/day</span>
              </div>
            </div>

            {/* API Error Telemetry Log (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Social Platform API Errors</h3>
                  <p className="text-xs text-slate-400">Captured platform exceptions and rate limit alarms.</p>
                </div>
                <Badge variant={summary.apiErrors.errorRatePercent < 1 ? 'emerald' : 'rose'} size="sm">
                  {summary.apiErrors.errorRatePercent}% Error Rate
                </Badge>
              </div>

              <div className="space-y-2.5 pt-1">
                {summary.apiErrors.recentErrors.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    Zero recent API errors recorded.
                  </div>
                ) : (
                  summary.apiErrors.recentErrors.map((err) => (
                    <div
                      key={err.id}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span className="font-bold text-rose-400 uppercase">{err.platform}</span>
                          <span className="font-mono text-[10px] text-slate-500">{err.code}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(err.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">{err.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading admin analytics...</p>
        </div>
      }
    >
      <AdminAnalyticsContent />
    </Suspense>
  );
}
