'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  CheckCircle2,
  AlertCircle,
  Key,
  Shield,
  CreditCard,
  RefreshCw,
  Save,
  Globe,
  Coins,
  Building2,
  Check,
  X,
  Loader2,
  ExternalLink,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  PAYMENT_GATEWAY_CATALOG,
  PaymentGatewayConfigDTO,
  GatewayCategory,
} from '@/modules/payments/gateways';

export default function AdminPaymentsPage() {
  const [configs, setConfigs] = useState<Record<string, PaymentGatewayConfigDTO>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | GatewayCategory>('ALL');
  const [testingId, setTestingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/payments/gateways');
      const data = await res.json();
      if (data.success) {
        const map: Record<string, PaymentGatewayConfigDTO> = {};
        for (const gw of data.data) {
          map[gw.id] = gw;
        }
        setConfigs(map);
      }
    } catch {
      setNotification({ type: 'error', text: 'Failed to load gateway configurations' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleFieldChange = (
    gatewayId: string,
    field: keyof PaymentGatewayConfigDTO,
    value: unknown
  ) => {
    setConfigs((prev) => ({
      ...prev,
      [gatewayId]: {
        ...prev[gatewayId],
        [field]: value,
      },
    }));
  };

  const handleTestConnection = async (gatewayId: string) => {
    setTestingId(gatewayId);
    try {
      const res = await fetch(`/api/v1/admin/payments/gateways/${gatewayId}/test`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', text: data.message });
        handleFieldChange(gatewayId, 'connectionStatus', 'CONNECTED');
        handleFieldChange(gatewayId, 'lastTestedAt', new Date().toISOString());
      } else {
        setNotification({ type: 'error', text: data.error?.message || 'Connection test failed.' });
        handleFieldChange(gatewayId, 'connectionStatus', 'ERROR');
      }
    } catch {
      setNotification({ type: 'error', text: 'Error executing gateway ping test.' });
    } finally {
      setTestingId(null);
    }
  };

  const handleSaveGateway = async (gatewayId: string) => {
    setSavingId(gatewayId);
    try {
      const gw = configs[gatewayId];
      const res = await fetch(`/api/v1/admin/payments/gateways/${gatewayId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gw),
      });
      const data = await res.json();
      if (data.success) {
        setNotification({
          type: 'success',
          text: `Settings for ${gw.name} saved successfully.`,
        });
      } else {
        setNotification({ type: 'error', text: data.error?.message || 'Failed to save settings.' });
      }
    } catch {
      setNotification({ type: 'error', text: 'Network error saving gateway.' });
    } finally {
      setSavingId(null);
    }
  };

  const toggleSecretVisibility = (id: string) => {
    setVisibleSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredGateways = PAYMENT_GATEWAY_CATALOG.filter((meta) => {
    if (selectedCategory === 'ALL') return true;
    return meta.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}
        >
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-amber-500" />
            <span>Complete Multi-Payment Gateway Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Independently manage Indian, International, and Crypto gateways, configure sandbox credentials, and test webhooks.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedCategory === 'ALL' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-400'
            }`}
          >
            All Gateways (13)
          </button>
          <button
            onClick={() => setSelectedCategory('INDIAN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedCategory === 'INDIAN' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-400'
            }`}
          >
            Indian (5)
          </button>
          <button
            onClick={() => setSelectedCategory('INTERNATIONAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedCategory === 'INTERNATIONAL' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-400'
            }`}
          >
            International (5)
          </button>
          <button
            onClick={() => setSelectedCategory('CRYPTO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedCategory === 'CRYPTO' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-400'
            }`}
          >
            Crypto (3)
          </button>
        </div>
      </div>

      {/* Gateways Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-7 h-7 animate-spin mr-2 text-amber-500" />
          <span>Loading 13 payment gateway configurations...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredGateways.map((meta) => {
            const config = configs[meta.id] || {
              id: meta.id,
              name: meta.name,
              category: meta.category,
              isEnabled: false,
              isLiveMode: false,
              apiKey: '',
              secretKey: '',
              webhookSecret: '',
              connectionStatus: 'DISCONNECTED',
              supportsRecurring: meta.supportsRecurring,
              supportedCurrencies: meta.supportedCurrencies,
              supportedMethods: meta.supportedMethods,
              meta,
            };

            const isShowSecret = Boolean(visibleSecrets[meta.id]);
            const isTesting = testingId === meta.id;
            const isSaving = savingId === meta.id;

            const statusBadgeVariant =
              config.connectionStatus === 'CONNECTED'
                ? 'emerald'
                : config.connectionStatus === 'ERROR'
                ? 'danger'
                : 'slate';

            return (
              <div
                key={meta.id}
                className={`p-6 rounded-2xl border transition-all space-y-5 flex flex-col justify-between ${
                  config.isEnabled
                    ? 'border-slate-800 bg-slate-900 shadow-lg'
                    : 'border-slate-800/60 bg-slate-950/70 opacity-90'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-xs"
                        style={{ backgroundColor: meta.brandColor }}
                      >
                        {meta.id === 'razorpay'
                          ? 'RZP'
                          : meta.id === 'phonepe'
                          ? 'Pe'
                          : meta.id === 'stripe'
                          ? 'S'
                          : meta.id === 'paypal'
                          ? 'PP'
                          : meta.id === 'nowpayments'
                          ? 'NOW'
                          : meta.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-white">{meta.name}</h3>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                            {meta.category}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">{meta.badgeText}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={statusBadgeVariant} size="sm">
                        {config.connectionStatus}
                      </Badge>

                      {/* ON/OFF Switch */}
                      <button
                        type="button"
                        onClick={() => handleFieldChange(meta.id, 'isEnabled', !config.isEnabled)}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                          config.isEnabled ? 'bg-emerald-500' : 'bg-slate-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                            config.isEnabled ? 'right-1' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 mb-4">{meta.description}</p>

                  {/* Mode & Recurring Telemetry Pills */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800/80 mb-4 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-semibold">Mode:</span>
                      <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5">
                        <button
                          type="button"
                          onClick={() => handleFieldChange(meta.id, 'isLiveMode', false)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                            !config.isLiveMode ? 'bg-amber-400 text-slate-950' : 'text-slate-400'
                          }`}
                        >
                          Test / Sandbox
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFieldChange(meta.id, 'isLiveMode', true)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                            config.isLiveMode ? 'bg-emerald-500 text-white' : 'text-slate-400'
                          }`}
                        >
                          Live Production
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          meta.supportsRecurring
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {meta.supportsRecurring ? 'Recurring Subscriptions' : 'Single Charge Only'}
                      </span>
                    </div>
                  </div>

                  {/* Credentials Form */}
                  <div className="space-y-3 text-xs">
                    {/* API Key */}
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold block">{meta.fields.apiKeyLabel}</label>
                      <input
                        type="text"
                        value={config.apiKey || ''}
                        onChange={(e) => handleFieldChange(meta.id, 'apiKey', e.target.value)}
                        placeholder="Enter API Key / Key ID"
                        className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Secret Key */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-300 font-semibold">{meta.fields.secretKeyLabel}</label>
                        <button
                          type="button"
                          onClick={() => toggleSecretVisibility(meta.id)}
                          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                        >
                          {isShowSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{isShowSecret ? 'Hide' : 'Reveal'}</span>
                        </button>
                      </div>
                      <input
                        type={isShowSecret ? 'text' : 'password'}
                        value={config.secretKey || ''}
                        onChange={(e) => handleFieldChange(meta.id, 'secretKey', e.target.value)}
                        placeholder="Enter Secret Key / Salt"
                        className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Client ID / App ID if applicable */}
                    {meta.fields.clientIdLabel && (
                      <div className="space-y-1">
                        <label className="text-slate-300 font-semibold block">{meta.fields.clientIdLabel}</label>
                        <input
                          type="text"
                          value={config.clientId || ''}
                          onChange={(e) => handleFieldChange(meta.id, 'clientId', e.target.value)}
                          placeholder={`Enter ${meta.fields.clientIdLabel}`}
                          className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    )}

                    {/* Webhook Secret */}
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold block">{meta.fields.webhookSecretLabel}</label>
                      <input
                        type={isShowSecret ? 'text' : 'password'}
                        value={config.webhookSecret || ''}
                        onChange={(e) => handleFieldChange(meta.id, 'webhookSecret', e.target.value)}
                        placeholder="Webhook signing secret (for signature verification)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Supported Currencies & Methods Chips */}
                    <div className="pt-2 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Supported Currencies:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {meta.supportedCurrencies.map((c) => (
                          <span
                            key={c}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300"
                          >
                            {c}
                          </span>
                        ))}
                      </div>

                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block pt-1">
                        Supported Payment Rails:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {meta.supportedMethods.map((m) => (
                          <span
                            key={m}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500 font-mono">
                    {config.lastTestedAt
                      ? `Last ping: ${new Date(config.lastTestedAt).toLocaleTimeString()}`
                      : 'Never tested'}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isTesting}
                      onClick={() => handleTestConnection(meta.id)}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      <span>Test Connection</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleSaveGateway(meta.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-500 text-slate-950 flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-xs"
                    >
                      {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>Save Settings</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
