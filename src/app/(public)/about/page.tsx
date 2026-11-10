import React from 'react';
import Link from 'next/link';
import { Target, Lightbulb, Users, Globe2, ShieldCheck, Award, ArrowRight } from 'lucide-react';
import { CmsRepository } from '@/lib/cms/repository';
import { sanitizeHtml } from '@/lib/sanitize';

export const revalidate = 60;

export async function generateMetadata() {
  const page = await CmsRepository.getPageBySlug('about');
  return {
    title: page?.metaTitle || 'About QuickPostly | AI Social Media Management Platform',
    description: page?.metaDescription || 'Learn about QuickPostly mission to help creators, agencies and businesses master social publishing with AI-powered category automation.',
  };
}

export default async function AboutPage() {
  const page = await CmsRepository.getPageBySlug('about');
  const customHtml = page?.contentJson?.bodyHtml as string | undefined;
  const safeHtml = customHtml ? sanitizeHtml(customHtml) : null;

  return (
    <div className="flex flex-col w-full py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-semibold">
            <span>Our Mission & Company</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {page?.title || 'Built to eliminate social media chaos for modern marketing teams'}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {page?.metaDescription ||
              'QuickPostly was engineered to transform how agencies, brands, and solo entrepreneurs publish, engage, and grow across global social networks.'}
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {safeHtml ? (
              <div
                className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base space-y-4"
                dangerouslySetInnerHTML={{ __html: safeHtml }}
              />
            ) : (
              <>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  The Problem with Ordinary Social Schedulers
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                  Traditional social schedulers force you into a daily hamster wheel: write a post, pick a time slot, repeat tomorrow. The result? Inconsistent content varieties, burnt-out social teams, and valuable evergreen insights that disappear after 24 hours.
                </p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                  QuickPostly changes the paradigm with <strong>Category-Based Scheduling</strong> and <strong>Evergreen Content Automation</strong>. You establish intentional content buckets (e.g., Thought Leadership, Industry News, Product Highlights, Customer Stories) and link them to dedicated publishing slots.
                </p>
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-sm font-medium">
                  &quot;Our philosophy is simple: organize your content by value and theme, let the queue optimize delivery, and free up human hours for real relationship-building.&quot;
                </div>
              </>
            )}
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 space-y-6 shadow-xl">
            <h3 className="text-xl font-bold text-amber-400">At a Glance</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Globe2 className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Global Multi-Platform Reach</h4>
                  <p className="text-xs text-slate-400">Connecting seamlessly to X, LinkedIn, Meta, Pinterest, and TikTok APIs.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Enterprise OAuth 2.0 Security</h4>
                  <p className="text-xs text-slate-400">Official certified API connections with bank-grade token encryption.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Lightbulb className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Multi-AI Content Studio</h4>
                  <p className="text-xs text-slate-400">Native intelligence with OpenAI, Gemini, Claude, Grok, and DeepSeek.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Award className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">99.9% Publishing Uptime</h4>
                  <p className="text-xs text-slate-400">BullMQ distributed background workers with automatic rate limit handling.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Grid */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Our Core Commitments</h2>
            <p className="text-slate-500 text-sm">The engineering and product principles guiding QuickPostly.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Strict API Compliance</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We only use documented official developer endpoints. Never reverse-engineered browser automations that risk social account bans.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Zero Customer Data Selling</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your content, client names, and audience metrics belong 100% to you. We never train public AI foundation models on your private drafts.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Continuous Innovation</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Weekly updates supporting new platform post formats (Shorts, Reels, Threads, Carousels) and multi-currency global billing.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="p-10 rounded-3xl bg-slate-900 text-white border border-slate-800 text-center space-y-5">
          <h2 className="text-3xl font-black tracking-tight">Ready to transform your social workflow?</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Join thousands of modern creators and marketing agencies scaling their organic social presence with QuickPostly.
          </p>
          <div>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              <span>Start Free 14-Day Trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
