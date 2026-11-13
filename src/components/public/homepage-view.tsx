'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Layers,
  Repeat,
  Send,
  Building2,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Clock,
  Calendar,
  Share2,
  Bot,
  Zap,
  Shield,
  Star,
  Check,
  Smartphone,
  Eye,
  Hash,
  Lock,
  TrendingUp,
  Heart,
  MessageCircle,
  ThumbsUp,
} from 'lucide-react';
import { HomepageContentDto, SocialIntegrationDto } from '@/modules/cms/types';
import { Accordion } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { SocialPlatformIcon } from '@/components/ui/social-icons';

interface HomepageViewProps {
  content: HomepageContentDto;
}

export function HomepageView({ content }: HomepageViewProps) {
  const {
    hero,
    features,
    aiTools,
    integrations,
    howItWorks,
    testimonials,
    faqs,
    pricing,
    cta,
    isFreePlanActive = true,
  } = content;

  // Real-time synchronization
  const [effectiveFreePlanActive, setEffectiveFreePlanActive] = useState(isFreePlanActive);

  useEffect(() => {
    setEffectiveFreePlanActive(isFreePlanActive);
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/quickpostly_free_plan_active=([^;]+)/);
      if (match) {
        setEffectiveFreePlanActive(match[1] === 'true' || match[1] === '1');
      }
    }

    // Authoritative real-time check from server
    fetch('/api/v1/cms/trial-status', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.isFreePlanActive === 'boolean') {
          setEffectiveFreePlanActive(data.isFreePlanActive);
        }
      })
      .catch(() => {});

    // Listen for cross-component broadcast events
    const handleStatusEvent = (e: any) => {
      if (e?.detail && typeof e.detail.isFreePlanActive === 'boolean') {
        setEffectiveFreePlanActive(e.detail.isFreePlanActive);
      }
    };
    window.addEventListener('quickpostly:trial-status-changed', handleStatusEvent);
    return () => {
      window.removeEventListener('quickpostly:trial-status-changed', handleStatusEvent);
    };
  }, [isFreePlanActive]);

  const defaultFreePlan = {
    id: 'plan_free_trial',
    slug: 'free-trial',
    name: 'Free Trial',
    description: '14-day fully featured sandbox trial for exploring QuickPostly automation.',
    badge: '14 Days Free',
    monthlyPrice: 0,
    annualPrice: 0,
    currency: 'USD',
    features: [
      '3 Social Media Profiles',
      '30 Scheduled Queue Slots',
      '25 AI Copilot Text Generations',
      '5 AI Social Image Credits',
      'Basic Performance Analytics (14 Days)',
      'Evergreen Category Recycling',
      'Single User Workspace',
    ],
    isPopular: false,
    ctaText: 'Start 14-Day Free Trial',
    ctaLink: '/signup?plan=free-trial',
  };

  const allPricing = [...pricing];
  if (effectiveFreePlanActive) {
    const hasFree = allPricing.some(
      (p) => p.slug === 'free-trial' || p.slug === 'free_trial' || p.monthlyPrice === 0
    );
    if (!hasFree) {
      allPricing.unshift(defaultFreePlan as any);
    }
  }

  // Filter and sanitize pricing plans based on trial status
  const displayedPricing = (effectiveFreePlanActive
    ? allPricing
    : allPricing.filter(
        (p) =>
          p.slug !== 'free-trial' &&
          p.slug !== 'free_trial' &&
          p.monthlyPrice > 0 &&
          !p.name.toLowerCase().includes('trial')
      )
  ).map((p) => {
    if (effectiveFreePlanActive) {
      return {
        ...p,
        ctaText: 'Start 14-Day Free Trial',
        ctaLink: p.monthlyPrice === 0 ? '/signup?plan=free-trial' : `/signup?plan=${p.slug}`,
      };
    }
    return {
      ...p,
      ctaText:
        p.slug === 'starter'
          ? 'Get Started'
          : p.slug === 'pro' || p.slug === 'professional'
          ? 'Get Pro Growth'
          : p.slug === 'agency'
          ? 'Get Agency Scale'
          : 'Choose Plan',
      ctaLink: `/signup?plan=${p.slug}`,
    };
  });

  // Interactive Product Preview Tab State
  const [activePreviewTab, setActivePreviewTab] = useState<'queue' | 'ai' | 'calendar'>('queue');

  // Interactive AI Showcase Tab State
  const [selectedAiToolIndex, setSelectedAiToolIndex] = useState(0);

  // Interactive Pricing Interval Toggle
  const [annualBilling, setAnnualBilling] = useState(true);

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* ==================================================================== */}
      {/* 1. HERO SECTION */}
      {/* ==================================================================== */}
      <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 overflow-hidden">
        {/* Ambient Glow Lights Behind Hero */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none overflow-hidden -z-10">
          <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-amber-500/25 via-orange-500/15 to-amber-300/10 blur-[130px] rounded-full" />
          <div className="absolute top-[20%] left-[10%] w-[380px] h-[320px] bg-indigo-500/10 blur-[120px] rounded-full" />
          <div className="absolute top-[25%] right-[10%] w-[380px] h-[320px] bg-amber-500/15 blur-[120px] rounded-full" />
        </div>

        {/* High-Tech Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs font-semibold tracking-wide shadow-sm shadow-amber-500/10 animate-in fade-in slide-in-from-top-3 duration-500 hover:border-amber-400 transition-colors">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>
                {effectiveFreePlanActive
                  ? hero.badgeText
                  : (hero.badgeText || '')
                      .replace(/14[\s-]*day/gi, 'Intelligent')
                      .replace(/trial/gi, 'Platform')
                      .replace(/no credit card required/gi, 'Automated Publishing')}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-500/70" />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08]">
              {hero.headlinePrefix}{' '}
              <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 bg-clip-text text-transparent drop-shadow-xs">
                {hero.highlightedPhrase}
              </span>{' '}
              {hero.headlineSuffix}
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
              {hero.description}
            </p>

            {/* Primary & Secondary CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href={effectiveFreePlanActive ? hero.primaryCtaLink : '/pricing'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-400/25 hover:shadow-amber-400/40 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              >
                <span>{effectiveFreePlanActive ? hero.primaryCtaText : 'Get Started Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={hero.secondaryCtaLink}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs transition-all duration-200 hover:scale-[1.02]"
              >
                <span>{hero.secondaryCtaText}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>

            {/* Trust Chips with Frosted Capsules */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 pt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              {(effectiveFreePlanActive
                ? (Array.isArray(hero?.trustPoints)
                    ? hero.trustPoints
                    : ['No credit card required', '14-day full feature trial', 'Cancel anytime with 1 click'])
                : (Array.isArray(hero?.trustPoints)
                    ? hero.trustPoints.filter((tp: string) => !/14[\s-]*day/i.test(tp) && !/trial/i.test(tp) && !/credit card/i.test(tp))
                    : ['Instant setup in 60s', 'Cancel anytime with 1 click', 'Official social API certified'])
              ).map((point: string, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800/70 shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ==================================================================== */}
          {/* 2. PRODUCT PREVIEW (Interactive Live Scheduler & Queues) */}
          {/* ==================================================================== */}
          <div className="relative mt-14 max-w-5xl mx-auto">
            {/* Ambient Glow Aura Behind Window */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-indigo-500/20 rounded-3xl blur-2xl opacity-70 dark:opacity-40 -z-10" />

            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/10">
              {/* Chrome Top Bar */}
              <div className="h-14 px-4 sm:px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-2 py-2 sm:py-0">
                {/* Window Dots & URL Bar */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-white/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <Lock className="w-3 h-3 text-emerald-500" />
                    <span>app.quickpostly.com/autopilot-queue</span>
                  </div>
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    7 Channels Active
                  </span>
                </div>

                {/* View Switcher Tabs */}
                <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-900 p-1 rounded-xl border border-slate-300/40 dark:border-slate-800">
                  <button
                    onClick={() => setActivePreviewTab('queue')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activePreviewTab === 'queue'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                    <span>Category Queue</span>
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('ai')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activePreviewTab === 'ai'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5 text-indigo-500" />
                    <span>AI Studio</span>
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('calendar')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activePreviewTab === 'calendar'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Publishing Grid</span>
                  </button>
                </div>
              </div>

              {/* TAB CONTENT 1: Category Queue */}
              {activePreviewTab === 'queue' && (
                <div className="p-6 md:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Layers className="w-4 h-4 text-amber-500" />
                        <span>Intelligent Category Queues</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Posts automatically slot into optimized recurrent timetable slots
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3 text-amber-500" /> Next: Mon 09:30 AM
                      </span>
                      <Badge variant="amber" size="sm">
                        4 Active Queues • 28 Posts Ready
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Category Card 1 */}
                    <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-950/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-3 hover:border-amber-400 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            Evergreen Insights
                          </span>
                        </div>
                        <Badge variant="amber" size="sm">
                          <Repeat className="w-3 h-3 mr-1" />
                          Recycling 4x
                        </Badge>
                      </div>
                      <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2.5 shadow-2xs">
                        <p className="font-medium leading-relaxed">
                          &quot;Stop writing single-use posts that vanish after 6 hours. Build an evergreen content library that compounds reach on autopilot.&quot;
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                            <Clock className="w-3 h-3 text-amber-500" /> Mon 09:30 AM
                          </span>
                          <span className="font-semibold text-amber-600 dark:text-amber-400">
                            X &amp; LinkedIn
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Category Card 2 */}
                    <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-950/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3 hover:border-indigo-400 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            Curated Industry News
                          </span>
                        </div>
                        <Badge variant="indigo" size="sm">
                          12 queued
                        </Badge>
                      </div>
                      <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2.5 shadow-2xs">
                        <p className="font-medium leading-relaxed">
                          &quot;Meta &amp; LinkedIn updated their 2026 distribution criteria. 3 key tactics growth teams must know to stay ahead...&quot;
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                            <Clock className="w-3 h-3 text-indigo-500" /> Tue 02:00 PM
                          </span>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            LinkedIn &amp; Threads
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Category Card 3 */}
                    <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-950/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3 hover:border-emerald-400 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            Product Promo &amp; Offers
                          </span>
                        </div>
                        <Badge variant="emerald" size="sm">
                          Buffer: 1/week
                        </Badge>
                      </div>
                      <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2.5 shadow-2xs">
                        <p className="font-medium leading-relaxed">
                          &quot;Free up 15 hours each week: put your social media queuing on intelligent autopilot with zero spreadsheet burnout.&quot;
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                            <Clock className="w-3 h-3 text-emerald-500" /> Thu 11:15 AM
                          </span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            All 7 Channels
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT 2: AI Multi-Channel Studio */}
              {activePreviewTab === 'ai' && (
                <div className="p-6 md:p-8 space-y-6">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold shrink-0">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            AI Copilot Engine
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-500 font-mono font-medium">
                            Gemini 2.5 &amp; Claude 3.5
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                          &quot;Announce our category-based queue scheduling with a focus on agency time savings&quot;
                        </p>
                      </div>
                    </div>
                    <Badge variant="indigo" size="sm">
                      Tone: Thought Leader
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* LinkedIn Preview Card */}
                    <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#0077b5] text-white flex items-center justify-center font-black text-xs">
                            in
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">QuickPostly</span>
                              <span className="w-3 h-3 rounded-full bg-blue-500 text-white text-[8px] flex items-center justify-center">✓</span>
                            </div>
                            <span className="text-[10px] text-slate-400">24,500 followers • 2h • 🌐</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-500 font-semibold">14.2K est. reach</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        Managing 10+ client social channels shouldn&apos;t feel like a 24/7 spreadsheet sprint.
                        <br /><br />
                        With category-based queuing, agency teams set up evergreen, promotional, and educational buckets once. QuickPostly handles the rest on autopilot.
                      </p>
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="flex -space-x-1">
                            <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[8px] flex items-center justify-center">👍</span>
                            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] flex items-center justify-center">❤️</span>
                            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[8px] flex items-center justify-center">👏</span>
                          </span>
                          <span className="font-medium text-slate-600 dark:text-slate-300">342 reactions</span>
                        </div>
                        <span>58 comments • 14 reposts</span>
                      </div>
                    </div>

                    {/* X / Twitter Preview Card */}
                    <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-xs border border-slate-800">
                            𝕏
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">QuickPostly</span>
                              <span className="w-3 h-3 rounded-full bg-amber-500 text-slate-950 text-[8px] font-bold flex items-center justify-center">✓</span>
                            </div>
                            <span className="text-[10px] text-slate-400">@QuickPostly • 1h</span>
                          </div>
                        </div>
                        <Badge variant="amber" size="sm">Thread 1/4 🧵</Badge>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        Most social posts die in 6 hours.
                        <br /><br />
                        If you aren&apos;t recycling evergreen content through smart category queues, you&apos;re leaving 70% of potential reach on the table.
                        <br /><br />
                        Here is the exact growth playbook 🧵👇
                      </p>
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>💬 84</span>
                        <span>🔄 128</span>
                        <span>❤️ 942</span>
                        <span>📊 24.8K</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT 3: Publishing Grid */}
              {activePreviewTab === 'calendar' && (
                <div className="p-6 md:p-8 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      <span>Weekly Queue Timetable</span>
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Timezone: UTC (Global Autopilot)</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center text-xs">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                      <div key={day} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-2 hover:border-amber-400/60 transition-colors">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block">{day}</span>
                        <div className="space-y-1.5">
                          <div className="p-1.5 rounded-lg text-[10px] bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 font-semibold truncate shadow-2xs">
                            09:30 Insights
                          </div>
                          {idx % 2 === 0 && (
                            <div className="p-1.5 rounded-lg text-[10px] bg-indigo-100 text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-300 font-semibold truncate shadow-2xs">
                              14:00 News
                            </div>
                          )}
                          {idx === 3 && (
                            <div className="p-1.5 rounded-lg text-[10px] bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 font-semibold truncate shadow-2xs">
                              16:00 Promo
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Certified API Partners Banner */}
            <div className="mt-12 text-center space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Official Certified OAuth 2.0 API Integrations
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
                {[
                  { name: 'X / Twitter', icon: 'x' },
                  { name: 'LinkedIn', icon: 'linkedin' },
                  { name: 'Instagram', icon: 'instagram' },
                  { name: 'Facebook', icon: 'facebook' },
                  { name: 'TikTok', icon: 'tiktok' },
                  { name: 'Pinterest', icon: 'pinterest' },
                  { name: 'YouTube', icon: 'youtube' },
                ].map((plat) => (
                  <div
                    key={plat.name}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs hover:border-amber-400 transition-colors"
                  >
                    <SocialPlatformIcon platform={plat.icon} size="sm" />
                    <span>{plat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. FEATURES SECTION */}
      {/* ==================================================================== */}
      <section id="features" className="py-20 md:py-28 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <Badge variant="amber" size="md">
              Enterprise Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Engineered for consistency, reach, and peace of mind
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              Everything high-performing marketing teams and digital agencies need to automate publishing without sacrificing quality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon =
                feature.iconName === 'Layers'
                  ? Layers
                  : feature.iconName === 'Repeat'
                  ? Repeat
                  : feature.iconName === 'Send'
                  ? Send
                  : feature.iconName === 'Building2'
                  ? Building2
                  : feature.iconName === 'MessageSquare'
                  ? MessageSquare
                  : BarChart3;

              return (
                <div
                  key={feature.id}
                  className="relative p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl hover:bg-white dark:hover:bg-slate-900/90 shadow-sm hover:shadow-xl hover:border-amber-400/60 dark:hover:border-amber-500/40 transition-all duration-300 group hover:-translate-y-1.5 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-amber-500/10 via-transparent to-transparent rounded-bl-full pointer-events-none group-hover:scale-150 transition-transform duration-500" />
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-slate-950 transition-all duration-300 shadow-2xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    {feature.badge && (
                      <Badge variant="amber" size="sm">
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-amber-500 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. AI TOOLS SHOWCASE */}
      {/* ==================================================================== */}
      <section id="ai-tools" className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <Badge variant="indigo" size="md">
              Next-Gen AI Copilot
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI built specifically for social media creators &amp; brands
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              No generic chatbot outputs. Our specialized models understand platform algorithms, character limits, hooks, and audience psychology.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* AI Tool Selector List (Left 5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              {aiTools.map((tool, idx) => {
                const isSelected = selectedAiToolIndex === idx;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedAiToolIndex(idx)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-white dark:bg-slate-900 shadow-md ring-1 ring-amber-400/20'
                        : 'border-slate-200 dark:border-slate-800 bg-transparent hover:bg-white/60 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-900 dark:text-white text-base">
                        {tool.name}
                      </span>
                      <Badge variant={isSelected ? 'amber' : 'slate'} size="sm">
                        {tool.tag}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {tool.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* AI Interactive Preview Terminal (Right 7 cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden p-6 md:p-8 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {aiTools[selectedAiToolIndex]?.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ready to dispatch</span>
                </div>
              </div>

              {/* Input Prompt Box */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Test Prompt
                </span>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300">
                  {aiTools[selectedAiToolIndex]?.examplePrompt}
                </div>
              </div>

              {/* Output Response Box */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  AI Generated Social Output
                </span>
                <div className="p-4 rounded-xl bg-amber-50/30 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {aiTools[selectedAiToolIndex]?.exampleOutput}
                </div>
              </div>

              {/* Capabilities checklist */}
              <div className="pt-2 flex flex-wrap gap-2">
                {aiTools[selectedAiToolIndex]?.capabilities.map((cap, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span>{cap}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. SOCIAL MEDIA INTEGRATIONS */}
      {/* ==================================================================== */}
      <section id="integrations" className="py-20 md:py-28 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <Badge variant="emerald" size="md">
              Certified API Integrations
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Connect every channel your audience loves
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              Direct, certified API connections ensuring your content publishes reliably without shadowbans or third-party hacks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((item: SocialIntegrationDto) => (
              <div
                key={item.id}
                className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <SocialPlatformIcon
                      platform={item.platformKey || item.id || item.name}
                      size="md"
                    />
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {item.name}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  {item.isPopular && (
                    <Badge variant="amber" size="sm">
                      Popular
                    </Badge>
                  )}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  {item.supportedFeatures.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 6. HOW IT WORKS */}
      {/* ==================================================================== */}
      <section id="how-it-works" className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <Badge variant="amber" size="md">
              4-Step Workflow
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              From blank calendar to continuous social momentum
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              Here is how modern social teams automate hours of weekly planning in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {howItWorks.map((step, idx) => (
              <div
                key={step.stepNumber}
                className="relative p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-black text-amber-500 font-mono">
                      {step.stepNumber}
                    </span>
                    <Badge variant="amber" size="sm">
                      {step.badge}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    {step.title}
                  </h3>
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 block mb-2.5">
                    {step.subtitle}
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 7. PRICING PREVIEW */}
      {/* ==================================================================== */}
      <section id="pricing" className="py-20 md:py-28 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <Badge variant="amber" size="md">
              Transparent Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Invest in consistent organic brand growth
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              {effectiveFreePlanActive
                ? 'Start with a 14-day free trial. Upgrade, downgrade, or cancel anytime.'
                : 'Choose your growth plan. Instant setup, upgrade, downgrade, or cancel anytime.'}
            </p>

            {/* Monthly / Annual Billing Toggle */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <span
                className={`text-sm font-semibold cursor-pointer ${
                  !annualBilling ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                }`}
                onClick={() => setAnnualBilling(false)}
              >
                Monthly
              </span>
              <button
                type="button"
                onClick={() => setAnnualBilling(!annualBilling)}
                className="w-12 h-6 rounded-full bg-amber-400 p-0.5 transition-colors relative cursor-pointer"
                aria-label="Toggle annual billing"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-slate-950 shadow-md transform transition-transform ${
                    annualBilling ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setAnnualBilling(true)}>
                <span
                  className={`text-sm font-semibold ${
                    annualBilling ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                  }`}
                >
                  Annual Billing
                </span>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Save 20%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayedPricing.map((plan) => {
              const price = annualBilling ? plan.annualPrice : plan.monthlyPrice;
              return (
                <div
                  key={plan.id}
                  className={`relative p-8 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                    plan.isPopular
                      ? 'border-amber-400 bg-white dark:bg-slate-900 shadow-2xl ring-2 ring-amber-400/30'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2">
                      <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-md">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[36px] mb-6">
                      {plan.description}
                    </p>

                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
                        ${price}
                      </span>
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        / month {annualBilling && '(billed annually)'}
                      </span>
                    </div>

                    <div className="space-y-3 mb-8">
                      {plan.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={plan.ctaLink}
                    className={`w-full py-3.5 rounded-xl text-center text-sm font-bold transition-all shadow-sm ${
                      plan.isPopular
                        ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-amber-400/25 hover:scale-102'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {plan.ctaText}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 8. TESTIMONIALS */}
      {/* ==================================================================== */}
      <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <Badge variant="amber" size="md">
              Customer Outcomes
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Trusted by fast-scaling brands and agencies
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              See how modern growth leaders reclaim hundreds of hours every quarter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    &quot;{item.quote}&quot;
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.name}
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {item.role}, {item.company}
                    </span>
                  </div>
                  <Badge variant="emerald" size="sm">
                    {item.metricResult}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 9. FREQUENTLY ASKED QUESTIONS */}
      {/* ==================================================================== */}
      <section className="py-20 md:py-28 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-14">
            <Badge variant="slate" size="md">
              Got Questions?
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Everything you need to know about QuickPostly, our queuing engine, and subscription plans.
            </p>
          </div>

          <Accordion items={faqs} defaultOpenId="faq_1" />
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 10. CTA BANNER */}
      {/* ==================================================================== */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-950">
            {effectiveFreePlanActive
              ? cta.title
              : cta.title.replace(/14[\s-]*day free trial/gi, 'QuickPostly Platform').replace(/free trial/gi, 'Platform')}
          </h2>
          <p className="text-base sm:text-lg text-slate-950/80 max-w-2xl mx-auto font-medium">
            {cta.highlightText}{' '}
            {effectiveFreePlanActive
              ? cta.description
              : 'Accelerate your audience growth with intelligent category scheduling.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href={effectiveFreePlanActive ? cta.buttonLink : '/pricing'}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-slate-950 text-white hover:bg-slate-900 shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {effectiveFreePlanActive ? cta.buttonText : 'Get Started Today'}
            </Link>
            <Link
              href={cta.secondaryButtonLink}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-white/30 text-slate-950 hover:bg-white/40 border border-slate-950/20 transition-all duration-200"
            >
              {cta.secondaryButtonText}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
