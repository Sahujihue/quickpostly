// src/app/api/v1/ai/generate/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { AIRouter } from '@/lib/ai/router';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      workspaceId,
      userId,
      toolSlug,
      selectionMode,
      providerId,
      modelId,
      prompt,
      language,
      tone,
      targetAudience,
      aspectRatio,
      voiceId,
      additionalInstructions,
    } = body;

    if (!workspaceId || !toolSlug || !prompt) {
      return apiResponse.badRequest('Missing required fields: workspaceId, toolSlug, prompt');
    }

    const result = await AIRouter.generate({
      workspaceId,
      userId: userId || 'usr_current',
      toolSlug,
      selectionMode: selectionMode === 'MANUAL' ? 'MANUAL' : 'AUTOMATIC',
      providerId,
      modelId,
      prompt,
      language,
      tone,
      targetAudience,
      aspectRatio,
      voiceId,
      additionalInstructions,
    });

    return apiResponse.success(result, `Content generated successfully via ${result.providerName}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI Generation failed';
    return apiResponse.error({ message, code: 'AI_GENERATION_ERROR', status: 400 });
  }
}
