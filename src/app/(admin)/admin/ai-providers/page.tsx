'use client';

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Bot,
  Key,
  ShieldCheck,
  Save,
  CheckCircle2,
  Sliders,
  DollarSign,
  Zap,
  Activity,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  Layers,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Flame,
  Check,
  AlertCircle,
  Clock,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  AIProviderId,
  AITaskType,
  AIModelMeta,
  AIToolMeta,
  AIRoutingRuleDTO,
} from '@/modules/ai/types';

export default function AdminAiProvidersPage() {
  const [activeTab, setActiveTab] = useState<'TELEMETRY' | 'PROVIDERS' | 'MODELS' | 'ROUTING' | 'TOOLS' | 'ERRORS'>('PROVIDERS');
  const [providers, setProviders] = useState<any[]>([]);
  const [models, setModels] = useState<AIModelMeta[]>([]);
  const [tools, setTools] = useState<AIToolMeta[]>([]);
  const [routingRules, setRoutingRules] = useState<AIRoutingRuleDTO[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [errors, setErrors] = useState<any[]>([]);

  // State for keys visibility and editing
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [editedProviders, setEditedProviders] = useState<Record<string, any>>({});
  const [testingId, setTestingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [testResultMsg, setTestResultMsg] = useState<Record<string, string>>({});

  // Editing state for tools
  const [selectedToolForEdit, setSelectedToolForEdit] = useState<AIToolMeta | null>(null);

  useEffect(() => {
    fetchProviders();
    fetchModels();
    fetchTools();
    fetchRouting();
    fetchAnalytics();
    fetchErrors();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/v1/admin/ai/providers');
      const json = await res.json();
      if (json.success) {
        setProviders(json.data);
        const map: Record<string, any> = {};
        json.data.forEach((p: any) => {
          map[p.id] = { ...p };
        });
        setEditedProviders(map);
      }
    } catch {}
  };

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/v1/admin/ai/models');
      const json = await res.json();
      if (json.success) setModels(json.data);
    } catch {}
  };

  const fetchTools = async () => {
    try {
      const res = await fetch('/api/v1/admin/ai/tools');
      const json = await res.json();
      if (json.success) setTools(json.data);
    } catch {}
  };

  const fetchRouting = async () => {
    try {
      const res = await fetch('/api/v1/admin/ai/routing');
      const json = await res.json();
      if (json.success) setRoutingRules(json.data);
    } catch {}
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/v1/admin/ai/analytics');
      const json = await res.json();
      if (json.success) setAnalytics(json.data);
    } catch {}
  };

  const fetchErrors = async () => {
    try {
      const res = await fetch('/api/v1/admin/ai/errors');
      const json = await res.json();
      if (json.success) setErrors(json.data);
    } catch {}
  };

  // Toggle API key visibility
  const toggleKeyVisibility = (id: string) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Handle local provider form update
  const handleProviderChange = (id: string, field: string, value: any) => {
    setEditedProviders((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  // Save Provider Settings
  const handleSaveProvider = async (id: string) => {
    setSavingId(id);
    const dataToSave = editedProviders[id];

    try {
      const res = await fetch(`/api/v1/admin/ai/providers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });

      const json = await res.json();
      if (json.success) {
        setSaveSuccess(`Settings for '${dataToSave.name}' saved successfully.`);
        setTimeout(() => setSaveSuccess(null), 3000);
        fetchProviders();
      }
    } catch {
      // Handled
    } finally {
      setSavingId(null);
    }
  };

  // Test Provider Connection Ping
  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    setTestResultMsg((prev) => ({ ...prev, [id]: '' }));

    const currentData = editedProviders[id];

    try {
      const res = await fetch(`/api/v1/admin/ai/providers/${id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: currentData?.apiKey,
          apiEndpoint: currentData?.apiEndpoint,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setTestResultMsg((prev) => ({
          ...prev,
          [id]: `✓ Connected (Latency: ${json.data.testResult.latencyMs}ms)`,
        }));
        fetchProviders();
      } else {
        setTestResultMsg((prev) => ({
          ...prev,
          [id]: `✗ Test Failed: ${json.error?.message || 'Unreachable'}`,
        }));
      }
    } catch (err: unknown) {
      setTestResultMsg((prev) => ({
        ...prev,
        [id]: '✗ Connection check timed out.',
      }));
    } finally {
      setTestingId(null);
    }
  };

  // Toggle Model Enabled state
  const handleToggleModel = async (model: AIModelMeta) => {
    try {
      await fetch(`/api/v1/admin/ai/models/${model.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: !model.isEnabled }),
      });
      fetchModels();
    } catch {}
  };

  // Toggle Tool Enabled state
  const handleToggleTool = async (tool: AIToolMeta) => {
    try {
      await fetch(`/api/v1/admin/ai/tools/${tool.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: !tool.isEnabled }),
      });
      fetchTools();
    } catch {}
  };

  // Save Tool System Prompt or Credit Cost
  const handleSaveToolEdit = async () => {
    if (!selectedToolForEdit) return;
    try {
      await fetch(`/api/v1/admin/ai/tools/${selectedToolForEdit.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: selectedToolForEdit.systemPrompt,
          creditCost: selectedToolForEdit.creditCost,
          creditType: selectedToolForEdit.creditType,
        }),
      });
      setSelectedToolForEdit(null);
      fetchTools();
      setSaveSuccess(`Tool '${selectedToolForEdit.name}' updated successfully.`);
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch {}
  };

  // Update Routing Rule
  const handleUpdateRouting = async (taskType: AITaskType, primaryId: AIProviderId) => {
    try {
      const existing = routingRules.find((r) => r.taskType === taskType);
      await fetch('/api/v1/admin/ai/routing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType,
          primaryProviderId: primaryId,
          fallbackProviderIds: existing?.fallbackProviderIds || [],
          maxCostThreshold: existing?.maxCostThreshold || 0.05,
          autoFallbackEnabled: existing?.autoFallbackEnabled ?? true,
        }),
      });
      fetchRouting();
      setSaveSuccess(`Primary route for ${taskType} updated to ${primaryId.toUpperCase()}.`);
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            AI Provider &amp; Model Management
            <Badge variant="indigo" className="text-[10px]">
              Multi-AI Studio
            </Badge>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure official API credentials, model pricing, smart fallback routing, tool prompts, and token cost safeguards.
          </p>
        </div>

        {saveSuccess && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{saveSuccess}</span>
          </div>
        )}
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('PROVIDERS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'PROVIDERS'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Provider Credentials ({providers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('MODELS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'MODELS'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Models &amp; Pricing ({models.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ROUTING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ROUTING'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Routing &amp; Fallbacks
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TOOLS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'TOOLS'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Tool Management ({tools.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TELEMETRY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'TELEMETRY'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Cost &amp; Telemetry
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ERRORS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ERRORS'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Error Logs ({errors.length})
        </button>
      </div>

      {/* TAB 1: PROVIDERS & CREDENTIALS */}
      {activeTab === 'PROVIDERS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {providers.map((p) => {
              const current = editedProviders[p.id] || p;
              const isKeyShown = revealedKeys[p.id];
              const isTesting = testingId === p.id;
              const isSaving = savingId === p.id;
              const testMsg = testResultMsg[p.id];

              return (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between shadow-xs"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white"
                          style={{ backgroundColor: p.brandColor || '#6366f1' }}
                        >
                          {p.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{p.name}</h3>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Priority #{current.priority}
                          </span>
                        </div>
                      </div>

                      {/* ON/OFF Switch */}
                      <button
                        type="button"
                        onClick={() =>
                          handleProviderChange(p.id, 'isEnabled', !current.isEnabled)
                        }
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          current.isEnabled ? 'bg-indigo-600' : 'bg-slate-800'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                            current.isEnabled ? 'left-6' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          current.connectionStatus === 'CONNECTED'
                            ? 'emerald'
                            : current.connectionStatus === 'ERROR'
                            ? 'rose'
                            : 'slate'
                        }
                        className="text-[10px]"
                      >
                        {current.connectionStatus === 'CONNECTED' ? (
                          <>● Connected ({current.latencyMs || 50}ms)</>
                        ) : current.connectionStatus === 'ERROR' ? (
                          <>✕ Error / Disconnected</>
                        ) : (
                          <>○ Inactive</>
                        )}
                      </Badge>

                      <div className="flex items-center gap-1">
                        {p.taskTypes.map((t: string) => (
                          <span
                            key={t}
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* API Key Input */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-slate-400">API Key</label>
                        <button
                          type="button"
                          onClick={() => toggleKeyVisibility(p.id)}
                          className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1"
                        >
                          {isKeyShown ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{isKeyShown ? 'Mask' : 'Reveal'}</span>
                        </button>
                      </div>

                      <input
                        type={isKeyShown ? 'text' : 'password'}
                        value={current.apiKey || ''}
                        onChange={(e) => handleProviderChange(p.id, 'apiKey', e.target.value)}
                        placeholder={`Enter ${p.name} API Key...`}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    {/* Endpoint Override */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400">API Endpoint</label>
                      <input
                        type="text"
                        value={current.apiEndpoint || ''}
                        onChange={(e) => handleProviderChange(p.id, 'apiEndpoint', e.target.value)}
                        placeholder="Default Official Endpoint"
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    {/* Test result message */}
                    {testMsg && (
                      <p
                        className={`text-[11px] font-medium ${
                          testMsg.startsWith('✓') ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {testMsg}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleTestConnection(p.id)}
                      disabled={isTesting}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Activity className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                      <span>{isTesting ? 'Pinging...' : 'Test Connection'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveProvider(p.id)}
                      disabled={isSaving}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Saving...' : 'Save'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MODELS & PRICING */}
      {activeTab === 'MODELS' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Registered AI Models &amp; Pricing</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Enable or disable specific model variants and configure per-1k token costs.
              </p>
            </div>
            <span className="text-xs text-slate-400">{models.length} Models Registered</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3">Model Name</th>
                  <th className="p-3">Provider</th>
                  <th className="p-3">Task Type</th>
                  <th className="p-3">Cost / 1k In</th>
                  <th className="p-3">Cost / 1k Out</th>
                  <th className="p-3">Context Window</th>
                  <th className="p-3">Min Plan Tier</th>
                  <th className="p-3 text-right">Enabled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {models.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-850 transition-colors">
                    <td className="p-3 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span>{m.name}</span>
                        {m.isDefault && (
                          <Badge variant="indigo" className="text-[9px]">Default</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-slate-300 font-mono">{m.providerId}</td>
                    <td className="p-3">
                      <Badge variant="slate" className="text-[10px]">{m.taskType}</Badge>
                    </td>
                    <td className="p-3 text-emerald-400 font-mono">${m.costPer1kInput.toFixed(5)}</td>
                    <td className="p-3 text-emerald-400 font-mono">${m.costPer1kOutput.toFixed(5)}</td>
                    <td className="p-3 text-slate-400 font-mono">
                      {m.contextWindow > 1000 ? `${m.contextWindow / 1000}k` : m.contextWindow}
                    </td>
                    <td className="p-3 text-indigo-300">{m.minSubscriptionTier || 'FREE'}</td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleModel(m)}
                        className={`w-9 h-5 rounded-full transition-colors relative inline-block cursor-pointer ${
                          m.isEnabled ? 'bg-indigo-600' : 'bg-slate-800'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                            m.isEnabled ? 'left-5' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ROUTING & FALLBACKS */}
      {activeTab === 'ROUTING' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {routingRules.map((rule) => (
            <div
              key={rule.taskType}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Badge variant="indigo" className="text-xs">
                    {rule.taskType}
                  </Badge>
                  <h3 className="text-sm font-bold text-white">Smart Routing Policy</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">Timeout: {rule.timeoutMs}ms</span>
              </div>

              {/* Primary Provider Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Primary Preferred Provider
                </label>
                <select
                  value={rule.primaryProviderId}
                  onChange={(e) =>
                    handleUpdateRouting(rule.taskType, e.target.value as AIProviderId)
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  {providers
                    .filter((p) => p.taskTypes.includes(rule.taskType) && p.isEnabled)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Priority #{p.priority})
                      </option>
                    ))}
                </select>
              </div>

              {/* Fallback Chain */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Configured Fallback Chain</label>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300 flex-wrap">
                    <span className="px-2 py-1 rounded bg-indigo-600/30 text-indigo-300 font-bold">
                      1. {rule.primaryProviderId.toUpperCase()} (Primary)
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    {rule.fallbackProviderIds.map((fb, idx) => (
                      <React.Fragment key={fb}>
                        <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">
                          {idx + 2}. {fb.toUpperCase()}
                        </span>
                        {idx < rule.fallbackProviderIds.length - 1 && (
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2">
                    🔒 <strong>Cost Cap Safeguard:</strong> The routing engine strictly enforces that no fallback provider with a higher unit cost than <code>${rule.maxCostThreshold}</code> will be selected silently.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: TOOL MANAGEMENT */}
      {activeTab === 'TOOLS' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">The 12 Platform AI Tools</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure tool visibility, custom system prompts, and credit consumption per generation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((t) => (
              <div
                key={t.slug}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{t.name}</span>
                      <Badge variant="indigo" className="text-[9px]">{t.taskType}</Badge>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleTool(t)}
                      className={`w-9 h-5 rounded-full transition-colors relative inline-block cursor-pointer ${
                        t.isEnabled ? 'bg-indigo-600' : 'bg-slate-800'
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          t.isEnabled ? 'left-5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{t.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-850 flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {t.creditCost} {t.creditType.replace('_', ' ')}
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedToolForEdit(t)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    Edit Prompt
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Tool Prompt Modal */}
          {selectedToolForEdit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white">
                    Edit Tool: {selectedToolForEdit.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedToolForEdit(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    System Prompt Instructions
                  </label>
                  <textarea
                    rows={8}
                    value={selectedToolForEdit.systemPrompt}
                    onChange={(e) =>
                      setSelectedToolForEdit({
                        ...selectedToolForEdit,
                        systemPrompt: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Credit Cost
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={selectedToolForEdit.creditCost}
                      onChange={(e) =>
                        setSelectedToolForEdit({
                          ...selectedToolForEdit,
                          creditCost: parseInt(e.target.value, 10) || 1,
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Credit Type
                    </label>
                    <input
                      type="text"
                      disabled
                      value={selectedToolForEdit.creditType}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-500 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedToolForEdit(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveToolEdit}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: COST & TELEMETRY */}
      {activeTab === 'TELEMETRY' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-mono">
                Total Generations
              </span>
              <div className="text-3xl font-black text-white">
                {analytics?.totalGenerations ?? 0}
              </div>
              <p className="text-xs text-slate-400">Across all platform workspaces</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-mono">
                Total Tokens Consumed
              </span>
              <div className="text-3xl font-black text-indigo-400">
                {analytics ? (analytics.totalTokensUsed / 1000).toFixed(1) + 'k' : '0k'}
              </div>
              <p className="text-xs text-slate-400">Input &amp; completion tokens</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-mono">
                Estimated Platform Cost
              </span>
              <div className="text-3xl font-black text-emerald-400">
                ${analytics?.totalEstimatedCostUsd ?? '0.00'}
              </div>
              <p className="text-xs text-slate-400">Calculated from model wholesale rates</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-mono">
                Fallback Recovery Rate
              </span>
              <div className="text-3xl font-black text-cyan-400">
                {analytics?.fallbackRecoveryRate ?? 100}%
              </div>
              <p className="text-xs text-slate-400">Automatic failover success rate</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ERROR LOGS */}
      {activeTab === 'ERRORS' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">AI Provider Error Logs</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit trail of upstream timeouts, rate-limits, and automatic failover events.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchErrors}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {errors.length > 0 ? (
              errors.map((err) => (
                <div key={err.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-rose-400 uppercase font-mono">
                        {err.providerId}
                      </span>
                      <Badge variant="rose" className="text-[10px]">
                        HTTP {err.httpStatusCode || 500}
                      </Badge>
                      {err.recoveredByFallback && (
                        <Badge variant="emerald" className="text-[10px]">
                          Recovered by Fallback ({err.fallbackProviderId?.toUpperCase()})
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 font-mono">{err.errorMessage}</p>
                    <span className="text-[10px] text-slate-500">
                      {new Date(err.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-8 text-center">
                ✓ No critical AI provider errors recorded. Platform health is 100%.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
