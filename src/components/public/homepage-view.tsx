'use client';

import React, { useState } from 'react';
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
      <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 bg-gradient-to-b from-amber-500/5 via-slate-50/50 to-transparent dark:from-amber-500/5 dark:via-slate-950/20 dark:to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-semibold tracking-wide shadow-xs animate-in fade-in slide-in-from-top-3 duration-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
              <span>{hero.badgeText}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              {hero.headlinePrefix}
              <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent">
                {hero.highlightedPhrase}
              </span>
              {hero.headlineSuffix}
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
              {hero.description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link
                href={hero.primaryCtaLink}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 shadow-lg shadow-amber-400/25 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <span>{hero.primaryCtaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={hero.secondaryCtaLink}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-xs transition-all duration-200"
              >
                <span>{hero.secondaryCtaText}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              {(Array.isArray(hero?.trustPoints) ? hero.trustPoints : [
                'No credit card required',
                '14-day full feature trial',
                'Cancel anytime with 1 click',
              ]).map((point, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ==================================================================== */}
          {/* 2. PRODUCT PREVIEW (Interactive Live Scheduler & Queues) */}
          {/* ==================================================================== */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
            {/* Header / Tabs */}
            <div className="h-14 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-2 py-2 sm:py-0">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs font-mono text-slate-400 hidden sm:inline">
                  app.quickpostly.com/dashboard/queue
                </span>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-900 p-1 rounded-xl">
                <button
                  onClick={() => setActivePreviewTab('queue')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activePreviewTab === 'queue'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Category Queue
                </button>
                <button
                  onClick={() => setActivePreviewTab('ai')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activePreviewTab === 'ai'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  AI Studio
                </button>
                <button
                  onClick={() => setActivePreviewTab('calendar')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activePreviewTab === 'calendar'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Publishing Grid
                </button>
              </div>
            </div>

            {/* TAB CONTENT 1: Category Queue */}
            {activePreviewTab === 'queue' && (
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-500" />
                      <span>Intelligent Category Queues</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Posts automatically slot into their corresponding recurrent timetable slots
                    </p>
                  </div>
                  <Badge variant="amber" size="sm">
                    4 Active Categories • 28 Queued Posts
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Category Card 1 */}
                  <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-950/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          Evergreen Insights
                        </span>
                      </div>
                      <Badge variant="amber" size="sm">
                        <Repeat className="w-3 h-3 mr-1" />
                        Recycling
                      </Badge>
                    </div>
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                      <p className="font-medium line-clamp-2">
                        &quot;Consistency beats intensity every single time in organic B2B audience building. Here are 3 habits...&quot;
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" /> Mon 09:30 AM
                        </span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          X &amp; LinkedIn
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Category Card 2 */}
                  <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-950/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
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
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                      <p className="font-medium line-clamp-2">
                        &quot;Meta announces new creator monetization updates for 2026. What growth managers must know...&quot;
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-500" /> Tue 02:00 PM
                        </span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          LinkedIn &amp; Threads
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Category Card 3 */}
                  <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-950/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
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
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                      <p className="font-medium line-clamp-2">
                        &quot;Ready to free up 15 hours each week? Put your social queue on intelligent autopilot with zero stress...&quot;
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-500" /> Thu 11:15 AM
                        </span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          All 5 Channels
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
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        AI Input Prompt
                      </span>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        &quot;Announce our category-based queue scheduling with a focus on time savings for agencies&quot;
                      </p>
                    </div>
                  </div>
                  <Badge variant="indigo" size="sm">
                    Tone: Thought Leader
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-[#0077b5] flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5" /> LinkedIn Post Preview
                      </span>
                      <span className="text-[11px] text-slate-400">1,120 chars</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      Managing 10+ client social channels shouldn&apos;t feel like a 24/7 spreadsheet sprint.
                      <br /><br />
                      With category-based queuing, agency teams allocate evergreen, promotional, and educational buckets once. QuickPostly handles the rest.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5" /> X Thread Preview (1/4)
                      </span>
                      <span className="text-[11px] text-slate-400">242 / 280 chars</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      Most social posts die in 6 hours.
                      <br /><br />
                      If you aren’t recycling evergreen content through smart category queues, you’re leaving 70% of potential reach on the table.
                      <br /><br />
                      Here is the exact playbook 🧵👇
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: Publishing Grid */}
            {activePreviewTab === 'calendar' && (
              <div className="p-6 md:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span>Weekly Queue Schedule</span>
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Timezone: UTC (Global)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center text-xs">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                    <div key={day} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{day}</span>
                      <div className="space-y-1">
                        <div className="p-1 rounded text-[10px] bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 font-semibold truncate">
                          09:30 Insights
                        </div>
                        {idx % 2 === 0 && (
                          <div className="p-1 rounded text-[10px] bg-indigo-100 text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-300 font-semibold truncate">
                            14:00 News
                          </div>
                        )}
                        {idx === 3 && (
                          <div className="p-1 rounded text-[10px] bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 font-semibold truncate">
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
                  className="p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 shadow-xs hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
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
              {isFreePlanActive
                ? 'Start with a 14-day free trial. Upgrade, downgrade, or cancel anytime.'
                : 'Invest in consistent organic brand growth. Upgrade, downgrade, or cancel anytime.'}
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
            {pricing.map((plan) => {
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
            {cta.title}
          </h2>
          <p className="text-base sm:text-lg text-slate-950/80 max-w-2xl mx-auto font-medium">
            {cta.highlightText} {cta.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href={cta.buttonLink}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-slate-950 text-white hover:bg-slate-900 shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {cta.buttonText}
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
