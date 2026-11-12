'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Layers,
  Sparkles,
  Share2,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowUpRight,
  Repeat,
  Send,
  Building2,
  Bot,
  Inbox,
  BarChart2,
} from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import { Badge } from '@/components/ui/badge';

interface UserInfo {
  name: string;
  role: string;
  email: string;
}

export default function DashboardOverviewPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch('/api/v1/auth/me');
        if (res.ok) {
          const json = await res.json();
          if (json.data?.user) {
            setUser(json.data.user);
          }
        }
      } catch {
        // Fallback
      }
    }
    fetchMe();
  }, []);

  const handleGenerate = () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedDraft(
        `🚀 Most social media managers spend 15+ hours every week reshuffling calendars.\n\nWith category-based queuing, your content slots itself automatically into your highest-engagement time windows.\n\nWhat category performs best for your brand? Drop a comment below! 👇\n\n#SocialMediaStrategy #SaaSMarketing #ContentAutomation`
      );
      setIsGenerating(false);
    }, 700);
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back, {displayName}! 👋
            </h1>
            {user?.role && (
              <Badge variant="amber" size="sm">
                {user.role}
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Your queues are active. Next evergreen slot is scheduled for{' '}
            <strong className="text-slate-900 dark:text-white">Today at 2:30 PM UTC</strong>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/queue"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-102 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>New Queue Post</span>
          </Link>
          <Link
            href="/dashboard/ai-studio"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs sm:text-sm font-semibold transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Studio</span>
          </Link>
        </div>
      </div>

      {/* 4 KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Queued Posts"
          value="42"
          icon={Calendar}
          change="+12% this week"
          isPositive={true}
          subtitle="4 active content categories"
          colorScheme="amber"
        />
        <StatsCard
          title="Connected Accounts"
          value="6 / 15"
          icon={Share2}
          change="All Healthy"
          isPositive={true}
          subtitle="X, LinkedIn, Meta & TikTok"
          colorScheme="indigo"
        />
        <StatsCard
          title="30-Day Impressions"
          value="124.5K"
          icon={TrendingUp}
          change="+28.4%"
          isPositive={true}
          subtitle="Across all brand networks"
          colorScheme="emerald"
        />
        <StatsCard
          title="Unread Inbox Items"
          value="7"
          icon={Inbox}
          change="3 DMs, 4 Comments"
          isPositive={false}
          subtitle="Avg response time: 22m"
          colorScheme="sky"
        />
      </div>

      {/* Main Grid: Upcoming Schedule + Quick AI Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Category Queues & Upcoming Timetable (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Category Queues Overview */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Active Content Categories
                </h2>
              </div>
              <Link
                href="/dashboard/queue"
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Manage Categories</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-amber-200/70 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      Evergreen Insights
                    </span>
                  </div>
                  <Badge variant="amber" size="sm">
                    Recycling Active
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Top performing educational posts with 90-day recycle buffer.
                </p>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 pt-1 flex items-center justify-between">
                  <span>18 posts in queue</span>
                  <span>Slots: Mon, Wed, Fri 09:30</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-indigo-200/70 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      Curated Industry News
                    </span>
                  </div>
                  <Badge variant="indigo" size="sm">
                    12 Queued
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Market commentary, trends, and product launch reactions.
                </p>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 pt-1 flex items-center justify-between">
                  <span>12 posts in queue</span>
                  <span>Slots: Tue, Thu 14:00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Publishing Timetable */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Next Scheduled Queue Dispatches
                </h2>
              </div>
              <Link
                href="/dashboard/calendar"
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>View Full Calendar</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-2">
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      Today, 2:30 PM UTC
                    </span>
                    <Badge variant="amber" size="sm">
                      Evergreen
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                    &quot;3 friction points every B2B checkout workflow suffers from, and how to fix them...&quot;
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">
                    LinkedIn + X
                  </span>
                </div>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      Tomorrow, 9:00 AM UTC
                    </span>
                    <Badge variant="indigo" size="sm">
                      Industry News
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                    &quot;Algorithm shifts for social teams: What you need to know about organic reach in 2026...&quot;
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">
                    X + Threads
                  </span>
                </div>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Thursday, 11:15 AM UTC
                    </span>
                    <Badge variant="emerald" size="sm">
                      Product Promo
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                    &quot;Free up 15 hours every week with QuickPostly category queuing. Schedule posts across all channels seamlessly...&quot;
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">
                    All Channels
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quick AI Copilot Assistant (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Quick AI Draft Copilot
                </h3>
              </div>
              <Badge variant="amber" size="sm">
                GPT-4o / Claude
              </Badge>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter any topic, keyword, or link to instantly generate a ready-to-queue social post.
            </p>

            <div className="space-y-3">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. 5 reasons why category queues beat manual daily social scheduling..."
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !aiPrompt.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-slate-950 text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Drafting Post...' : 'Generate with AI'}</span>
              </button>
            </div>

            {generatedDraft && (
              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-3 animate-in fade-in-0 duration-200">
                <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400">
                  <span>Generated Social Draft</span>
                  <Badge variant="amber" size="sm">
                    Ready
                  </Badge>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {generatedDraft}
                </p>
                <div className="flex items-center gap-2 pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
                  <Link
                    href={`/dashboard/queue?draft=${encodeURIComponent(generatedDraft)}`}
                    className="w-full text-center py-1.5 px-3 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-500 text-slate-950 transition-colors"
                  >
                    Add to Queue
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
