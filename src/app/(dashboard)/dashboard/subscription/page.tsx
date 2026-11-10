'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Check,
  Zap,
  Download,
  AlertCircle,
  Building2,
  Share2,
  Bot,
  Users,
  HardDrive,
  MessageSquare,
  Sparkles,
  Loader2,
  Calendar,
  Tag,
  ShieldCheck,
  X,
  FileText,
  Printer,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  SubscriptionDTO,
  SubscriptionPlanDTO,
  InvoiceDTO,
  WorkspaceUsageDTO,
  SubscriptionBillingInterval,
} from '@/modules/subscriptions/types';

export default function SubscriptionBillingPage() {
  const [loading, setLoading] = useState(true);
  const [subData, setSubData] = useState<{
    subscription: SubscriptionDTO;
    usage: WorkspaceUsageDTO;
    metrics: Record<string, { current: number; max: number; percentUsed: number; label: string; unit: string }>;
    availablePlans: SubscriptionPlanDTO[];
    invoices: InvoiceDTO[];
    canOperate: boolean;
    statusMessage?: string;
  } | null>(null);

  // Upgrade / Downgrade Modal State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedPlanSlug, setSelectedPlanSlug] = useState<string>('professional');
  const [billingCycle, setBillingCycle] = useState<SubscriptionBillingInterval>('MONTHLY');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState<{
    valid: boolean;
    discountPercent: number;
    discountAmount: number;
    finalAmount: number;
    message?: string;
  } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);

  // Cancellation Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Too expensive for current volume');
  const [cancelImmediate, setCancelImmediate] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // Invoice Detail Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDTO | null>(null);

  // Global Alert feedback
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/subscriptions/current?workspaceId=ws_peak_scale');
      const json = await res.json();
      if (json.success) {
        setSubData(json.data);
        if (json.data.subscription) {
          setSelectedPlanSlug(json.data.subscription.planSlug);
          setBillingCycle(json.data.subscription.billingInterval);
        }
      }
    } catch {
      setNotification({ type: 'error', message: 'Unable to load subscription details.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponDiscount(null);
    try {
      const targetPlan = subData?.availablePlans.find((p) => p.slug === selectedPlanSlug);
      const baseAmount = billingCycle === 'YEARLY' ? (targetPlan?.annualPrice || 0) * 12 : (targetPlan?.monthlyPrice || 0);

      const res = await fetch('/api/v1/subscriptions/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          planSlug: selectedPlanSlug,
          amount: baseAmount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCouponDiscount(data.data);
      } else {
        setCouponDiscount({
          valid: false,
          discountPercent: 0,
          discountAmount: 0,
          finalAmount: baseAmount,
          message: data.error?.message || 'Invalid or expired coupon',
        });
      }
    } catch {
      setCouponDiscount({
        valid: false,
        discountPercent: 0,
        discountAmount: 0,
        finalAmount: 0,
        message: 'Coupon service temporarily unavailable',
      });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleConfirmPlanChange = async () => {
    if (!subData) return;
    setIsSubmittingPlan(true);
    try {
      const res = await fetch('/api/v1/subscriptions/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subData.subscription.id,
          newPlanSlug: selectedPlanSlug,
          interval: billingCycle,
          couponCode: couponDiscount?.valid ? couponCode.trim() : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setNotification({ type: 'success', message: json.message || 'Subscription plan updated successfully.' });
        setIsPlanModalOpen(false);
        fetchSubscription();
      } else {
        setNotification({ type: 'error', message: json.error?.message || 'Failed to update plan.' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Network error processing plan update.' });
    } finally {
      setIsSubmittingPlan(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!subData) return;
    setIsCanceling(true);
    try {
      const res = await fetch('/api/v1/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subData.subscription.id,
          reason: cancelReason,
          cancelImmediately: cancelImmediate,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setNotification({
          type: 'success',
          message: cancelImmediate
            ? 'Subscription has been canceled immediately.'
            : 'Subscription will cancel at the end of the current billing cycle.',
        });
        setIsCancelModalOpen(false);
        fetchSubscription();
      } else {
        setNotification({ type: 'error', message: json.error?.message || 'Cancellation failed.' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Network error processing cancellation.' });
    } finally {
      setIsCanceling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm text-slate-500">Loading commercial subscription telemetry...</p>
      </div>
    );
  }

  const sub = subData?.subscription;
  const metrics = subData?.metrics;
  const plans = subData?.availablePlans || [];
  const invoices = subData?.invoices || [];

  const statusVariant =
    sub?.status === 'ACTIVE'
      ? 'emerald'
      : sub?.status === 'TRIALING'
      ? 'amber'
      : sub?.status === 'GRACE_PERIOD'
      ? 'warning'
      : sub?.status === 'PAST_DUE'
      ? 'danger'
      : 'slate';

  return (
    <div className="space-y-6">
      {/* Alert Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
          }`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Subscription &amp; Commercial Billing
            </h1>
            <Badge variant={statusVariant} size="sm">
              <Zap className="w-3 h-3 mr-1" />
              {sub?.planName} Tier ({sub?.status})
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time server-side quota enforcement, billing cycles, coupon redemptions, and verifiable invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlanModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-500 text-slate-950 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Change Plan</span>
          </button>
          {sub?.status !== 'CANCELED' && (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
            >
              Cancel Plan
            </button>
          )}
        </div>
      </div>

      {/* Grace Period / Status Alert Banner */}
      {sub?.status === 'GRACE_PERIOD' && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <p className="font-bold">Attention: Workspace operating in 7-day Payment Grace Period</p>
            <p>
              Your latest recurring charge failed. Features remain active until{' '}
              {sub.gracePeriodEnd ? new Date(sub.gracePeriodEnd).toLocaleDateString() : 'soon'}. Please update payment method or retry charge to avoid service interruption.
            </p>
          </div>
        </div>
      )}

      {/* Active Subscription Summary & Quota Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Subscription Card (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Plan</span>
            <Badge variant={statusVariant} size="sm">
              {sub?.status} • {sub?.billingInterval}
            </Badge>
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{sub?.planName} Plan</h2>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">${sub?.amount}</span>
              <span className="text-xs text-slate-500">
                {sub?.billingInterval === 'YEARLY' ? '/ billed annually' : '/ billed monthly'}
              </span>
            </div>
            {sub?.discountPercent ? (
              <p className="text-xs text-emerald-500 font-semibold mt-1">
                Active Coupon Applied ({sub.discountPercent}% discount)
              </p>
            ) : null}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <div className="flex items-center justify-between font-semibold">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>Next Billing / Renewal</span>
              </span>
              <span className="text-slate-900 dark:text-white font-mono">
                {sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Payment Method</span>
              </span>
              <span className="font-mono text-slate-900 dark:text-white">Visa ending in 4242</span>
            </div>
            {sub?.cancelAtPeriodEnd && (
              <div className="pt-1 text-rose-500 font-semibold">
                Will cancel on {new Date(sub.currentPeriodEnd).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setIsPlanModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 text-xs font-bold transition-all"
            >
              Upgrade or Switch Billing Interval
            </button>
          </div>
        </div>

        {/* Right: Server-Enforced Quota Progress (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Server-Enforced Quota Limits</h3>
            <span className="text-xs text-slate-400">Strict Server-Side Validation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Social Accounts */}
            {metrics?.socialAccounts && (
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Social Accounts</span>
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {metrics.socialAccounts.current} / {metrics.socialAccounts.max}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      metrics.socialAccounts.percentUsed >= 90
                        ? 'bg-rose-500'
                        : metrics.socialAccounts.percentUsed >= 70
                        ? 'bg-amber-500'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${metrics.socialAccounts.percentUsed}%` }}
                  />
                </div>
              </div>
            )}

            {/* Scheduled Posts */}
            {metrics?.scheduledPosts && (
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>Scheduled Queue Slots</span>
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {metrics.scheduledPosts.current} / {metrics.scheduledPosts.max}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${metrics.scheduledPosts.percentUsed}%` }}
                  />
                </div>
              </div>
            )}

            {/* AI Text Generations */}
            {metrics?.aiGenerations && (
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Bot className="w-3.5 h-3.5 text-emerald-500" />
                    <span>AI Copilot Generations</span>
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {metrics.aiGenerations.current} / {metrics.aiGenerations.max}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${metrics.aiGenerations.percentUsed}%` }}
                  />
                </div>
              </div>
            )}

            {/* AI Image Credits */}
            {metrics?.aiImageCredits && (
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                    <span>AI Image Credits</span>
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {metrics.aiImageCredits.current} / {metrics.aiImageCredits.max}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sky-500"
                    style={{ width: `${metrics.aiImageCredits.percentUsed}%` }}
                  />
                </div>
              </div>
            )}

            {/* Team Members */}
            {metrics?.teamMembers && (
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Users className="w-3.5 h-3.5 text-purple-500" />
                    <span>Team Seats</span>
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {metrics.teamMembers.current} / {metrics.teamMembers.max}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-purple-500"
                    style={{ width: `${metrics.teamMembers.percentUsed}%` }}
                  />
                </div>
              </div>
            )}

            {/* Cloud Storage */}
            {metrics?.storageMb && (
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <HardDrive className="w-3.5 h-3.5 text-rose-500" />
                    <span>Storage (MB)</span>
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {metrics.storageMb.current} MB / {metrics.storageMb.max} MB
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-rose-500"
                    style={{ width: `${metrics.storageMb.percentUsed}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
              <span>Unified Social Inbox:</span>
              <strong className={sub?.limits.hasSocialInbox ? 'text-emerald-500' : 'text-slate-400'}>
                {sub?.limits.hasSocialInbox ? 'Enabled' : 'Disabled (Requires Pro+)'}
              </strong>
            </span>
            <span>Analytics Retention: <strong>{sub?.limits.analyticsRetentionDays} Days</strong></span>
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Invoicing &amp; Payment Ledger</h3>
            <p className="text-xs text-slate-500">Official commercial receipts generated for tax and accounting.</p>
          </div>
          <span className="text-xs font-mono text-slate-400">{invoices.length} Invoices</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Invoice Number</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Subscription Tier</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No billing invoices generated yet.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {new Date(inv.periodStart).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                      {inv.planName}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                      ${inv.totalAmount.toFixed(2)} {inv.currency}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="emerald" size="sm">
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice(inv)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-amber-400 hover:text-slate-950 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Upgrade / Downgrade Plan & Coupon Application */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title="Select Subscription Plan"
        size="2xl"
      >
        <div className="space-y-6">
          {/* Billing Interval Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Billing Cycle</p>
              <p className="text-xs text-slate-500">Save 20% on all tiers when billed annually.</p>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-200 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setBillingCycle('YEARLY')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  billingCycle === 'YEARLY'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Annual (-20%)
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('MONTHLY')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  billingCycle === 'MONTHLY'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[380px] overflow-y-auto pr-1">
            {plans.map((p) => {
              const isSelected = selectedPlanSlug === p.slug;
              const price = billingCycle === 'YEARLY' ? p.annualPrice : p.monthlyPrice;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlanSlug(p.slug)}
                  className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'border-amber-400 bg-amber-50/20 dark:bg-amber-950/20 ring-2 ring-amber-400'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">{p.name}</span>
                      {p.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-500">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">${price}</span>
                      <span className="text-xs text-slate-500">/ mo</span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300 pt-1">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{p.limits.maxSocialAccounts} Accounts</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{p.limits.maxScheduledPosts} Queue Slots</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{p.limits.aiGenerationsMonthly} AI Credits/mo</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{p.limits.hasSocialInbox ? 'Unified Inbox Included' : 'No Inbox'}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-3">
                    <div
                      className={`w-full py-1.5 rounded-lg text-center text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select Tier'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coupon Code Input & Live Discount */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Have a Promotional Coupon?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. WELCOME20, ANNUAL50"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white uppercase font-mono"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={validatingCoupon || !couponCode.trim()}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 disabled:opacity-50"
              >
                {validatingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
              </button>
            </div>

            {couponDiscount && (
              <p
                className={`text-xs font-semibold ${
                  couponDiscount.valid ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {couponDiscount.message}
              </p>
            )}
          </div>

          {/* Confirm Button */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsPlanModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmPlanChange}
              disabled={isSubmittingPlan}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmittingPlan ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Confirm &amp; Update Plan</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: Cancellation Safeguard */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Commercial Subscription"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
            <p className="font-bold">Are you sure you want to cancel your plan?</p>
            <p className="mt-1">
              Your automated smart queues, scheduled posts, and AI copilot quotas will be deactivated once your billing period concludes.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Please tell us why you are leaving:
            </label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="Too expensive for current volume">Too expensive for current volume</option>
              <option value="Missing required social networks">Missing required social networks</option>
              <option value="Switching to agency provider">Switching to agency provider</option>
              <option value="Temporary pause">Temporary pause (seasonal brand)</option>
              <option value="Found alternative tool">Found alternative tool</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="cancelImmediate"
              checked={cancelImmediate}
              onChange={(e) => setCancelImmediate(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 border-slate-300"
            />
            <label htmlFor="cancelImmediate" className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Cancel immediately (forfeit remaining billing period days)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white"
            >
              Keep My Subscription
            </button>
            <button
              type="button"
              onClick={handleConfirmCancel}
              disabled={isCanceling}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 disabled:opacity-50"
            >
              {isCanceling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Confirm Cancellation</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: Detailed Printable Invoice Receipt */}
      <Modal
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        title={`Invoice Receipt: ${selectedInvoice?.invoiceNumber || ''}`}
        size="lg"
      >
        {selectedInvoice && (
          <div className="space-y-6 print:m-0">
            {/* Invoice Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">SocialHive Inc.</h3>
                <p className="text-xs text-slate-500">Commercial Social Media Management SaaS</p>
                <p className="text-xs text-slate-500">San Francisco, CA 94105, USA</p>
                <p className="text-xs text-slate-500">Tax ID: US-EIN-882910394</p>
              </div>

              <div className="text-right">
                <Badge variant="emerald" size="sm">
                  {selectedInvoice.status}
                </Badge>
                <p className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-1">
                  {selectedInvoice.invoiceNumber}
                </p>
                <p className="text-xs text-slate-500">
                  Issued: {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Billed To */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Billed To
              </span>
              <p className="font-bold text-slate-900 dark:text-white">Enterprise Workspace Client</p>
              <p className="text-slate-500">admin@quickpostly.com</p>
              <p className="text-slate-500">Payment: {selectedInvoice.paymentMethod || 'Credit Card'}</p>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                <tr>
                  <th className="py-2">Description</th>
                  <th className="py-2">Interval</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="py-3 font-medium text-slate-900 dark:text-white">
                    {selectedInvoice.planName}
                  </td>
                  <td className="py-3 text-slate-500">{selectedInvoice.billingInterval}</td>
                  <td className="py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    ${selectedInvoice.subtotal.toFixed(2)}
                  </td>
                </tr>
                {selectedInvoice.discountAmount > 0 && (
                  <tr>
                    <td className="py-2 text-emerald-500 font-medium">Promotional Discount</td>
                    <td className="py-2 text-slate-400">—</td>
                    <td className="py-2 text-right font-mono text-emerald-500 font-bold">
                      -${selectedInvoice.discountAmount.toFixed(2)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="py-2 text-slate-500">Sales Tax / VAT (0%)</td>
                  <td className="py-2 text-slate-400">—</td>
                  <td className="py-2 text-right font-mono text-slate-500">$0.00</td>
                </tr>
              </tbody>
              <tfoot className="border-t-2 border-slate-300 dark:border-slate-700">
                <tr>
                  <th colSpan={2} className="py-3 text-sm font-bold text-slate-900 dark:text-white">
                    Total Paid:
                  </th>
                  <th className="py-3 text-right font-mono text-base font-black text-amber-500">
                    ${selectedInvoice.totalAmount.toFixed(2)} {selectedInvoice.currency}
                  </th>
                </tr>
              </tfoot>
            </table>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">
                Official electronic receipt. Retain for tax documentation.
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
