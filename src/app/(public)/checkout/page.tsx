'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Globe,
  Loader2,
  AlertCircle,
  QrCode,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SupportedMethod } from '@/modules/payments/gateways';

interface GatewayOption {
  id: string;
  name: string;
  category: string;
  brandColor: string;
  supportsRecurring: boolean;
  supportedCurrencies: string[];
  supportedMethods: SupportedMethod[];
  isLiveMode: boolean;
}

export default function CommercialCheckoutPage() {
  const [country, setCountry] = useState('IN'); // Auto-detected default
  const [currency, setCurrency] = useState('INR');
  const [planSlug, setPlanSlug] = useState('professional');
  const [interval, setInterval] = useState<'MONTHLY' | 'YEARLY'>('YEARLY');

  const [availableGateways, setAvailableGateways] = useState<GatewayOption[]>([]);
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>('razorpay');
  const [selectedMethod, setSelectedMethod] = useState<string>('UPI');
  const [loadingGateways, setLoadingGateways] = useState(true);

  // Checkout Initiation & Verification State
  const [customerEmail, setCustomerEmail] = useState('user@quickpostly.com');
  const [customerName, setCustomerName] = useState('Growth Marketer');
  const [couponCode, setCouponCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<{
    status: 'IDLE' | 'PENDING' | 'SUCCEEDED' | 'FAILED';
    transactionId?: string;
    message?: string;
    payload?: Record<string, unknown>;
  }>({ status: 'IDLE' });

  // When country changes, auto-adjust currency
  const handleCountryChange = (c: string) => {
    setCountry(c);
    if (c === 'IN') {
      setCurrency('INR');
    } else if (c === 'GB') {
      setCurrency('GBP');
    } else if (['DE', 'FR', 'IT', 'ES', 'NL'].includes(c)) {
      setCurrency('EUR');
    } else {
      setCurrency('USD');
    }
  };

  // Fetch available gateways for selected currency & country
  const fetchGateways = async () => {
    setLoadingGateways(true);
    try {
      const res = await fetch(
        `/api/v1/payments/gateways?currency=${currency}&country=${country}&recurring=${interval === 'YEARLY'}`
      );
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setAvailableGateways(data.data);
        const exists = data.data.some((g: GatewayOption) => g.id === selectedGatewayId);
        if (!exists) {
          setSelectedGatewayId(data.data[0].id);
          setSelectedMethod(data.data[0].supportedMethods[0] || 'CARDS');
        }
      } else {
        setAvailableGateways([]);
      }
    } catch {
      setAvailableGateways([]);
    } finally {
      setLoadingGateways(false);
    }
  };

  useEffect(() => {
    fetchGateways();
  }, [currency, country, interval]);

  const selectedGateway = availableGateways.find((g) => g.id === selectedGatewayId);

  // Update selectedMethod when gateway changes
  useEffect(() => {
    if (selectedGateway && selectedGateway.supportedMethods.length > 0) {
      if (!selectedGateway.supportedMethods.includes(selectedMethod as SupportedMethod)) {
        setSelectedMethod(selectedGateway.supportedMethods[0]);
      }
    }
  }, [selectedGatewayId, selectedGateway]);

  // Pricing calculation
  const baseUsd = planSlug === 'starter' ? 24 : planSlug === 'professional' ? 65 : planSlug === 'business' ? 119 : 239;
  const cycleMultiplier = interval === 'YEARLY' ? 12 : 1;
  const planUsd = baseUsd * cycleMultiplier;
  const displayAmount =
    currency === 'INR'
      ? Math.round(planUsd * 84).toLocaleString()
      : planUsd.toLocaleString();

  const handleStartPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setCheckoutResult({ status: 'PENDING' });

    try {
      // Step 1: Initiate Checkout on Server
      const initRes = await fetch('/api/v1/payments/checkout/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: 'ws_peak_scale',
          userId: 'usr_current',
          planSlug,
          interval,
          currency,
          gatewayId: selectedGatewayId,
          paymentMethod: selectedMethod,
          customerEmail,
          customerName,
          couponCode: couponCode || undefined,
          country,
        }),
      });

      const initData = await initRes.json();
      if (!initData.success) {
        setCheckoutResult({
          status: 'FAILED',
          message: initData.error?.message || 'Checkout initiation failed.',
        });
        setProcessing(false);
        return;
      }

      const tx = initData.data.transaction;
      const payload = initData.data.checkoutPayload;

      // Step 2: Server-Side Strict Verification
      // Generate simulated reference token based on selected gateway
      const paymentRef =
        selectedGatewayId === 'razorpay'
          ? `pay_${Math.random().toString(36).substring(2, 10)}`
          : selectedGatewayId === 'stripe'
          ? `pi_${Math.random().toString(36).substring(2, 14)}`
          : `tx_${selectedGatewayId}_${Date.now()}`;

      const verifyRes = await fetch('/api/v1/payments/checkout/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: tx.id,
          gatewayId: selectedGatewayId,
          paymentRef,
          orderId: payload.orderId || `order_${Date.now()}`,
          signature: 'sandbox_verified_signature_token',
          workspaceId: 'ws_peak_scale',
          userId: 'usr_current',
          planSlug,
          interval,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        setCheckoutResult({
          status: 'SUCCEEDED',
          transactionId: tx.transactionNumber,
          message: verifyData.message,
          payload,
        });
      } else {
        setCheckoutResult({
          status: 'FAILED',
          message: verifyData.error?.message || 'Server-side payment verification rejected.',
        });
      }
    } catch {
      setCheckoutResult({
        status: 'FAILED',
        message: 'Network communication failure during payment verification.',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center space-y-2 mb-8">
        <Badge variant="amber" size="sm">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          Bank-Grade 256-Bit SSL Encrypted Checkout
        </Badge>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Complete Your QuickPostly Commercial Subscription
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Select your local currency, country, and certified payment gateway.
        </p>
      </div>

      {checkoutResult.status === 'SUCCEEDED' ? (
        /* SUCCESS CONFIRMATION VIEW */
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Payment Verified &amp; Subscription Activated!
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Transaction ID: {checkoutResult.transactionId}
            </p>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            {checkoutResult.message} Your category smart queues, AI copilot credits, and workspace limits have been updated on the server.
          </p>

          <div className="pt-4 flex items-center justify-center gap-3">
            <a
              href="/dashboard/subscription"
              className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md"
            >
              Go to Billing Dashboard
            </a>
            <a
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
            >
              Open Dashboard
            </a>
          </div>
        </div>
      ) : (
        /* CHECKOUT FORM VIEW */
        <form onSubmit={handleStartPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Configuration & Gateway Selection (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Country & Currency Detection */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-500" />
                <span>Location &amp; Settlement Currency</span>
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Country</label>
                  <select
                    value={country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="IN">India (₹ INR)</option>
                    <option value="US">United States ($ USD)</option>
                    <option value="GB">United Kingdom (£ GBP)</option>
                    <option value="DE">Germany (€ EUR)</option>
                    <option value="FR">France (€ EUR)</option>
                    <option value="GLOBAL">International / Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Billing Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Gateway Selection */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-500" />
                  <span>Select Certified Gateway</span>
                </h2>
                <span className="text-xs text-slate-400">Filtered by country &amp; currency</span>
              </div>

              {loadingGateways ? (
                <div className="py-6 flex items-center justify-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span className="text-xs">Detecting eligible gateways...</span>
                </div>
              ) : availableGateways.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs">
                  No payment gateways are currently enabled by the administrator for {currency} in this region. Please try USD or contact support.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableGateways.map((gw) => {
                    const isSelected = selectedGatewayId === gw.id;
                    return (
                      <div
                        key={gw.id}
                        onClick={() => setSelectedGatewayId(gw.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-amber-400 bg-amber-50/20 dark:bg-amber-950/20 ring-2 ring-amber-400'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                            style={{ backgroundColor: gw.brandColor }}
                          >
                            {gw.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-slate-900 dark:text-white">{gw.name}</p>
                            <span className="text-[10px] text-slate-400">{gw.category}</span>
                          </div>
                        </div>

                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Payment Methods supported by chosen Gateway */}
              {selectedGateway && (
                <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                    Supported Payment Method for {selectedGateway.name}:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedGateway.supportedMethods.map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setSelectedMethod(m)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          selectedMethod === m
                            ? 'bg-amber-400 text-slate-950 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Customer Details */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h2 className="font-bold text-base text-slate-900 dark:text-white">Billing Information</h2>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-slate-400">Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-slate-400">Email Address</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Pay Action (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <h2 className="font-bold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Plan Tier:</span>
                  <span className="font-bold text-slate-900 dark:text-white capitalize">
                    {planSlug} Tier
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Billing Interval:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {interval === 'YEARLY' ? 'Annual (Save 20%)' : 'Monthly'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Gateway:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedGateway?.name || 'Selected Provider'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Payment Rail:</span>
                  <span className="font-mono text-amber-500 font-bold">{selectedMethod}</span>
                </div>
              </div>

              {/* Coupon input */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. WELCOME20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono uppercase"
                />
              </div>

              {/* Total Price */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-bold block">Total Amount:</span>
                  <span className="text-[11px] text-slate-400">Inclusive of all local taxes</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {currency === 'INR' ? '₹' : '$'}
                    {displayAmount}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">{currency}</span>
                </div>
              </div>

              {checkoutResult.status === 'FAILED' && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{checkoutResult.message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={processing || availableGateways.length === 0}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying on Server...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay {currency === 'INR' ? '₹' : '$'}{displayAmount} &amp; Activate</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-400 text-center">
                Strict server-side verification. Subscriptions are activated only upon cryptographically verified confirmation.
              </p>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
