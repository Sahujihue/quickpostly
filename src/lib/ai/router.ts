// src/lib/ai/router.ts
// Intelligent Multi-AI Routing Engine (Automatic & Manual Selection Modes)

import {
  AITaskType,
  AIProviderId,
  AIModelMeta,
  AIToolMeta,
  AIGenerationInput,
  AIGenerationResult,
} from '@/modules/ai/types';
import { AIRepository } from './repository';
import { AIProviderDispatcher, ProviderExecutionOutput } from './providers';

export interface RouteResolution {
  providerId: AIProviderId;
  providerName: string;
  model: AIModelMeta;
  tool: AIToolMeta;
  apiKey: string;
  apiEndpoint?: string;
  isFallback: boolean;
  fallbackReason?: string;
}

export class AIRouter {
  /**
   * Main entry point to route, execute, and verify AI generations
   */
  public static async generate(input: AIGenerationInput): Promise<AIGenerationResult> {
    // 1. Resolve Tool
    const tool = await AIRepository.getToolBySlug(input.toolSlug);
    if (!tool) {
      throw new Error(`AI Tool '${input.toolSlug}' not found.`);
    }
    if (!tool.isEnabled) {
      throw new Error(`AI Tool '${tool.name}' is currently disabled by platform administrator.`);
    }

    // 2. Pre-flight Credit Verification
    const credits = await AIRepository.getWorkspaceCredits(input.workspaceId);
    let availableCredits = 0;
    switch (tool.creditType) {
      case 'TEXT_GENERATION':
        availableCredits = credits.remainingTextCredits;
        break;
      case 'IMAGE_GENERATION':
        availableCredits = credits.remainingImageCredits;
        break;
      case 'VIDEO_GENERATION':
        availableCredits = credits.remainingVideoCredits;
        break;
      case 'VOICE_GENERATION':
        availableCredits = credits.remainingVoiceCredits;
        break;
    }

    if (availableCredits < tool.creditCost) {
      throw new Error(
        `Insufficient ${tool.creditType.replace('_', ' ').toLowerCase()} credits. Required: ${tool.creditCost}, Remaining: ${availableCredits}. Please upgrade your subscription or top up your credit balance.`
      );
    }

    // 3. Resolve Provider & Model (Automatic vs Manual Mode)
    let executionOutput: ProviderExecutionOutput | null = null;
    let selectedRoute: RouteResolution;
    let generationStatus: 'SUCCEEDED' | 'FAILED' = 'FAILED';
    let errorMessage: string | undefined = undefined;

    if (input.selectionMode === 'MANUAL') {
      selectedRoute = await this.resolveManualRoute(input, tool);
      try {
        executionOutput = await AIProviderDispatcher.execute({
          providerId: selectedRoute.providerId,
          model: selectedRoute.model,
          tool,
          prompt: input.prompt,
          systemPrompt: tool.systemPrompt,
          language: input.language,
          tone: input.tone,
          aspectRatio: input.aspectRatio,
          voiceId: input.voiceId,
          apiKey: selectedRoute.apiKey,
          apiEndpoint: selectedRoute.apiEndpoint,
        });
        generationStatus = 'SUCCEEDED';
      } catch (err: unknown) {
        errorMessage = err instanceof Error ? err.message : 'Execution failed';
        await AIRepository.recordError(selectedRoute.providerId, tool.taskType, errorMessage, {
          modelId: selectedRoute.model.id,
          workspaceId: input.workspaceId,
          recoveredByFallback: false,
        });
        // NEVER deduct credits for failed generations!
        throw new Error(`Generation failed with selected model ${selectedRoute.model.name}: ${errorMessage}`);
      }
    } else {
      // AUTOMATIC AI MODE with Intelligent Fallback Chain
      const autoResult = await this.executeAutomaticWithFallback(input, tool);
      selectedRoute = autoResult.route;
      executionOutput = autoResult.output;
      generationStatus = 'SUCCEEDED';
    }

    // 4. Successful Execution: Finalize Credit Deduction & Ledger Transaction
    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await AIRepository.deductCredits(
      input.workspaceId,
      input.userId,
      tool.creditType,
      tool.creditCost,
      generationId,
      tool.name
    );

    // 5. Record Generation in Repository
    const resultRecord = {
      id: generationId,
      workspaceId: input.workspaceId,
      userId: input.userId,
      toolSlug: tool.slug,
      toolName: tool.name,
      providerId: selectedRoute.providerId,
      providerName: selectedRoute.providerName,
      modelId: selectedRoute.model.id,
      taskType: tool.taskType,
      prompt: input.prompt,
      output: executionOutput.output,
      mediaUrls: executionOutput.mediaUrls,
      tokensUsed: executionOutput.tokensUsed,
      estimatedCostUsd: executionOutput.estimatedCostUsd,
      creditsDeducted: tool.creditCost,
      creditType: tool.creditType,
      status: generationStatus,
      selectionMode: input.selectionMode,
      fallbackTriggered: selectedRoute.isFallback,
      fallbackReason: selectedRoute.fallbackReason,
      isDraft: false,
      isTemplate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await AIRepository.recordGeneration(resultRecord);

    return resultRecord;
  }

  // ============================================================================
  // MANUAL AI ROUTE RESOLUTION
  // ============================================================================

  private static async resolveManualRoute(
    input: AIGenerationInput,
    tool: AIToolMeta
  ): Promise<RouteResolution> {
    if (!input.providerId) {
      throw new Error('Provider must be explicitly specified in Manual AI mode.');
    }

    const provider = await AIRepository.getProvider(input.providerId);
    if (!provider) {
      throw new Error(`Provider '${input.providerId}' not found in platform catalog.`);
    }
    if (!provider.isEnabled) {
      throw new Error(`Provider '${provider.name}' is currently disabled by administrator.`);
    }

    // Resolve Model
    const modelId = input.modelId || tool.defaultModel;
    const model = await AIRepository.getModel(modelId);
    if (!model) {
      throw new Error(`Model '${modelId}' not found.`);
    }
    if (!model.isEnabled) {
      throw new Error(`Model '${model.name}' is currently disabled.`);
    }
    if (model.taskType !== tool.taskType) {
      throw new Error(
        `Model '${model.name}' (${model.taskType}) is incompatible with tool '${tool.name}' (${tool.taskType}).`
      );
    }

    return {
      providerId: provider.id,
      providerName: provider.name,
      model,
      tool,
      apiKey: provider.apiKey,
      apiEndpoint: provider.apiEndpoint,
      isFallback: false,
    };
  }

  // ============================================================================
  // AUTOMATIC AI MODE (Priority, Capability, & Cost Safeguards)
  // ============================================================================

  private static async executeAutomaticWithFallback(
    input: AIGenerationInput,
    tool: AIToolMeta
  ): Promise<{ route: RouteResolution; output: ProviderExecutionOutput }> {
    const routingRule = await AIRepository.getRoutingRule(tool.taskType);
    const allProviders = await AIRepository.getAllProviders();
    const enabledProviders = allProviders.filter(
      (p) => p.isEnabled && p.taskTypes.includes(tool.taskType)
    );

    if (enabledProviders.length === 0) {
      throw new Error(
        `No enabled AI providers available for task type '${tool.taskType}'. Please contact platform administrator.`
      );
    }

    // Build ordered candidate list starting with primary provider
    const candidateIds: AIProviderId[] = [];

    // 1. Add Primary if valid and enabled
    if (enabledProviders.some((p) => p.id === routingRule.primaryProviderId)) {
      candidateIds.push(routingRule.primaryProviderId);
    }

    // 2. Add configured Fallbacks in order
    for (const fbId of routingRule.fallbackProviderIds) {
      if (!candidateIds.includes(fbId) && enabledProviders.some((p) => p.id === fbId)) {
        candidateIds.push(fbId);
      }
    }

    // 3. Add any remaining enabled providers by admin priority
    enabledProviders.forEach((p) => {
      if (!candidateIds.includes(p.id)) {
        candidateIds.push(p.id);
      }
    });

    // Resolve primary provider model to determine baseline cost safeguard
    const primaryProvider = enabledProviders.find((p) => p.id === candidateIds[0]) || enabledProviders[0];
    const primaryModel = await this.getBestModelForTask(primaryProvider.id, tool.taskType);
    const baselineCost = primaryModel.costPer1kOutput || primaryModel.costPer1kInput || 0.01;

    let lastError: Error | null = null;

    for (let i = 0; i < candidateIds.length; i++) {
      const providerId = candidateIds[i];
      const provider = enabledProviders.find((p) => p.id === providerId)!;
      const model = await this.getBestModelForTask(provider.id, tool.taskType);
      const isFallback = i > 0;

      // CRITICAL REQUIREMENT: Never silently switch to a more expensive provider!
      const candidateCost = model.costPer1kOutput || model.costPer1kInput || 0.01;
      if (isFallback && candidateCost > baselineCost * 1.05 && candidateCost > routingRule.maxCostThreshold) {
        console.warn(
          `[AIRouter] Skipping fallback candidate '${provider.name}' (${candidateCost}/unit) because it is more expensive than primary '${primaryProvider.name}' (${baselineCost}/unit).`
        );
        continue;
      }

      const route: RouteResolution = {
        providerId: provider.id,
        providerName: provider.name,
        model,
        tool,
        apiKey: provider.apiKey,
        apiEndpoint: provider.apiEndpoint,
        isFallback,
        fallbackReason: isFallback ? `Primary provider '${primaryProvider.name}' was unavailable; routed via intelligent failover.` : undefined,
      };

      try {
        const output = await AIProviderDispatcher.execute({
          providerId: provider.id,
          model,
          tool,
          prompt: input.prompt,
          systemPrompt: tool.systemPrompt,
          language: input.language,
          tone: input.tone,
          aspectRatio: input.aspectRatio,
          voiceId: input.voiceId,
          apiKey: provider.apiKey,
          apiEndpoint: provider.apiEndpoint,
        });

        // If recovered through fallback, record recovery telemetry
        if (isFallback && lastError) {
          await AIRepository.recordError(primaryProvider.id, tool.taskType, lastError.message, {
            workspaceId: input.workspaceId,
            recoveredByFallback: true,
            fallbackProviderId: provider.id,
          });
        }

        return { route, output };
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error('Unknown error');
        console.warn(`[AIRouter] Provider '${provider.name}' failed: ${lastError.message}. Attempting fallback...`);

        await AIRepository.recordError(provider.id, tool.taskType, lastError.message, {
          modelId: model.id,
          workspaceId: input.workspaceId,
          recoveredByFallback: false,
        });

        if (!routingRule.autoFallbackEnabled) {
          throw new Error(`Provider '${provider.name}' failed and automatic fallback is disabled by administrator.`);
        }
      }
    }

    // NEVER deduct credits for failed generations!
    throw new Error(
      `All compatible AI providers failed for task '${tool.name}'. Details: ${lastError?.message || 'Connection unavailable'}. No credits were deducted.`
    );
  }

  private static async getBestModelForTask(
    providerId: AIProviderId,
    taskType: AITaskType
  ): Promise<AIModelMeta> {
    const models = await AIRepository.getAllModels(taskType);
    const providerModels = models.filter((m) => m.providerId === providerId && m.isEnabled);

    if (providerModels.length === 0) {
      throw new Error(`No enabled models found for provider '${providerId}'.`);
    }

    // Prefer default model if enabled
    const defaultModel = providerModels.find((m) => m.isDefault);
    return defaultModel || providerModels[0];
  }
}
