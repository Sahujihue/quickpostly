// src/modules/ai/types.ts
// Multi-AI Content Studio Type Definitions

export type AITaskType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'VOICE';

export type AIProviderId =
  | 'openai'
  | 'gemini'
  | 'claude'
  | 'grok'
  | 'deepseek'
  | 'openai_image'
  | 'gemini_image'
  | 'flux_compatible'
  | 'runway'
  | 'google_veo'
  | 'elevenlabs'
  | 'openai_voice';

export type AISelectionMode = 'AUTOMATIC' | 'MANUAL';

export type AIProviderStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'RATE_LIMITED';

export type AIGenerationStatus = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED';

export type AICreditType =
  | 'TEXT_GENERATION'
  | 'IMAGE_GENERATION'
  | 'VIDEO_GENERATION'
  | 'VOICE_GENERATION';

export type AICreditTransactionType =
  | 'MONTHLY_ALLOCATION'
  | 'PACK_PURCHASE'
  | 'DEDUCTION'
  | 'REFUND_REVERSAL'
  | 'ADMIN_ADJUSTMENT';

export interface AIModelMeta {
  id: string;
  providerId: AIProviderId;
  name: string;
  taskType: AITaskType;
  isEnabled: boolean;
  isDefault: boolean;
  contextWindow: number;
  maxOutputTokens: number;
  costPer1kInput: number; // USD
  costPer1kOutput: number; // USD
  creditCost: number;
  minSubscriptionTier?: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'BUSINESS' | 'AGENCY';
  capabilities: string[]; // ['chat', 'vision', 'reasoning', 'high-fidelity', 'fast']
}

export interface AIProviderMeta {
  id: AIProviderId;
  name: string;
  taskTypes: AITaskType[];
  brandColor: string;
  badgeText: string;
  description: string;
  defaultEndpoint: string;
  docsUrl: string;
  isTextProvider: boolean;
  isMediaProvider: boolean;
}

export interface AIToolMeta {
  id: string;
  name: string;
  slug: string;
  taskType: AITaskType;
  category: 'CONTENT' | 'OPTIMIZATION' | 'MARKETING' | 'MEDIA';
  description: string;
  systemPrompt: string;
  defaultModel: string;
  creditCost: number;
  creditType: AICreditType;
  isEnabled: boolean;
  iconName: string;
  displayOrder: number;
  supportedAspectRatios?: string[];
  supportedVoices?: string[];
}

export interface AIRoutingRuleDTO {
  id: string;
  taskType: AITaskType;
  primaryProviderId: AIProviderId;
  fallbackProviderIds: AIProviderId[];
  maxCostThreshold: number; // Max cost in USD to guard against silent expensive switching
  autoFallbackEnabled: boolean;
  timeoutMs: number;
  retryAttempts: number;
}

export interface AIWorkspaceCreditsDTO {
  workspaceId: string;
  monthlyTextCredits: number;
  monthlyImageCredits: number;
  monthlyVideoCredits: number;
  monthlyVoiceCredits: number;
  bonusTextCredits: number;
  bonusImageCredits: number;
  bonusVideoCredits: number;
  bonusVoiceCredits: number;
  textUsedThisMonth: number;
  imagesUsedThisMonth: number;
  videosUsedThisMonth: number;
  voiceSecondsUsedThisMonth: number;
  remainingTextCredits: number;
  remainingImageCredits: number;
  remainingVideoCredits: number;
  remainingVoiceCredits: number;
}

export interface AIGenerationInput {
  workspaceId: string;
  userId: string;
  toolSlug: string;
  selectionMode: AISelectionMode;
  providerId?: AIProviderId;
  modelId?: string;
  prompt: string;
  language?: string;
  tone?: string;
  targetAudience?: string;
  aspectRatio?: string; // 1:1, 16:9, 9:16
  voiceId?: string;
  additionalInstructions?: string;
}

export interface AIGenerationResult {
  id: string;
  toolSlug: string;
  toolName: string;
  selectionMode: AISelectionMode;
  providerId: AIProviderId;
  providerName: string;
  modelId: string;
  taskType: AITaskType;
  output: string;
  mediaUrls?: string[];
  tokensUsed: number;
  estimatedCostUsd: number;
  creditsDeducted: number;
  creditType: AICreditType;
  status: AIGenerationStatus;
  fallbackTriggered: boolean;
  fallbackReason?: string;
  createdAt: string;
}

// Backwards-compatibility stubs
export interface AiGenerationPrompt {
  topic: string;
  tone: 'professional' | 'witty' | 'casual' | 'urgent' | 'educational';
  targetPlatform: 'twitter' | 'linkedin' | 'facebook' | 'instagram';
  includeEmojis: boolean;
  includeHashtags: boolean;
  callToAction?: string;
  contentVariantCount?: number;
}

export interface GeneratedVariant {
  text: string;
  suggestedHashtags: string[];
  estimatedCharCount: number;
}
