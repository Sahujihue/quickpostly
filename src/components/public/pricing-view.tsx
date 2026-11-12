'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Sparkles, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { PricingPlanDto, FaqItemDto } from '@/modules/cms/types';

interface PricingViewProps {
  plans: PricingPlanDto[];
  faqs: FaqItemDto[];
  isFreePlanActive?: boolean;
}

export function PricingView({ plans, faqs, isFreePlanActive = true }: PricingViewProps) {
  const [isAnnual, setIsAnnual] = useState(true);

  // Real-time cookie and API synchronization for instant toggle reflection
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

  const defaultFreePlan: PricingPlanDto = {
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

  const allPlans = [...plans];
  if (effectiveFreePlanActive) {
    const hasFree = allPlans.some(
      (p) => p.slug === 'free-trial' || p.slug === 'free_trial' || p.monthlyPrice === 0
    );
    if (!hasFree) {
      allPlans.unshift(defaultFreePlan);
    }
  }

  const displayedPlans = (effectiveFreePlanActive
    ? allPlans
    : allPlans.filter(
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

  return (
    <div className="flex flex-col w-full py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-semibold">
            <span>Simple, Transparent SaaS Pricing</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Plans built to scale with your content ambition
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {effectiveFreePlanActive
              ? 'All plans include category scheduling, multi-channel publishing, and our 14-day free trial. No setup fees.'
              : 'All plans include category scheduling, multi-channel publishing, and instant workspace setup. No setup fees.'}
          </p>

          {/* Billing Interval Toggle */}
          <div className="pt-6 flex items-center justify-center gap-3">
            <span
              className={`text-sm font-semibold cursor-pointer ${
                !isAnnual ? 'text-slate-950 dark:text-white' : 'text-slate-500'
              }`}
              onClick={() => setIsAnnual(false)}
            >
              Billed Monthly
            </span>
            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              aria-label="Toggle annual billing"
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isAnnual ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isAnnual ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-sm font-semibold cursor-pointer ${
                  isAnnual ? 'text-slate-950 dark:text-white' : 'text-slate-500'
                }`}
                onClick={() => setIsAnnual(true)}
              >
                Billed Annually
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                Save 20%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {displayedPlans.map((plan) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const isPro = plan.isPopular;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between p-8 rounded-3xl transition-all ${
                  isPro
                    ? 'border-2 border-amber-500 bg-white dark:bg-slate-900 shadow-xl shadow-amber-500/10 scale-100 lg:-translate-y-2'
                    : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-sm">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 min-h-[40px]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
                      ${price}
                    </span>
                    <span className="text-sm text-slate-500 font-medium">/ month</span>
                  </div>
                  {isAnnual && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      Billed annually (${price * 12}/year)
                    </p>
                  )}

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Included Capabilities:
                    </span>
                    <ul className="space-y-3 text-sm">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-8">
                  <Link
                    href={plan.ctaLink}
                    className={`w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-bold transition-all shadow-sm ${
                      isPro
                        ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-amber-400/25'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison feature table teaser */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Enterprise & Custom White-Label Requirements?
              </h3>
              <p className="text-sm text-slate-500">
                We support 100+ profiles, dedicated IP pools, custom SSO/SAML, and bespoke API webhooks.
              </p>
            </div>
            <Link
              href="/contact?plan=enterprise"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold shrink-0"
            >
              <span>Speak with Solutions Architect</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-8 pt-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Frequently Asked Questions
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Everything you need to know about plans & billing
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm"
              >
                <div className="flex items-start gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{faq.question}</h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-7 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
