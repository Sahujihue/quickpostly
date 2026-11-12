'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Shield,
  Sparkles,
  Loader2,
  Save,
  Share2,
  Calendar,
  Bot,
  Users,
  HardDrive,
  MessageSquare,
} from 'lucide-react';
import { CmsPricingPlanRecord } from '@/lib/cms/repository';

interface PlanLimitState {
  maxSocialAccounts: number;
  maxScheduledPosts: number;
  aiGenerationsMonthly: number;
  aiImageCreditsMonthly: number;
  aiVideoCreditsMonthly: number;
  maxTeamMembers: number;
  maxWorkspaces: number;
  maxClients: number;
  storageMb: number;
  analyticsRetentionDays: number;
  hasSocialInbox: boolean;
}

export default function AdminPricingPage() {
  const [plans, setPlans] = useState<CmsPricingPlanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Partial<CmsPricingPlanRecord> | null>(null);
  const [limitsForm, setLimitsForm] = useState<PlanLimitState>({
    maxSocialAccounts: 5,
    maxScheduledPosts: 100,
    aiGenerationsMonthly: 50,
    aiImageCreditsMonthly: 10,
    aiVideoCreditsMonthly: 2,
    maxTeamMembers: 2,
    maxWorkspaces: 1,
    maxClients: 1,
    storageMb: 2048,
    analyticsRetentionDays: 30,
    hasSocialInbox: false,
  });
  const [trialDays, setTrialDays] = useState(14);
  const [customPrice, setCustomPrice] = useState<number | ''>('');
  const [customIntervalDays, setCustomIntervalDays] = useState<number | ''>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [featuresInput, setFeaturesInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/cms/pricing');
      const data = await res.json();
      if (data.success) {
        setPlans(data.data);
      }
    } catch {
      setMessage({ text: 'Failed to load pricing plans', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleTogglePlanActive = async (identifier: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;

    // Instant optimistic UI toggle
    if (identifier.toLowerCase().includes('free') || identifier.toLowerCase().includes('trial')) {
      if (typeof document !== 'undefined') {
        document.cookie = `quickpostly_free_plan_active=${nextStatus}; path=/; max-age=31536000; SameSite=Lax`;
      }
    }

    setPlans((prev) =>
      prev.map((p) =>
        p.id === identifier || p.slug === identifier || (identifier.includes('free') && (p.monthlyPrice === 0 || p.slug.includes('free')))
          ? { ...p, isActive: nextStatus }
          : p
      )
    );

    try {
      setTogglingId(identifier);
      const res = await fetch('/api/v1/admin/cms/pricing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: identifier, isActive: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({
          text: `Plan status updated: ${nextStatus ? 'Activated (ON)' : 'Disabled (OFF)'}`,
          type: 'success',
        });
        fetchPlans();
      } else {
        // Revert on error
        setPlans((prev) =>
          prev.map((p) =>
            p.id === identifier || p.slug === identifier || (identifier.includes('free') && (p.monthlyPrice === 0 || p.slug.includes('free')))
              ? { ...p, isActive: currentStatus }
              : p
          )
        );
        setMessage({ text: data.error?.message || 'Failed to update plan status', type: 'error' });
      }
    } catch {
      // Revert on network error
      setPlans((prev) =>
        prev.map((p) =>
          p.id === identifier || p.slug === identifier || (identifier.includes('free') && (p.monthlyPrice === 0 || p.slug.includes('free')))
            ? { ...p, isActive: currentStatus }
            : p
        )
      );
      setMessage({ text: 'Error toggling plan status', type: 'error' });
    } finally {
      setTogglingId(null);
    }
  };

  const handleOpenAdd = () => {
    setEditingPlan({
      name: '',
      slug: '',
      description: '',
      badge: '',
      monthlyPrice: 49,
      annualPrice: 39,
      currency: 'USD',
      features: ['10 Connected Accounts', 'Unlimited Scheduled Posts', 'AI Post Assistant'],
      isPopular: false,
      isActive: true,
      ctaText: 'Start Free Trial',
      ctaLink: '/signup',
      order: plans.length + 1,
    });
    setLimitsForm({
      maxSocialAccounts: 10,
      maxScheduledPosts: 500,
      aiGenerationsMonthly: 150,
      aiImageCreditsMonthly: 30,
      aiVideoCreditsMonthly: 5,
      maxTeamMembers: 5,
      maxWorkspaces: 3,
      maxClients: 3,
      storageMb: 5120,
      analyticsRetentionDays: 60,
      hasSocialInbox: true,
    });
    setTrialDays(14);
    setCustomPrice('');
    setCustomIntervalDays('');
    setFeaturesInput('10 Connected Accounts\nUnlimited Scheduled Posts\nAI Post Assistant');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: CmsPricingPlanRecord) => {
    setEditingPlan(plan);
    const existingLimits = (plan.limitsJson as Record<string, unknown>) || {};
    setLimitsForm({
      maxSocialAccounts: Number(existingLimits.maxSocialAccounts ?? existingLimits.maxAccounts ?? 5),
      maxScheduledPosts: Number(existingLimits.maxScheduledPosts ?? 150),
      aiGenerationsMonthly: Number(existingLimits.aiGenerationsMonthly ?? existingLimits.aiCredits ?? 75),
      aiImageCreditsMonthly: Number(existingLimits.aiImageCreditsMonthly ?? 15),
      aiVideoCreditsMonthly: Number(existingLimits.aiVideoCreditsMonthly ?? 2),
      maxTeamMembers: Number(existingLimits.maxTeamMembers ?? 2),
      maxWorkspaces: Number(existingLimits.maxWorkspaces ?? 1),
      maxClients: Number(existingLimits.maxClients ?? 1),
      storageMb: Number(existingLimits.storageMb ?? 2048),
      analyticsRetentionDays: Number(existingLimits.analyticsRetentionDays ?? 30),
      hasSocialInbox: Boolean(existingLimits.hasSocialInbox ?? false),
    });
    setTrialDays(Number(existingLimits.trialDays ?? 14));
    setFeaturesInput((plan.features || []).join('\n'));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || !editingPlan.name) return;

    setSaving(true);
    try {
      const features = featuresInput
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = {
        ...editingPlan,
        features,
        monthlyPrice: Number(editingPlan.monthlyPrice),
        annualPrice: Number(editingPlan.annualPrice),
        customPrice: customPrice !== '' ? Number(customPrice) : undefined,
        customIntervalDays: customIntervalDays !== '' ? Number(customIntervalDays) : undefined,
        trialDays: Number(trialDays),
        limitsJson: {
          ...limitsForm,
          trialDays: Number(trialDays),
        },
      };

      const res = await fetch('/api/v1/admin/cms/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Pricing plan and quotas saved successfully', type: 'success' });
        setIsModalOpen(false);
        fetchPlans();
      } else {
        setMessage({ text: data.error?.message || 'Failed to save plan', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error saving plan', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pricing tier?')) return;
    try {
      const res = await fetch(`/api/v1/admin/cms/pricing?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Pricing plan deleted successfully', type: 'success' });
        fetchPlans();
      }
    } catch {
      setMessage({ text: 'Failed to delete plan', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Tag className="w-6 h-6 text-amber-500" />
            <span>Commercial Plans, Pricing &amp; Quota Limits</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure monthly, annual, and custom billing intervals, 14-day trials, and all 11 server-enforced quota limits.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Plan</span>
        </button>
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

      {/* Free Subscription / Free Trial Master Switch Control */}
      {!loading && (() => {
        const freePlan = plans.find(
          (p) => p.slug === 'free-trial' || p.slug === 'free_trial' || p.monthlyPrice === 0
        );
        if (!freePlan) return null;

        return (
          <div className="p-5 rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-slate-900/40 dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Free Subscription &amp; 14-Day Trial Master Switch
                </h2>
                <Badge variant={freePlan.isActive ? 'success' : 'neutral'}>
                  {freePlan.isActive ? 'FREE PLAN: ON (ACTIVE)' : 'FREE PLAN: OFF (DISABLED)'}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Control whether the <strong>Free / 14-day Free Trial</strong> plan is available for user signups. When toggled <strong>OFF</strong>, the free tier is hidden across the public pricing matrix, checkout, and registration, requiring direct paid plans.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
              <div className="text-right">
                <div className={`text-xs font-black uppercase tracking-wider ${freePlan.isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {freePlan.isActive ? 'Free Plan: ON' : 'Free Plan: OFF'}
                </div>
                <div className="text-[10px] text-slate-500">
                  {freePlan.isActive ? 'Users can sign up free' : 'Paid plans only'}
                </div>
              </div>
              <button
                type="button"
                disabled={togglingId === freePlan.id}
                onClick={() => handleTogglePlanActive(freePlan.id, freePlan.isActive)}
                className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                  freePlan.isActive ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
                title="Click to toggle Free Subscription ON/OFF"
              >
                {togglingId === freePlan.id ? (
                  <span className="flex items-center justify-center w-full h-full">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </span>
                ) : (
                  <span
                    className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      freePlan.isActive ? 'translate-x-8' : 'translate-x-0'
                    }`}
                  />
                )}
              </button>
            </div>
          </div>
        );
      })()}

      {/* Grid of Plans */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2 text-amber-500" />
          <span>Loading pricing tiers and quota configurations...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const lim = (plan.limitsJson as Record<string, unknown>) || {};
            const isFree = plan.slug === 'free-trial' || plan.slug === 'free_trial' || plan.monthlyPrice === 0;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 border transition-all flex flex-col justify-between ${
                  plan.isPopular
                    ? 'border-amber-400 bg-amber-50/20 dark:bg-amber-950/20 shadow-lg shadow-amber-500/10'
                    : isFree
                    ? 'border-emerald-500/30 bg-emerald-950/10 dark:bg-emerald-950/10'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{plan.name}</h3>
                      {plan.badge && <Badge variant="warning">{plan.badge}</Badge>}
                      {isFree && <Badge variant="info">Free Tier</Badge>}
                    </div>

                    {/* Interactive ON / OFF Button */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={togglingId === plan.id}
                        onClick={() => handleTogglePlanActive(plan.id, plan.isActive)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          plan.isActive
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700'
                        }`}
                        title={`Click to turn ${plan.name} ${plan.isActive ? 'OFF' : 'ON'}`}
                      >
                        {togglingId === plan.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              plan.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                            }`}
                          />
                        )}
                        <span>{plan.isActive ? 'ON' : 'OFF'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 min-h-[32px]">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-2 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      ${plan.monthlyPrice}
                    </span>
                    <span className="text-xs text-slate-400">
                      / mo (billed annually at ${plan.annualPrice}/mo)
                    </span>
                  </div>

                  {/* Quota Highlights */}
                  <div className="space-y-1.5 mb-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Social Accounts:</span>
                      </span>
                      <strong className="text-slate-900 dark:text-white font-mono">
                        {String(lim.maxSocialAccounts ?? lim.maxAccounts ?? 5)}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        <span>Queue Slots:</span>
                      </span>
                      <strong className="text-slate-900 dark:text-white font-mono">
                        {String(lim.maxScheduledPosts ?? 150)}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Bot className="w-3.5 h-3.5 text-emerald-500" />
                        <span>AI Text Gens:</span>
                      </span>
                      <strong className="text-slate-900 dark:text-white font-mono">
                        {String(lim.aiGenerationsMonthly ?? lim.aiCredits ?? 75)}/mo
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
                        <span>Social Inbox:</span>
                      </span>
                      <strong className={lim.hasSocialInbox ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400'}>
                        {lim.hasSocialInbox ? 'Included' : 'None'}
                      </strong>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2 mb-6">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Included Capabilities
                    </span>
                    <ul className="space-y-1.5">
                      {(plan.features || []).slice(0, 5).map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(plan)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Plan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(plan.id)}
                    className="p-2 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Plan Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan?.id ? `Configure Plan: ${editingPlan.name}` : 'Create Commercial Plan'}
        size="2xl"
      >
        {editingPlan && (
          <form onSubmit={handleSave} className="space-y-5 max-h-[500px] overflow-y-auto pr-2">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  required
                  value={editingPlan.name || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  placeholder="e.g. Professional"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Highlight Badge (Optional)
                </label>
                <input
                  type="text"
                  value={editingPlan.badge || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, badge: e.target.value })}
                  placeholder="e.g. Most Popular"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <input
                type="text"
                value={editingPlan.description || ''}
                onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                placeholder="Target customer value proposition"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Pricing Intervals */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Pricing &amp; Intervals
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Monthly ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingPlan.monthlyPrice ?? 0}
                    onChange={(e) => setEditingPlan({ ...editingPlan, monthlyPrice: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Annual ($/mo)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingPlan.annualPrice ?? 0}
                    onChange={(e) => setEditingPlan({ ...editingPlan, annualPrice: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Trial (Days)</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={trialDays}
                    onChange={(e) => setTrialDays(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Currency</label>
                  <input
                    type="text"
                    value={editingPlan.currency || 'USD'}
                    onChange={(e) => setEditingPlan({ ...editingPlan, currency: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Granular Server-Enforced Limits Form */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Plan Limits (Enforced Server-Side)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Social Accounts</label>
                  <input
                    type="number"
                    min="1"
                    value={limitsForm.maxSocialAccounts}
                    onChange={(e) => setLimitsForm({ ...limitsForm, maxSocialAccounts: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Scheduled Posts</label>
                  <input
                    type="number"
                    min="1"
                    value={limitsForm.maxScheduledPosts}
                    onChange={(e) => setLimitsForm({ ...limitsForm, maxScheduledPosts: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">AI Text Gens/mo</label>
                  <input
                    type="number"
                    min="0"
                    value={limitsForm.aiGenerationsMonthly}
                    onChange={(e) => setLimitsForm({ ...limitsForm, aiGenerationsMonthly: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">AI Image Credits</label>
                  <input
                    type="number"
                    min="0"
                    value={limitsForm.aiImageCreditsMonthly}
                    onChange={(e) => setLimitsForm({ ...limitsForm, aiImageCreditsMonthly: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">AI Video Credits</label>
                  <input
                    type="number"
                    min="0"
                    value={limitsForm.aiVideoCreditsMonthly}
                    onChange={(e) => setLimitsForm({ ...limitsForm, aiVideoCreditsMonthly: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Team Seats</label>
                  <input
                    type="number"
                    min="1"
                    value={limitsForm.maxTeamMembers}
                    onChange={(e) => setLimitsForm({ ...limitsForm, maxTeamMembers: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Workspaces</label>
                  <input
                    type="number"
                    min="1"
                    value={limitsForm.maxWorkspaces}
                    onChange={(e) => setLimitsForm({ ...limitsForm, maxWorkspaces: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Storage (MB)</label>
                  <input
                    type="number"
                    min="100"
                    value={limitsForm.storageMb}
                    onChange={(e) => setLimitsForm({ ...limitsForm, storageMb: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={limitsForm.hasSocialInbox}
                    onChange={(e) => setLimitsForm({ ...limitsForm, hasSocialInbox: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span>Unified Social Inbox Enabled</span>
                </label>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Analytics Retention:</span>
                  <input
                    type="number"
                    value={limitsForm.analyticsRetentionDays}
                    onChange={(e) => setLimitsForm({ ...limitsForm, analyticsRetentionDays: Number(e.target.value) })}
                    className="w-16 px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                  <span>days</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Feature Bullet Points (One per line)
              </label>
              <textarea
                rows={4}
                value={featuresInput}
                onChange={(e) => setFeaturesInput(e.target.value)}
                placeholder="10 Connected Accounts&#10;Unlimited Queuing&#10;Unified Inbox"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={editingPlan.isPopular || false}
                  onChange={(e) => setEditingPlan({ ...editingPlan, isPopular: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span>Highlight as Recommended / Popular</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={editingPlan.isActive ?? true}
                  onChange={(e) => setEditingPlan({ ...editingPlan, isActive: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span>Active for Checkout</span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Configuration</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
