// src/app/api/v1/ai/credits/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { AIRepository } from '@/lib/ai/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_default';
    const tier = searchParams.get('tier') || 'STARTER';

    const credits = await AIRepository.getWorkspaceCredits(workspaceId, tier);
    return apiResponse.success(credits);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch AI credits';
    return apiResponse.error({ message, code: 'AI_CREDITS_ERROR', status: 500 });
  }
}
