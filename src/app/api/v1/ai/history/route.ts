// src/app/api/v1/ai/history/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { AIRepository } from '@/lib/ai/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_default';
    const toolSlug = searchParams.get('toolSlug') || undefined;
    const isDraft = searchParams.get('isDraft') === 'true' ? true : searchParams.get('isDraft') === 'false' ? false : undefined;
    const isTemplate = searchParams.get('isTemplate') === 'true' ? true : searchParams.get('isTemplate') === 'false' ? false : undefined;

    const generations = await AIRepository.getGenerations(workspaceId, {
      toolSlug,
      isDraft,
      isTemplate,
      limit: 50,
    });

    return apiResponse.success(generations);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch AI history';
    return apiResponse.error({ message, code: 'AI_HISTORY_ERROR', status: 500 });
  }
}
