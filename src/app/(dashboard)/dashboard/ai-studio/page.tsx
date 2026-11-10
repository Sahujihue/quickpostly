'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Zap,
  Sliders,
  SlidersHorizontal,
  Copy,
  Check,
  RefreshCw,
  Send,
  Calendar,
  Save,
  Bookmark,
  Layers,
  Image as ImageIcon,
  Video,
  Mic,
  MessageSquareText,
  Hash,
  Lightbulb,
  PenTool,
  Target,
  Globe,
  Coins,
  History,
  FileText,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Play,
  Volume2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  AIProviderId,
  AITaskType,
  AISelectionMode,
  AIToolMeta,
  AIModelMeta,
  AIWorkspaceCreditsDTO,
  AIGenerationResult,
} from '@/modules/ai/types';

const CATEGORIES = [
  { id: 'ALL', label: 'All Tools' },
  { id: 'CONTENT', label: 'Content Writing' },
  { id: 'OPTIMIZATION', label: 'Optimization' },
  { id: 'MARKETING', label: 'Ads & Copy' },
  { id: 'MEDIA', label: 'Image, Video & Voice' },
];

const TONES = [
  'Authoritative Executive',
  'Conversational & Friendly',
  'Witty & Playful',
  'Urgent & Direct',
  'Educational & Analytical',
  'Inspirational & Visionary',
  'Contrarian & Provocative',
  'Polished Professional',
];

const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Hindi',
  'Japanese',
  'Portuguese',
  'Arabic',
  'Italian',
  'Chinese',
];

