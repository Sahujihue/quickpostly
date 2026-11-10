'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sliders, Save, Loader2, ExternalLink, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import { HeroSectionDto } from '@/modules/cms/types';

export default function AdminHomepageManagerPage() {
  const [hero, setHero] = useState<HeroSectionDto>({
    badgeText: 'Intelligent Category Queuing + Multi-Channel AI Copilot',
    headlinePrefix: 'Put your social media on ',
    highlightedPhrase: 'intelligent autopilot',
    headlineSuffix: '',
    description:
      'Organize posts into strategic content categories, automate balanced publishing slots, recycle your highest-performing evergreen content, and manage multi-client approval workflows without daily stress.',
    primaryCtaText: 'Start Free 14-Day Trial',
    primaryCtaLink: '/signup',
    secondaryCtaText: 'Explore App Dashboard',
    secondaryCtaLink: '/dashboard',
    trustPoints: [
      'No credit card required',
      '14-day full feature trial',
      'Cancel in 1-click anytime',
      'Official social API certified',
    ],
  });

  const [ctaBanner, setCtaBanner] = useState({
    title: 'Ready to free up 15+ hours each week with intelligent social scheduling?',
    subtitle: 'Join over 2,400+ high-growth brands and multi-client marketing agencies running their publishing pipelines on QuickPostly.',
    buttonText: 'Start Your 14-Day Free Trial',
    buttonLink: '/signup',
  });

  const [trustInput, setTrustInput] = useState(
    'No credit card required\n14-day full feature trial\nCancel in 1-click anytime\nOfficial social API certified'
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchHomepageData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/cms/pages');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const homePage = data.data.find((p: any) => p.slug === 'home');
        if (homePage?.contentJson?.hero) {
          const h = homePage.contentJson.hero;
          setHero((prev) => ({
            ...prev,
            ...h,
          }));
          if (Array.isArray(h.trustPoints)) {
            setTrustInput(h.trustPoints.join('\n'));
          }
        }
        if (homePage?.contentJson?.ctaBanner) {
          setCtaBanner((prev) => ({
            ...prev,
            ...homePage.contentJson.ctaBanner,
          }));
        }
      }
    } catch {
      setMessage({ text: 'Failed to load existing homepage content', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomepageData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const trustPoints = trustInput
        .split('\n')
        .map((p) => p.trim())
        .filter(Boolean);

      const payload = {
        title: 'Home - Intelligent Social Media Automation',
        slug: 'home',
        contentJson: {
          hero: {
            ...hero,
            trustPoints,
          },
          ctaBanner,
        },
      };

      const res = await fetch('/api/v1/admin/cms/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Homepage hero and copy saved and published live', type: 'success' });
      } else {
        setMessage({ text: 'Failed to update homepage', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error saving homepage copy', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading homepage builder content...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-indigo-500" />
            <span>Homepage Content & Hero Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Customize primary hero headlines, punchlines, CTA buttons, and trust badges without source code changes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchHomepageData}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload</span>
          </button>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Site</span>
          </Link>
        </div>
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

      {/* Hero Form */}
      <form onSubmit={handleSave} className="space-y-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Hero Banner & Value Proposition</h2>
          <p className="text-xs text-slate-500">Above-the-fold content visible to all first-time visitors.</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Top Badge Announcement
          </label>
          <input
            type="text"
            value={hero.badgeText}
            onChange={(e) => setHero({ ...hero, badgeText: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Headline Prefix
            </label>
            <input
              type="text"
              value={hero.headlinePrefix}
              onChange={(e) => setHero({ ...hero, headlinePrefix: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Highlighted Gradient Phrase
            </label>
            <input
              type="text"
              value={hero.highlightedPhrase}
              onChange={(e) => setHero({ ...hero, highlightedPhrase: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Core Subtitle & Product Summary
          </label>
          <textarea
            rows={3}
            value={hero.description}
            onChange={(e) => setHero({ ...hero, description: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Primary Button Text
            </label>
            <input
              type="text"
              value={hero.primaryCtaText}
              onChange={(e) => setHero({ ...hero, primaryCtaText: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Primary Button Target URL
            </label>
            <input
              type="text"
              value={hero.primaryCtaLink}
              onChange={(e) => setHero({ ...hero, primaryCtaLink: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Secondary Button Text
            </label>
            <input
              type="text"
              value={hero.secondaryCtaText}
              onChange={(e) => setHero({ ...hero, secondaryCtaText: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Secondary Button Target URL
            </label>
            <input
              type="text"
              value={hero.secondaryCtaLink}
              onChange={(e) => setHero({ ...hero, secondaryCtaLink: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Trust Checkmarks (One bullet per line)
          </label>
          <textarea
            rows={4}
            value={trustInput}
            onChange={(e) => setTrustInput(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
          />
        </div>

        {/* Closing CTA Banner Settings */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Closing Bottom CTA Banner</h2>
            <p className="text-xs text-slate-500">The high-conversion banner displayed right before the footer.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Banner Headline
            </label>
            <input
              type="text"
              value={ctaBanner.title}
              onChange={(e) => setCtaBanner({ ...ctaBanner, title: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Banner Subtitle
            </label>
            <textarea
              rows={2}
              value={ctaBanner.subtitle}
              onChange={(e) => setCtaBanner({ ...ctaBanner, subtitle: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Banner Button Label
              </label>
              <input
                type="text"
                value={ctaBanner.buttonText}
                onChange={(e) => setCtaBanner({ ...ctaBanner, buttonText: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Banner Button URL
              </label>
              <input
                type="text"
                value={ctaBanner.buttonLink}
                onChange={(e) => setCtaBanner({ ...ctaBanner, buttonLink: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save & Publish Live</span>
          </button>
        </div>
      </form>
    </div>
  );
}
