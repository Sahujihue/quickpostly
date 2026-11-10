'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Tag,
  Clock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Calendar,
  Loader2,
  Edit,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  SubscriptionDTO,
  CouponDTO,
  SubscriptionPlanDTO,
  CouponType,
} from '@/modules/subscriptions/types';

export default function AdminSubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<'SUBSCRIBERS' | 'COUPONS'>('SUBSCRIBERS');
  const [loading, setLoading] = useState(true);

  // Subscriptions & Telemetry
  const [subscriptions, setSubscriptions] = useState<SubscriptionDTO[]>([]);
  const [telemetry, setTelemetry] = useState({
    totalSubscribers: 0,
    activeCount: 0,
    trialingCount: 0,
    pastDueCount: 0,
    canceledCount: 0,
    totalMRR: 0,
    churnRate: 0,
  });

  // Coupons
  const [coupons, setCoupons] = useState<CouponDTO[]>([]);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlanDTO[]>([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [planFilter, setPlanFilter] = useState('ALL');

  // Modals
  const [selectedSub, setSelectedSub] = useState<SubscriptionDTO | null>(null);
  const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);
  const [newPlanSlug, setNewPlanSlug] = useState('professional');

  const [isExtendTrialModalOpen, setIsExtendTrialModalOpen] = useState(false);
  const [trialDaysToAdd, setTrialDaysToAdd] = useState(14);

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [freePlanToggling, setFreePlanToggling] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'PERCENTAGE' as CouponType,
    discountValue: 20,
    maxRedemptions: 100,
    perUserLimit: 1,
    applicablePlanSlugs: 'all',
    expiresInDays: 60,
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Subscriptions
      const subRes = await fetch(
        `/api/v1/admin/subscriptions?search=${encodeURIComponent(searchTerm)}&status=${statusFilter}&plan=${planFilter}`
      );
      const subJson = await subRes.json();
      if (subJson.success) {
        setSubscriptions(subJson.data.subscriptions || []);
        setTelemetry(subJson.data.telemetry || {});
      }

      // Fetch Coupons
      const coupRes = await fetch('/api/v1/admin/coupons');
      const coupJson = await coupRes.json();
      if (coupJson.success) {
        setCoupons(coupJson.data || []);
      }

      // Fetch Plans for modals
      const planRes = await fetch('/api/v1/admin/cms/pricing');
      const planJson = await planRes.json();
      if (planJson.success) {
        setAvailablePlans(planJson.data || []);
      }
    } catch {
      setMessage({ type: 'error', text: 'Error loading subscription telemetry' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, statusFilter, planFilter]);

  // Handle Manual Plan Change
  const handleChangePlan = async () => {
    if (!selectedSub) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/subscriptions/${selectedSub.id}/plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planSlug: newPlanSlug }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Plan updated to ${newPlanSlug}` });
        setIsChangePlanModalOpen(false);
        fetchData();
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Plan update failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error updating plan' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Trial Extension
  const handleExtendTrial = async () => {
    if (!selectedSub) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/subscriptions/${selectedSub.id}/trial`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ additionalDays: trialDaysToAdd }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Trial extended by ${trialDaysToAdd} days` });
        setIsExtendTrialModalOpen(false);
        fetchData();
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Trial extension failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error extending trial' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Simulate Payment Failure
  const handleSimulateFailure = async (subId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/subscriptions/${subId}/simulate-payment-failure`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Payment failure simulated. Workspace entered 7-day grace period.' });
        fetchData();
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to simulate payment decline' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Retry Payment
  const handleRetryPayment = async (subId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/subscriptions/${subId}/retry-payment`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Payment recovered successfully. Active status restored.' });
        fetchData();
      }
    } catch {
      setMessage({ type: 'error', text: 'Retry payment error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Cancel Subscription
  const handleAdminCancel = async (subId: string) => {
    if (!confirm('Cancel this subscription immediately?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/subscriptions/${subId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELED', reason: 'Administrative cancellation' }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Subscription canceled by administrator' });
        fetchData();
      }
    } catch {
      setMessage({ type: 'error', text: 'Cancellation failed' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Free Plan ON / OFF Toggle
  const handleToggleFreePlan = async () => {
    const freePlan = availablePlans.find(
      (p) => p.slug === 'free-trial' || p.slug === 'free_trial' || p.monthlyPrice === 0
    );
    if (!freePlan) {
      setMessage({ type: 'error', text: 'Free plan not found in pricing registry' });
      return;
    }
    try {
      setFreePlanToggling(true);
      const nextStatus = !freePlan.isActive;
      const res = await fetch('/api/v1/admin/cms/pricing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: freePlan.id, isActive: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({
          type: 'success',
          text: `Free Subscription / Trial tier is now ${nextStatus ? 'Activated (ON)' : 'Disabled (OFF)'}`,
        });
        fetchData();
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Failed to update free plan status' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error toggling free plan' });
    } finally {
      setFreePlanToggling(false);
    }
  };

  // Handle Create Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const expiresAt = new Date(Date.now() + couponForm.expiresInDays * 86400000).toISOString();
      const planSlugs = couponForm.applicablePlanSlugs.split(',').map((s) => s.trim().toLowerCase());

      const res = await fetch('/api/v1/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponForm.code,
          discountType: couponForm.discountType,
          discountValue: Number(couponForm.discountValue),
          maxRedemptions: Number(couponForm.maxRedemptions),
          perUserLimit: Number(couponForm.perUserLimit),
          applicablePlanSlugs: planSlugs,
          expiresAt,
          isActive: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Coupon '${couponForm.code}' created successfully` });
        setIsCouponModalOpen(false);
        setCouponForm({
          code: '',
          discountType: 'PERCENTAGE',
          discountValue: 20,
          maxRedemptions: 100,
          perUserLimit: 1,
          applicablePlanSlugs: 'all',
          expiresInDays: 60,
        });
        fetchData();
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Failed to create coupon' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error creating coupon' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Coupon
  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Permanently delete this coupon code?')) return;
    try {
      const res = await fetch(`/api/v1/admin/coupons/${couponId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Coupon deleted' });
        fetchData();
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete coupon' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Subscription &amp; MRR Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track platform MRR, enforce quotas, manage subscriber lifecycles, and configure promotional coupons.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1">
            <button
              onClick={() => setActiveTab('SUBSCRIBERS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'SUBSCRIBERS' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-400'
              }`}
            >
              Subscribers ({telemetry.totalSubscribers})
            </button>
            <button
              onClick={() => setActiveTab('COUPONS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'COUPONS' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-400'
              }`}
            >
              Coupons ({coupons.length})
            </button>
          </div>
          {activeTab === 'COUPONS' && (
            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Coupon</span>
            </button>
          )}
        </div>
      </div>

      {/* MRR & SaaS Telemetry Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Monthly Recurring Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">${telemetry.totalMRR.toLocaleString()}</div>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +18.4% from last cycle
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Active Subscribers</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{telemetry.activeCount}</div>
          <span className="text-[11px] text-slate-400">Paid billing accounts</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">14-Day Free Trials</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{telemetry.trialingCount}</div>
          <span className="text-[11px] text-slate-400">Potential conversion cohort</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Grace Period / Past Due</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{telemetry.pastDueCount}</div>
          <span className="text-[11px] text-slate-400">Churn rate: {telemetry.churnRate}%</span>
        </div>
      </div>

      {/* Free Subscription & Free Trial Access Control Banner */}
      {(() => {
        const freePlan = availablePlans.find(
          (p) => p.slug === 'free-trial' || p.slug === 'free_trial' || p.monthlyPrice === 0
        );
        if (!freePlan) return null;

        return (
          <div className="p-4 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Free Subscription &amp; 14-Day Trial Access</h3>
                  <Badge variant={freePlan.isActive ? 'success' : 'neutral'}>
                    {freePlan.isActive ? 'Active (ON)' : 'Disabled (OFF)'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {freePlan.isActive
                    ? 'Free trial is ENABLED: Visitors can create free trial workspaces without upfront payment.'
                    : 'Free trial is DISABLED: New signups require an active paid subscription tier.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-xs font-bold ${freePlan.isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                {freePlan.isActive ? 'ON' : 'OFF'}
              </span>
              <button
                type="button"
                disabled={freePlanToggling}
                onClick={handleToggleFreePlan}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                  freePlan.isActive ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
                title="Toggle Free Plan ON / OFF"
              >
                {freePlanToggling ? (
                  <span className="flex items-center justify-center w-full h-full">
                    <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                  </span>
                ) : (
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      freePlan.isActive ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                )}
              </button>
            </div>
          </div>
        );
      })()}

      {activeTab === 'SUBSCRIBERS' ? (
        /* SUBSCRIBERS DIRECTORY & ACTIONS */
        <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xs overflow-hidden space-y-4">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search workspace or plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="TRIALING">Trialing</option>
                <option value="GRACE_PERIOD">Grace Period</option>
                <option value="PAST_DUE">Past Due</option>
                <option value="CANCELED">Canceled</option>
              </select>

              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Plans</option>
                <option value="free-trial">Free Trial</option>
                <option value="starter">Starter</option>
                <option value="professional">Professional</option>
                <option value="business">Business</option>
                <option value="agency">Agency</option>
              </select>
            </div>
          </div>

          {/* Subscribers Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Workspace / ID</th>
                  <th className="px-4 py-3.5">Current Tier</th>
                  <th className="px-4 py-3.5">Cycle</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Period End</th>
                  <th className="px-4 py-3.5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                      No subscriptions match query.
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((s) => {
                    const statusBadge =
                      s.status === 'ACTIVE'
                        ? 'emerald'
                        : s.status === 'TRIALING'
                        ? 'amber'
                        : s.status === 'GRACE_PERIOD'
                        ? 'warning'
                        : s.status === 'PAST_DUE'
                        ? 'danger'
                        : 'slate';

                    return (
                      <tr key={s.id} className="hover:bg-slate-800/40">
                        <td className="px-5 py-4">
                          <div className="font-bold text-white">{s.workspaceId}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{s.userId}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-semibold text-slate-200">{s.planName}</span>
                          {s.activeCouponCode && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-amber-400/20 text-amber-400 font-mono">
                              {s.activeCouponCode}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-slate-400 font-medium">{s.billingInterval}</td>
                        <td className="px-4 py-4 font-bold text-white font-mono">
                          ${s.amount} {s.currency}
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={statusBadge} size="sm">
                            {s.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-slate-400">
                          {new Date(s.currentPeriodEnd).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Override Plan */}
                            <button
                              onClick={() => {
                                setSelectedSub(s);
                                setNewPlanSlug(s.planSlug);
                                setIsChangePlanModalOpen(true);
                              }}
                              title="Change Plan Manually"
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold"
                            >
                              Edit Plan
                            </button>

                            {/* Extend Trial */}
                            {s.status === 'TRIALING' && (
                              <button
                                onClick={() => {
                                  setSelectedSub(s);
                                  setIsExtendTrialModalOpen(true);
                                }}
                                title="Extend Trial Duration"
                                className="px-2 py-1 rounded bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 text-[11px] font-semibold"
                              >
                                +Days
                              </button>
                            )}

                            {/* Payment recovery / failure testing */}
                            {s.status === 'GRACE_PERIOD' || s.status === 'PAST_DUE' ? (
                              <button
                                onClick={() => handleRetryPayment(s.id)}
                                title="Retry & Recover Payment"
                                className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold"
                              >
                                Recover
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSimulateFailure(s.id)}
                                title="Simulate Failed Billing Charge (Grace Period)"
                                className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-semibold"
                              >
                                Fail Charge
                              </button>
                            )}

                            {/* Cancel */}
                            {s.status !== 'CANCELED' && (
                              <button
                                onClick={() => handleAdminCancel(s.id)}
                                title="Cancel Subscription"
                                className="p-1 rounded text-slate-500 hover:text-rose-400"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* COUPONS MANAGEMENT TAB */
        <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">Promotional Coupons &amp; Discounts</h3>
              <p className="text-xs text-slate-400">
                Percentage or fixed discounts with usage caps, per-user limits, and plan restrictions.
              </p>
            </div>
            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Coupon</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-4 py-3.5">Discount</th>
                  <th className="px-4 py-3.5">Redemptions</th>
                  <th className="px-4 py-3.5">Applicable Tiers</th>
                  <th className="px-4 py-3.5">Expires</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40">
                    <td className="px-5 py-4 font-mono font-bold text-amber-400 text-sm">{c.code}</td>
                    <td className="px-4 py-4 font-bold text-white">
                      {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `$${c.discountValue} FIXED`}
                    </td>
                    <td className="px-4 py-4 text-slate-300 font-mono">
                      {c.redemptionsCount} / {c.maxRedemptions}
                    </td>
                    <td className="px-4 py-4 text-slate-400">
                      {(c.applicablePlanSlugs || []).join(', ')}
                    </td>
                    <td className="px-4 py-4 text-slate-400">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={c.isActive ? 'emerald' : 'slate'} size="sm">
                        {c.isActive ? 'Active' : 'Disabled'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleDeleteCoupon(c.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Admin Change Plan */}
      <Modal
        isOpen={isChangePlanModalOpen}
        onClose={() => setIsChangePlanModalOpen(false)}
        title={`Change Plan for ${selectedSub?.workspaceId || ''}`}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Super Admin override: Change the subscription tier directly. Limits and quotas will recalculate immediately.
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">Select New Plan Tier</label>
            <select
              value={newPlanSlug}
              onChange={(e) => setNewPlanSlug(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white"
            >
              <option value="free-trial">Free Trial ($0)</option>
              <option value="starter">Starter ($29/mo)</option>
              <option value="professional">Professional ($79/mo)</option>
              <option value="business">Business ($149/mo)</option>
              <option value="agency">Agency ($299/mo)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={() => setIsChangePlanModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleChangePlan}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-500 text-slate-950 disabled:opacity-50"
            >
              Confirm Override
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: Extend Trial */}
      <Modal
        isOpen={isExtendTrialModalOpen}
        onClose={() => setIsExtendTrialModalOpen(false)}
        title={`Extend Free Trial for ${selectedSub?.workspaceId || ''}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Grant additional evaluation days to this workspace before automated trial expiration.
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">Additional Days</label>
            <input
              type="number"
              min="1"
              max="90"
              value={trialDaysToAdd}
              onChange={(e) => setTrialDaysToAdd(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={() => setIsExtendTrialModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleExtendTrial}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-500 text-slate-950"
            >
              Extend Trial
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: Create Coupon */}
      <Modal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        title="Create Promotional Coupon"
        size="md"
      >
        <form onSubmit={handleCreateCoupon} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">Coupon Code</label>
              <input
                type="text"
                required
                placeholder="e.g. SUMMER50"
                value={couponForm.code}
                onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white uppercase font-mono font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">Discount Type</label>
              <select
                value={couponForm.discountType}
                onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as CouponType })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white"
              >
                <option value="PERCENTAGE">Percentage (% Off)</option>
                <option value="FIXED">Fixed Amount ($ Off)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">Discount Value</label>
              <input
                type="number"
                required
                min="1"
                value={couponForm.discountValue}
                onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">Max Redemptions</label>
              <input
                type="number"
                required
                min="1"
                value={couponForm.maxRedemptions}
                onChange={(e) => setCouponForm({ ...couponForm, maxRedemptions: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">Expires (Days)</label>
              <input
                type="number"
                min="1"
                value={couponForm.expiresInDays}
                onChange={(e) => setCouponForm({ ...couponForm, expiresInDays: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">Applicable Plan Slugs</label>
            <input
              type="text"
              placeholder="all OR professional, business, agency"
              value={couponForm.applicablePlanSlugs}
              onChange={(e) => setCouponForm({ ...couponForm, applicablePlanSlugs: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white"
            />
            <span className="text-[10px] text-slate-500">Comma-separated plan slugs, or &apos;all&apos; for universal tier access.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCouponModalOpen(false)}
              className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-500 text-slate-950 disabled:opacity-50"
            >
              Create Coupon
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