export default function AiStudioPage() {
  // Navigation & Active States
  const [activeTab, setActiveTab] = useState<'STUDIO' | 'HISTORY' | 'DRAFTS' | 'TEMPLATES'>('STUDIO');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedToolSlug, setSelectedToolSlug] = useState('caption-generator');
  
  // Selection Mode
  const [selectionMode, setSelectionMode] = useState<AISelectionMode>('AUTOMATIC');
  const [selectedProviderId, setSelectedProviderId] = useState<AIProviderId>('openai');
  const [selectedModelId, setSelectedModelId] = useState<string>('gpt-4o');
  const [selectedTone, setSelectedTone] = useState('Authoritative Executive');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [voiceId, setVoiceId] = useState('Adam - Deep & Executive');

  // Form inputs
  const [promptInput, setPromptInput] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // Data states
  const [tools, setTools] = useState<AIToolMeta[]>([]);
  const [models, setModels] = useState<AIModelMeta[]>([]);
  const [credits, setCredits] = useState<AIWorkspaceCreditsDTO | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResult, setCurrentResult] = useState<AIGenerationResult | null>(null);
  const [editedOutput, setEditedOutput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Credit pack modal state
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [isPurchasingPack, setIsPurchasingPack] = useState(false);

  // Fetch initial tools, models, and credits
  useEffect(() => {
    fetchTools();
    fetchModels();
    fetchCredits();
    fetchHistory();
  }, []);

  const fetchTools = async () => {
    try {
      const res = await fetch('/api/v1/ai/tools');
      const json = await res.json();
      if (json.success) {
        setTools(json.data);
      }
    } catch {
      // Fallback handled
    }
  };

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/v1/ai/models');
      const json = await res.json();
      if (json.success) {
        setModels(json.data);
      }
    } catch {
      // Fallback handled
    }
  };

  const fetchCredits = async () => {
    try {
      const res = await fetch('/api/v1/ai/credits?workspaceId=ws_default');
      const json = await res.json();
      if (json.success) {
        setCredits(json.data);
      }
    } catch {
      // Fallback handled
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/v1/ai/history?workspaceId=ws_default');
      const json = await res.json();
      if (json.success) {
        setHistory(json.data);
      }
    } catch {
      // Fallback handled
    }
  };

  const currentTool = tools.find((t) => t.slug === selectedToolSlug) || tools[0];

  // Filter models compatible with current tool task type
  const compatibleModels = models.filter(
    (m) => currentTool && m.taskType === currentTool.taskType && m.isEnabled
  );

  // Handle Generation
  const handleGenerate = async () => {
    if (!promptInput.trim()) {
      setErrorMessage('Please enter a topic, prompt, or headline.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsGenerating(true);

    try {
      const res = await fetch('/api/v1/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: 'ws_default',
          userId: 'usr_current',
          toolSlug: currentTool?.slug || selectedToolSlug,
          selectionMode,
          providerId: selectionMode === 'MANUAL' ? selectedProviderId : undefined,
          modelId: selectionMode === 'MANUAL' ? selectedModelId : undefined,
          prompt: promptInput,
          language: selectedLanguage,
          tone: selectedTone,
          targetAudience,
          aspectRatio,
          voiceId,
          additionalInstructions,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'AI generation failed');
      }

      setCurrentResult(json.data);
      setEditedOutput(json.data.output);
      setSuccessMessage(
        json.data.fallbackTriggered
          ? `Generated via ${json.data.providerName} (Automatic Fallback Triggered)`
          : `Generated successfully with ${json.data.providerName} (${json.data.modelId})`
      );
      fetchCredits();
      fetchHistory();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (!editedOutput) return;
    navigator.clipboard.writeText(editedOutput);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Save Draft
  const handleSaveDraft = async () => {
    if (!currentResult) return;
    try {
      const res = await fetch('/api/v1/ai/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentResult.id,
          output: editedOutput,
          draftTitle: promptInput.slice(0, 40),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMessage('Draft saved to your workspace library.');
        fetchHistory();
      }
    } catch {
      setErrorMessage('Failed to save draft.');
    }
  };

  // Save as Template
  const handleSaveTemplate = async () => {
    if (!currentResult) return;
    try {
      const res = await fetch('/api/v1/ai/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentResult.id,
          templateTitle: promptInput.slice(0, 45) || 'Custom Content Framework',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMessage('Saved to your reusable AI Template library.');
        fetchHistory();
      }
    } catch {
      setErrorMessage('Failed to save template.');
    }
  };

  // Dispatch to Scheduler
  const handleSendToScheduler = async () => {
    if (!currentResult) return;
    try {
      const res = await fetch('/api/v1/ai/send-to-scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentResult.id,
          categoryBucket: 'Evergreen Insights',
          platforms: ['LinkedIn', 'X (Twitter)'],
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMessage('Content dispatched to social publishing queue & calendar!');
      }
    } catch {
      setErrorMessage('Failed to dispatch to scheduler.');
    }
  };

  // Buy Credit Pack
  const handleBuyCreditPack = async (packType: 'STARTER_BOOST' | 'CREATIVE_PACK' | 'AGENCY_SCALE') => {
    setIsPurchasingPack(true);
    try {
      const res = await fetch('/api/v1/ai/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: 'ws_default',
          userId: 'usr_current',
          packType,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCredits(json.data);
        setShowCreditModal(false);
        setSuccessMessage(`Credit pack '${packType}' activated successfully!`);
      }
    } catch {
      setErrorMessage('Failed to purchase credit pack.');
    } finally {
      setIsPurchasingPack(false);
    }
  };

  // Render Tool Icon
  const renderToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquareText':
        return <MessageSquareText className="w-5 h-5" />;
      case 'Hash':
        return <Hash className="w-5 h-5" />;
      case 'Lightbulb':
        return <Lightbulb className="w-5 h-5" />;
      case 'PenTool':
        return <PenTool className="w-5 h-5" />;
      case 'RefreshCw':
        return <RefreshCw className="w-5 h-5" />;
      case 'Sliders':
        return <Sliders className="w-5 h-5" />;
      case 'Target':
        return <Target className="w-5 h-5" />;
      case 'Globe':
        return <Globe className="w-5 h-5" />;
      case 'Calendar':
        return <Calendar className="w-5 h-5" />;
      case 'Image':
        return <ImageIcon className="w-5 h-5" />;
      case 'Video':
        return <Video className="w-5 h-5" />;
      case 'Mic':
        return <Mic className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Studio Title & Credit Meter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                AI Content Studio
                <Badge variant="indigo" className="text-[10px] tracking-wider uppercase">
                  Multi-Model Engine
                </Badge>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate high-converting social posts, captions, graphics, video clips, and studio voiceovers.
              </p>
            </div>
          </div>
        </div>

        {/* Live Credit Meter */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
          <div className="text-center px-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Text
            </span>
            <span className="text-sm font-black text-indigo-400">
              {credits?.remainingTextCredits ?? 250}
            </span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div className="text-center px-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Images
            </span>
            <span className="text-sm font-black text-emerald-400">
              {credits?.remainingImageCredits ?? 50}
            </span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div className="text-center px-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Videos
            </span>
            <span className="text-sm font-black text-amber-400">
              {credits?.remainingVideoCredits ?? 10}
            </span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div className="text-center px-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Voice
            </span>
            <span className="text-sm font-black text-cyan-400">
              {credits?.remainingVoiceCredits ?? 25}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowCreditModal(true)}
            className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Top Up</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Studio, History, Drafts, Templates) */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('STUDIO')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'STUDIO'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Studio Generator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'HISTORY'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            History ({history.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('DRAFTS')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'DRAFTS'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Drafts ({history.filter((h) => h.isDraft).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TEMPLATES')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'TEMPLATES'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Templates ({history.filter((h) => h.isTemplate).length})
          </button>
        </div>

        {/* Mode Toggle Switch (Automatic AI vs Manual AI) */}
        {activeTab === 'STUDIO' && (
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setSelectionMode('AUTOMATIC')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectionMode === 'AUTOMATIC'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Automatic AI</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectionMode('MANUAL')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectionMode === 'MANUAL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Manual AI</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Studio View */}
      {activeTab === 'STUDIO' && (
        <div className="space-y-6">
          {/* Tool Category Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 12 Tools Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {tools
              .filter((t) => (selectedCategory === 'ALL' ? true : t.category === selectedCategory))
              .map((tool) => {
                const isSelected = selectedToolSlug === tool.slug;
                return (
                  <button
                    key={tool.slug}
                    type="button"
                    onClick={() => {
                      setSelectedToolSlug(tool.slug);
                      setSuccessMessage(null);
                      setErrorMessage(null);
                    }}
                    className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {renderToolIcon(tool.iconName)}
                    </div>
                    <span className="text-xs font-bold text-white line-clamp-1">
                      {tool.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-1">
                      {tool.creditCost} {tool.creditType === 'TEXT_GENERATION' ? 'text credit' : 'credit'}
                    </span>
                  </button>
                );
              })}
          </div>

          {/* Studio Workspace: Left Canvas (Input & Controls), Right Canvas (Content Editor & Media Preview) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Controls & Prompt Input */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white">{currentTool?.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{currentTool?.description}</p>
                  </div>
                  <Badge variant="indigo" className="text-[10px]">
                    {currentTool?.taskType}
                  </Badge>
                </div>

                {/* Mode Context Box */}
                {selectionMode === 'AUTOMATIC' ? (
                  <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Zap className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Automatic AI Mode Active</span>
                    </div>
                    <p className="text-[11px] text-indigo-400/80">
                      Auto-routes to the best model based on task type, admin priority, and availability with strict cost safeguards.
                    </p>
                  </div>
                ) : (
                  /* Manual Model Selection */
                  <div className="space-y-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300">Provider &amp; Model</label>
                      <span className="text-[10px] text-slate-400 font-mono">Manual Override</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={selectedProviderId}
                        onChange={(e) => setSelectedProviderId(e.target.value as AIProviderId)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        <option value="openai">OpenAI</option>
                        <option value="gemini">Google Gemini</option>
                        <option value="claude">Anthropic Claude</option>
                        <option value="grok">xAI Grok</option>
                        <option value="deepseek">DeepSeek</option>
                        <option value="openai_image">DALL-E 3</option>
                        <option value="runway">Runway ML</option>
                        <option value="elevenlabs">ElevenLabs</option>
                      </select>

                      <select
                        value={selectedModelId}
                        onChange={(e) => setSelectedModelId(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        {compatibleModels.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Text Tool Inputs (Tone & Language) */}
                {currentTool?.taskType === 'TEXT' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">
                        Tone of Voice
                      </label>
                      <select
                        value={selectedTone}
                        onChange={(e) => setSelectedTone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      >
                        {TONES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">
                        Language
                      </label>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      >
                        {LANGUAGES.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Media Aspect Ratio (Images & Video) */}
                {(currentTool?.taskType === 'IMAGE' || currentTool?.taskType === 'VIDEO') && (
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">
                      Aspect Ratio
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['1:1', '16:9', '9:16'].map((ratio) => (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => setAspectRatio(ratio)}
                          className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            aspectRatio === ratio
                              ? 'bg-indigo-600 text-white border-indigo-500'
                              : 'bg-slate-950 text-slate-400 border-slate-800'
                          }`}
                        >
                          {ratio === '1:1' ? '1:1 (Square)' : ratio === '16:9' ? '16:9 (Landscape)' : '9:16 (Story/Reel)'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Voice Selection */}
                {currentTool?.taskType === 'VOICE' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">
                      Voice Persona
                    </label>
                    <select
                      value={voiceId}
                      onChange={(e) => setVoiceId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    >
                      <option value="Adam - Deep & Executive">Adam - Deep &amp; Executive</option>
                      <option value="Rachel - Warm & Friendly">Rachel - Warm &amp; Friendly</option>
                      <option value="Antoni - Energetic & Youthful">Antoni - Energetic &amp; Youthful</option>
                      <option value="Bella - Narrative & Elegant">Bella - Narrative &amp; Elegant</option>
                    </select>
                  </div>
                )}

                {/* Main Prompt Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-300">
                      Topic, Prompt or Key Idea <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {promptInput.length} chars
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder={
                      currentTool?.taskType === 'IMAGE'
                        ? 'e.g. Modern executive sitting at an ultra-minimal desk reviewing digital analytics on transparent glass screen, cinematic lighting, 8k...'
                        : currentTool?.taskType === 'VIDEO'
                        ? 'e.g. Drone camera soaring over futuristic tech campus at twilight with glowing holographic data streams...'
                        : 'e.g. 3 operational frameworks top B2B SaaS agencies use to eliminate social media burnout without losing consistency...'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-indigo-500 transition-all placeholder:text-slate-500"
                  />
                </div>

                {/* Optional Target Audience */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Target Audience / Niche (Optional)
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. B2B SaaS Founders, Agency Owners, CMOs"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-start gap-2 text-rose-300 text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Generate Action Button */}
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating || !promptInput.trim()}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing with {selectionMode === 'MANUAL' ? selectedProviderId.toUpperCase() : 'Best AI Provider'}...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Content ({currentTool?.creditCost} Credit)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Canvas: Content Editor & Media Output */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 min-h-[520px] flex flex-col justify-between shadow-sm">
                <div>
                  {/* Editor Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Interactive Editor</span>
                      {currentResult && (
                        <Badge variant="emerald" className="text-[10px]">
                          {currentResult.providerName} • {currentResult.tokensUsed} Tokens
                        </Badge>
                      )}
                    </div>

                    {/* Quick Action Toolbar */}
                    {currentResult && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={handleCopy}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleGenerate}
                          disabled={isGenerating}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                          <span>Regenerate</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSaveDraft}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Draft</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSaveTemplate}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>Template</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Feedback Banner */}
                  {successMessage && (
                    <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center gap-2 text-emerald-300 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  {/* Main Output Display */}
                  <div className="mt-4">
                    {currentResult ? (
                      <div className="space-y-4">
                        {/* Media Preview (If images/video/voice generated) */}
                        {currentResult.mediaUrls && currentResult.mediaUrls.length > 0 && (
                          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                              Generated Media Output
                            </span>

                            {currentResult.taskType === 'IMAGE' && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {currentResult.mediaUrls.map((url, i) => (
                                  <div key={i} className="relative rounded-lg overflow-hidden group border border-slate-800">
                                    <img
                                      src={url}
                                      alt={`AI Generated output ${i + 1}`}
                                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-black/80 hover:bg-black text-white text-[11px] font-bold flex items-center gap-1 backdrop-blur-xs"
                                    >
                                      <Download className="w-3 h-3" />
                                      <span>Download</span>
                                    </a>
                                  </div>
                                ))}
                              </div>
                            )}

                            {currentResult.taskType === 'VIDEO' && (
                              <div className="rounded-xl overflow-hidden border border-slate-800 bg-black aspect-video flex items-center justify-center relative">
                                <video
                                  src={currentResult.mediaUrls[0]}
                                  controls
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            {currentResult.taskType === 'VOICE' && (
                              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
                                    <Volume2 className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <span className="text-xs font-bold text-white block">
                                      Generated Studio Audio Narration
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      44.1kHz • High Fidelity WAV Stream
                                    </span>
                                  </div>
                                </div>
                                <audio controls src={currentResult.mediaUrls[0]} className="h-8 max-w-[200px]" />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Text Editor Area */}
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Editable Copy
                          </label>
                          <textarea
                            rows={12}
                            value={editedOutput}
                            onChange={(e) => setEditedOutput(e.target.value)}
                            className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed focus:outline-hidden focus:border-indigo-500 transition-all resize-y"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-400">
                          <Sparkles className="w-7 h-7" />
                        </div>
                        <h4 className="text-sm font-bold text-white">Your AI Canvas is Empty</h4>
                        <p className="text-xs text-slate-400 max-w-sm">
                          Select one of the 12 tools on the left, enter your topic or key angle, and click Generate to see multi-model AI synthesis in action.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Workflow Integration Bottom Bar */}
                {currentResult && (
                  <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Generated at {new Date(currentResult.createdAt).toLocaleTimeString()}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSendToScheduler}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send to Scheduler Queue</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History, Drafts, and Templates View */}
      {activeTab !== 'STUDIO' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">
              {activeTab === 'HISTORY' ? 'Generation History' : activeTab === 'DRAFTS' ? 'Saved Drafts' : 'Saved Templates'}
            </h3>
            <span className="text-xs text-slate-400">
              Showing{' '}
              {
                history.filter((h) =>
                  activeTab === 'DRAFTS' ? h.isDraft : activeTab === 'TEMPLATES' ? h.isTemplate : true
                ).length
              }{' '}
              items
            </span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {history
              .filter((h) =>
                activeTab === 'DRAFTS' ? h.isDraft : activeTab === 'TEMPLATES' ? h.isTemplate : true
              )
              .map((item) => (
                <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {item.toolName || item.toolSlug}
                      </span>
                      <Badge variant="slate" className="text-[10px]">
                        {item.providerName || item.providerId}
                      </Badge>
                      <Badge variant="indigo" className="text-[10px]">
                        {item.modelId}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-300 font-mono line-clamp-2 max-w-2xl">
                      {item.output}
                    </p>
                    <span className="text-[10px] text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentResult(item);
                        setEditedOutput(item.output);
                        setPromptInput(item.prompt);
                        setSelectedToolSlug(item.toolSlug);
                        setActiveTab('STUDIO');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                    >
                      Restore to Editor
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Credit Pack Top-Up Modal */}
      {showCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white">Top Up AI Credits</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Instant credit packs for high-volume content generation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreditModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Starter Boost</h4>
                  <p className="text-xs text-slate-400">+500 Text Credits • +50 Image Credits</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleBuyCreditPack('STARTER_BOOST')}
                  disabled={isPurchasingPack}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  $15
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/50 flex items-center justify-between ring-1 ring-indigo-500/30">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">Creative Pack</h4>
                    <Badge variant="indigo" className="text-[10px]">Most Popular</Badge>
                  </div>
                  <p className="text-xs text-slate-400">+1,500 Text • +150 Images • +20 Videos</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleBuyCreditPack('CREATIVE_PACK')}
                  disabled={isPurchasingPack}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  $39
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Agency Scale</h4>
                  <p className="text-xs text-slate-400">+5,000 Text • +500 Images • +80 Videos • +200 Voice</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleBuyCreditPack('AGENCY_SCALE')}
                  disabled={isPurchasingPack}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  $99
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              Credit packs never expire. Charges are billed via your active workspace payment method.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
