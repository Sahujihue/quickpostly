// src/lib/ai/repository.ts
// Dual-Mode Repository for AI Content Studio (Prisma with JSON Store Fallback)

import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import {
  AIProviderId,
  AITaskType,
  AIProviderStatus,
  AIGenerationStatus,
  AICreditType,
  AICreditTransactionType,
  AIProviderMeta,
  AIModelMeta,
  AIToolMeta,
  AIRoutingRuleDTO,
  AIWorkspaceCreditsDTO,
  AIGenerationResult,
} from '@/modules/ai/types';
import {
  AI_PROVIDERS_CATALOG,
  AI_MODELS_CATALOG,
  AI_TOOLS_CATALOG,
  DEFAULT_ROUTING_RULES,
} from '@/modules/ai/catalog';

export interface ProviderStoreConfig {
  id: AIProviderId;
  name: string;
  taskTypes: AITaskType[];
  isEnabled: boolean;
  apiKey: string;
  apiEndpoint?: string;
  priority: number;
  connectionStatus: AIProviderStatus;
  latencyMs?: number;
  lastTestedAt?: string;
}

export interface AIGenerationRecord {
  id: string;
  workspaceId: string;
  userId: string;
  toolSlug: string;
  toolName: string;
  providerId: AIProviderId;
  providerName: string;
  modelId: string;
  taskType: AITaskType;
  prompt: string;
  output: string;
  mediaUrls?: string[];
  tokensUsed: number;
  estimatedCostUsd: number;
  creditsDeducted: number;
  creditType: AICreditType;
  status: AIGenerationStatus;
  selectionMode: 'AUTOMATIC' | 'MANUAL';
  fallbackTriggered: boolean;
  fallbackReason?: string;
  isDraft: boolean;
  isTemplate: boolean;
  templateTitle?: string;
  scheduledPostId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AICreditTxRecord {
  id: string;
  workspaceId: string;
  userId: string;
  generationId?: string;
  creditType: AICreditType;
  amount: number;
  balanceAfter: number;
  type: AICreditTransactionType;
  description: string;
  createdAt: string;
}

export interface AIProviderErrorRecord {
  id: string;
  providerId: AIProviderId;
  modelId?: string;
  taskType: AITaskType;
  httpStatusCode?: number;
  errorMessage: string;
  workspaceId?: string;
  recoveredByFallback: boolean;
  fallbackProviderId?: AIProviderId;
  createdAt: string;
}

interface AIStoreData {
  providers: Record<AIProviderId, ProviderStoreConfig>;
  models: Record<string, AIModelMeta>;
  tools: Record<string, AIToolMeta>;
  routingRules: Record<AITaskType, AIRoutingRuleDTO>;
  workspaceCredits: Record<string, AIWorkspaceCreditsDTO>;
  generations: AIGenerationRecord[];
  creditTransactions: AICreditTxRecord[];
  errors: AIProviderErrorRecord[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_FILE = path.join(DATA_DIR, 'ai_store.json');

// Initialize Provider Configs
const INITIAL_PROVIDER_CONFIGS: Record<AIProviderId, ProviderStoreConfig> = {} as any;
AI_PROVIDERS_CATALOG.forEach((p, index) => {
  const isEnabled = ['openai', 'gemini', 'claude', 'deepseek', 'openai_image', 'runway', 'elevenlabs'].includes(p.id);
  INITIAL_PROVIDER_CONFIGS[p.id] = {
    id: p.id,
    name: p.name,
    taskTypes: p.taskTypes,
    isEnabled,
    apiKey: isEnabled ? `sandbox_key_${p.id}_live_prod_test` : '',
    apiEndpoint: p.defaultEndpoint,
    priority: index + 1,
    connectionStatus: isEnabled ? 'CONNECTED' : 'DISCONNECTED',
    latencyMs: isEnabled ? 45 + index * 10 : undefined,
    lastTestedAt: isEnabled ? new Date().toISOString() : undefined,
  };
});

// Initialize Models Configs
const INITIAL_MODELS: Record<string, AIModelMeta> = {};
AI_MODELS_CATALOG.forEach((m) => {
  INITIAL_MODELS[m.id] = { ...m };
});

// Initialize Tools Configs
const INITIAL_TOOLS: Record<string, AIToolMeta> = {};
AI_TOOLS_CATALOG.forEach((t) => {
  INITIAL_TOOLS[t.slug] = { ...t };
});

// Initialize Routing Rules
const INITIAL_ROUTING: Record<AITaskType, AIRoutingRuleDTO> = {} as any;
DEFAULT_ROUTING_RULES.forEach((r) => {
  INITIAL_ROUTING[r.taskType] = { ...r };
});

export class AIRepository {
  private static ensureStore(): AIStoreData {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(STORE_FILE)) {
      const initial: AIStoreData = {
        providers: INITIAL_PROVIDER_CONFIGS,
        models: INITIAL_MODELS,
        tools: INITIAL_TOOLS,
        routingRules: INITIAL_ROUTING,
        workspaceCredits: {},
        generations: [],
        creditTransactions: [],
        errors: [],
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }

    try {
      const content = fs.readFileSync(STORE_FILE, 'utf-8');
      const data: AIStoreData = JSON.parse(content);

      // Ensure all catalog items exist
      AI_PROVIDERS_CATALOG.forEach((p, idx) => {
        if (!data.providers[p.id]) {
          data.providers[p.id] = INITIAL_PROVIDER_CONFIGS[p.id];
        }
      });
      AI_MODELS_CATALOG.forEach((m) => {
        if (!data.models[m.id]) {
          data.models[m.id] = { ...m };
        }
      });
      AI_TOOLS_CATALOG.forEach((t) => {
        if (!data.tools[t.slug]) {
          data.tools[t.slug] = { ...t };
        }
      });
      DEFAULT_ROUTING_RULES.forEach((r) => {
        if (!data.routingRules[r.taskType]) {
          data.routingRules[r.taskType] = { ...r };
        }
      });

      if (!data.workspaceCredits) data.workspaceCredits = {};
      if (!data.generations) data.generations = [];
      if (!data.creditTransactions) data.creditTransactions = [];
      if (!data.errors) data.errors = [];

      return data;
    } catch {
      const fallback: AIStoreData = {
        providers: INITIAL_PROVIDER_CONFIGS,
        models: INITIAL_MODELS,
        tools: INITIAL_TOOLS,
        routingRules: INITIAL_ROUTING,
        workspaceCredits: {},
        generations: [],
        creditTransactions: [],
        errors: [],
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(fallback, null, 2), 'utf-8');
      return fallback;
    }
  }

  private static saveStore(data: AIStoreData): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  // ============================================================================
  // 1. PROVIDERS MANAGEMENT
  // ============================================================================

  public static async getAllProviders(): Promise<ProviderStoreConfig[]> {
    const store = this.ensureStore();
    return Object.values(store.providers).sort((a, b) => a.priority - b.priority);
  }

  public static async getProvider(id: AIProviderId): Promise<ProviderStoreConfig | null> {
    const store = this.ensureStore();
    return store.providers[id] || null;
  }

  public static async updateProvider(
    id: AIProviderId,
    updates: Partial<ProviderStoreConfig>
  ): Promise<ProviderStoreConfig> {
    const store = this.ensureStore();
    const existing = store.providers[id];
    if (!existing) {
      throw new Error(`Provider '${id}' not found in catalog.`);
    }

    const updated: ProviderStoreConfig = {
      ...existing,
      ...updates,
      id: existing.id,
      name: existing.name,
      taskTypes: existing.taskTypes,
    };

    store.providers[id] = updated;
    this.saveStore(store);

    try {
      await prisma.aIProvider.upsert({
        where: { id: updated.id },
        update: {
          isEnabled: updated.isEnabled,
          apiKey: updated.apiKey,
          apiEndpoint: updated.apiEndpoint,
          priority: updated.priority,
          connectionStatus: updated.connectionStatus as any,
          latencyMs: updated.latencyMs,
          lastTestedAt: updated.lastTestedAt ? new Date(updated.lastTestedAt) : null,
        },
        create: {
          id: updated.id,
          name: updated.name,
          taskTypes: updated.taskTypes as any,
          isEnabled: updated.isEnabled,
          apiKey: updated.apiKey,
          apiEndpoint: updated.apiEndpoint,
          priority: updated.priority,
          connectionStatus: updated.connectionStatus as any,
          latencyMs: updated.latencyMs,
          lastTestedAt: updated.lastTestedAt ? new Date(updated.lastTestedAt) : null,
        },
      });
    } catch {
      // Prisma offline fallback handled
    }

    return updated;
  }

  // ============================================================================
  // 2. MODELS MANAGEMENT
  // ============================================================================

  public static async getAllModels(taskType?: AITaskType): Promise<AIModelMeta[]> {
    const store = this.ensureStore();
    const list = Object.values(store.models);
    if (taskType) {
      return list.filter((m) => m.taskType === taskType);
    }
    return list;
  }

  public static async getModel(id: string): Promise<AIModelMeta | null> {
    const store = this.ensureStore();
    return store.models[id] || null;
  }

  public static async updateModel(id: string, updates: Partial<AIModelMeta>): Promise<AIModelMeta> {
    const store = this.ensureStore();
    const existing = store.models[id];
    if (!existing) {
      throw new Error(`Model '${id}' not found.`);
    }

    const updated: AIModelMeta = { ...existing, ...updates };
    store.models[id] = updated;
    this.saveStore(store);
    return updated;
  }

  // ============================================================================
  // 3. TOOLS MANAGEMENT
  // ============================================================================

  public static async getAllTools(enabledOnly: boolean = false): Promise<AIToolMeta[]> {
    const store = this.ensureStore();
    const tools = Object.values(store.tools).sort((a, b) => a.displayOrder - b.displayOrder);
    if (enabledOnly) {
      return tools.filter((t) => t.isEnabled);
    }
    return tools;
  }

  public static async getToolBySlug(slug: string): Promise<AIToolMeta | null> {
    const store = this.ensureStore();
    return store.tools[slug] || null;
  }

  public static async updateTool(slug: string, updates: Partial<AIToolMeta>): Promise<AIToolMeta> {
    const store = this.ensureStore();
    const existing = store.tools[slug];
    if (!existing) {
      throw new Error(`Tool '${slug}' not found.`);
    }

    const updated: AIToolMeta = { ...existing, ...updates };
    store.tools[slug] = updated;
    this.saveStore(store);
    return updated;
  }

  // ============================================================================
  // 4. ROUTING RULES (Automatic AI Mode)
  // ============================================================================

  public static async getRoutingRule(taskType: AITaskType): Promise<AIRoutingRuleDTO> {
    const store = this.ensureStore();
    return (
      store.routingRules[taskType] ||
      DEFAULT_ROUTING_RULES.find((r) => r.taskType === taskType)!
    );
  }

  public static async getAllRoutingRules(): Promise<AIRoutingRuleDTO[]> {
    const store = this.ensureStore();
    return Object.values(store.routingRules);
  }

  public static async updateRoutingRule(
    taskType: AITaskType,
    updates: Partial<AIRoutingRuleDTO>
  ): Promise<AIRoutingRuleDTO> {
    const store = this.ensureStore();
    const existing = await this.getRoutingRule(taskType);
    const updated: AIRoutingRuleDTO = { ...existing, ...updates, taskType };
    store.routingRules[taskType] = updated;
    this.saveStore(store);
    return updated;
  }

  // ============================================================================
  // 5. WORKSPACE CREDITS & TRANSACTIONS
  // ============================================================================

  public static async getWorkspaceCredits(
    workspaceId: string,
    tier: string = 'STARTER'
  ): Promise<AIWorkspaceCreditsDTO> {
    const store = this.ensureStore();
    if (!store.workspaceCredits[workspaceId]) {
      // Initialize based on subscription plan tier
      const tierNorm = tier.toUpperCase();
      let monthlyText = 250;
      let monthlyImage = 50;
      let monthlyVideo = 10;
      let monthlyVoice = 25;

      if (tierNorm === 'FREE' || tierNorm.includes('TRIAL')) {
        monthlyText = 50;
        monthlyImage = 10;
        monthlyVideo = 2;
        monthlyVoice = 5;
      } else if (tierNorm === 'PROFESSIONAL' || tierNorm.includes('PRO')) {
        monthlyText = 1000;
        monthlyImage = 200;
        monthlyVideo = 40;
        monthlyVoice = 100;
      } else if (tierNorm === 'BUSINESS') {
        monthlyText = 5000;
        monthlyImage = 1000;
        monthlyVideo = 150;
        monthlyVoice = 500;
      } else if (tierNorm === 'AGENCY') {
        monthlyText = 25000;
        monthlyImage = 5000;
        monthlyVideo = 500;
        monthlyVoice = 2500;
      }

      store.workspaceCredits[workspaceId] = {
        workspaceId,
        monthlyTextCredits: monthlyText,
        monthlyImageCredits: monthlyImage,
        monthlyVideoCredits: monthlyVideo,
        monthlyVoiceCredits: monthlyVoice,
        bonusTextCredits: 0,
        bonusImageCredits: 0,
        bonusVideoCredits: 0,
        bonusVoiceCredits: 0,
        textUsedThisMonth: 0,
        imagesUsedThisMonth: 0,
        videosUsedThisMonth: 0,
        voiceSecondsUsedThisMonth: 0,
        remainingTextCredits: monthlyText,
        remainingImageCredits: monthlyImage,
        remainingVideoCredits: monthlyVideo,
        remainingVoiceCredits: monthlyVoice,
      };
      this.saveStore(store);
    }

    const c = store.workspaceCredits[workspaceId];
    // Recalculate remainings
    c.remainingTextCredits = Math.max(0, c.monthlyTextCredits + c.bonusTextCredits - c.textUsedThisMonth);
    c.remainingImageCredits = Math.max(0, c.monthlyImageCredits + c.bonusImageCredits - c.imagesUsedThisMonth);
    c.remainingVideoCredits = Math.max(0, c.monthlyVideoCredits + c.bonusVideoCredits - c.videosUsedThisMonth);
    c.remainingVoiceCredits = Math.max(0, c.monthlyVoiceCredits + c.bonusVoiceCredits - c.voiceSecondsUsedThisMonth);

    return c;
  }

  public static async deductCredits(
    workspaceId: string,
    userId: string,
    creditType: AICreditType,
    amount: number,
    generationId: string,
    toolName: string
  ): Promise<{ success: boolean; balanceRemaining: number }> {
    const store = this.ensureStore();
    const credits = await this.getWorkspaceCredits(workspaceId);

    let remaining = 0;
    switch (creditType) {
      case 'TEXT_GENERATION':
        remaining = credits.remainingTextCredits;
        if (remaining < amount) {
          throw new Error(`Insufficient text AI credits. Required: ${amount}, Remaining: ${remaining}. Upgrade or purchase a credit pack.`);
        }
        credits.textUsedThisMonth += amount;
        remaining = Math.max(0, credits.monthlyTextCredits + credits.bonusTextCredits - credits.textUsedThisMonth);
        break;

      case 'IMAGE_GENERATION':
        remaining = credits.remainingImageCredits;
        if (remaining < amount) {
          throw new Error(`Insufficient image AI credits. Required: ${amount}, Remaining: ${remaining}.`);
        }
        credits.imagesUsedThisMonth += amount;
        remaining = Math.max(0, credits.monthlyImageCredits + credits.bonusImageCredits - credits.imagesUsedThisMonth);
        break;

      case 'VIDEO_GENERATION':
        remaining = credits.remainingVideoCredits;
        if (remaining < amount) {
          throw new Error(`Insufficient video AI credits. Required: ${amount}, Remaining: ${remaining}.`);
        }
        credits.videosUsedThisMonth += amount;
        remaining = Math.max(0, credits.monthlyVideoCredits + credits.bonusVideoCredits - credits.videosUsedThisMonth);
        break;

      case 'VOICE_GENERATION':
        remaining = credits.remainingVoiceCredits;
        if (remaining < amount) {
          throw new Error(`Insufficient voice AI credits. Required: ${amount}, Remaining: ${remaining}.`);
        }
        credits.voiceSecondsUsedThisMonth += amount;
        remaining = Math.max(0, credits.monthlyVoiceCredits + credits.bonusVoiceCredits - credits.voiceSecondsUsedThisMonth);
        break;
    }

    store.workspaceCredits[workspaceId] = credits;

    // Record Transaction
    const tx: AICreditTxRecord = {
      id: `tx_credit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      workspaceId,
      userId,
      generationId,
      creditType,
      amount: -amount,
      balanceAfter: remaining,
      type: 'DEDUCTION',
      description: `Executed '${toolName}' (${amount} ${creditType.toLowerCase()} credit)`,
      createdAt: new Date().toISOString(),
    };
    store.creditTransactions.unshift(tx);
    this.saveStore(store);

    return { success: true, balanceRemaining: remaining };
  }

  public static async addCreditPack(
    workspaceId: string,
    userId: string,
    packType: 'STARTER_BOOST' | 'CREATIVE_PACK' | 'AGENCY_SCALE'
  ): Promise<AIWorkspaceCreditsDTO> {
    const store = this.ensureStore();
    const credits = await this.getWorkspaceCredits(workspaceId);

    let textAdd = 0;
    let imgAdd = 0;
    let vidAdd = 0;
    let voiceAdd = 0;

    if (packType === 'STARTER_BOOST') {
      textAdd = 500;
      imgAdd = 50;
    } else if (packType === 'CREATIVE_PACK') {
      textAdd = 1500;
      imgAdd = 150;
      vidAdd = 20;
    } else if (packType === 'AGENCY_SCALE') {
      textAdd = 5000;
      imgAdd = 500;
      vidAdd = 80;
      voiceAdd = 200;
    }

    credits.bonusTextCredits += textAdd;
    credits.bonusImageCredits += imgAdd;
    credits.bonusVideoCredits += vidAdd;
    credits.bonusVoiceCredits += voiceAdd;

    store.workspaceCredits[workspaceId] = credits;

    const tx: AICreditTxRecord = {
      id: `tx_pack_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      workspaceId,
      userId,
      creditType: 'TEXT_GENERATION',
      amount: textAdd,
      balanceAfter: credits.remainingTextCredits + textAdd,
      type: 'PACK_PURCHASE',
      description: `Purchased Credit Pack '${packType}' (+${textAdd} text, +${imgAdd} images, +${vidAdd} video)`,
      createdAt: new Date().toISOString(),
    };
    store.creditTransactions.unshift(tx);
    this.saveStore(store);

    return credits;
  }

  // ============================================================================
  // 6. GENERATION RECORDS & DRAFTS / TEMPLATES
  // ============================================================================

  public static async recordGeneration(record: AIGenerationRecord): Promise<AIGenerationRecord> {
    const store = this.ensureStore();
    store.generations.unshift(record);
    this.saveStore(store);

    try {
      await prisma.aIGeneration.create({
        data: {
          id: record.id,
          workspaceId: record.workspaceId,
          userId: record.userId,
          toolId: record.toolSlug,
          providerId: record.providerId,
          modelId: record.modelId,
          taskType: record.taskType as any,
          prompt: record.prompt,
          output: record.output,
          mediaUrls: record.mediaUrls as any,
          tokensUsed: record.tokensUsed,
          estimatedCostUsd: record.estimatedCostUsd,
          creditsDeducted: record.creditsDeducted,
          creditType: record.creditType as any,
          status: record.status as any,
          selectionMode: record.selectionMode,
          fallbackTriggered: record.fallbackTriggered,
          isDraft: record.isDraft,
          isTemplate: record.isTemplate,
        },
      });
    } catch {
      // Prisma fallback
    }

    return record;
  }

  public static async getGenerations(
    workspaceId: string,
    filter?: { isDraft?: boolean; isTemplate?: boolean; toolSlug?: string; limit?: number }
  ): Promise<AIGenerationRecord[]> {
    const store = this.ensureStore();
    let list = store.generations.filter((g) => g.workspaceId === workspaceId);

    if (filter?.isDraft !== undefined) {
      list = list.filter((g) => g.isDraft === filter.isDraft);
    }
    if (filter?.isTemplate !== undefined) {
      list = list.filter((g) => g.isTemplate === filter.isTemplate);
    }
    if (filter?.toolSlug) {
      list = list.filter((g) => g.toolSlug === filter.toolSlug);
    }

    return list.slice(0, filter?.limit || 50);
  }

  public static async updateGeneration(
    id: string,
    updates: Partial<AIGenerationRecord>
  ): Promise<AIGenerationRecord> {
    const store = this.ensureStore();
    const idx = store.generations.findIndex((g) => g.id === id);
    if (idx === -1) {
      throw new Error(`Generation record '${id}' not found.`);
    }

    const updated = {
      ...store.generations[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    store.generations[idx] = updated;
    this.saveStore(store);
    return updated;
  }

  // ============================================================================
  // 7. ERROR LOGGING & TELEMETRY
  // ============================================================================

  public static async recordError(
    providerId: AIProviderId,
    taskType: AITaskType,
    errorMessage: string,
    options?: {
      modelId?: string;
      httpStatusCode?: number;
      workspaceId?: string;
      recoveredByFallback?: boolean;
      fallbackProviderId?: AIProviderId;
    }
  ): Promise<AIProviderErrorRecord> {
    const store = this.ensureStore();
    const errRecord: AIProviderErrorRecord = {
      id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      providerId,
      modelId: options?.modelId,
      taskType,
      httpStatusCode: options?.httpStatusCode || 500,
      errorMessage,
      workspaceId: options?.workspaceId,
      recoveredByFallback: options?.recoveredByFallback || false,
      fallbackProviderId: options?.fallbackProviderId,
      createdAt: new Date().toISOString(),
    };

    store.errors.unshift(errRecord);
    this.saveStore(store);

    try {
      await prisma.aIProviderError.create({
        data: {
          id: errRecord.id,
          providerId: errRecord.providerId,
          modelId: errRecord.modelId,
          taskType: errRecord.taskType as any,
          httpStatusCode: errRecord.httpStatusCode,
          errorMessage: errRecord.errorMessage,
          workspaceId: errRecord.workspaceId,
          recoveredByFallback: errRecord.recoveredByFallback,
          fallbackProviderId: errRecord.fallbackProviderId,
        },
      });
    } catch {
      // Prisma fallback
    }

    return errRecord;
  }

  public static async getErrors(limit: number = 30): Promise<AIProviderErrorRecord[]> {
    const store = this.ensureStore();
    return store.errors.slice(0, limit);
  }

  public static async getAnalytics(): Promise<{
    totalGenerations: number;
    totalTokensUsed: number;
    totalEstimatedCostUsd: number;
    totalMediaGenerated: number;
    activeProvidersCount: number;
    fallbackRecoveryRate: number;
    providerUsageBreakdown: Record<string, number>;
  }> {
    const store = this.ensureStore();
    const gens = store.generations;

    const totalTokensUsed = gens.reduce((sum, g) => sum + (g.tokensUsed || 0), 0);
    const totalEstimatedCostUsd = gens.reduce((sum, g) => sum + (g.estimatedCostUsd || 0), 0);
    const totalMediaGenerated = gens.filter((g) => g.taskType !== 'TEXT').length;

    const activeProvidersCount = Object.values(store.providers).filter(
      (p) => p.isEnabled && p.connectionStatus === 'CONNECTED'
    ).length;

    const providerUsageBreakdown: Record<string, number> = {};
    gens.forEach((g) => {
      providerUsageBreakdown[g.providerId] = (providerUsageBreakdown[g.providerId] || 0) + 1;
    });

    const totalErrors = store.errors.length;
    const recoveredErrors = store.errors.filter((e) => e.recoveredByFallback).length;
    const fallbackRecoveryRate =
      totalErrors > 0 ? Number(((recoveredErrors / totalErrors) * 100).toFixed(1)) : 100;

    return {
      totalGenerations: gens.length,
      totalTokensUsed,
      totalEstimatedCostUsd: Number(totalEstimatedCostUsd.toFixed(4)),
      totalMediaGenerated,
      activeProvidersCount,
      fallbackRecoveryRate,
      providerUsageBreakdown,
    };
  }
}
