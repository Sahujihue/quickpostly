// src/app/api/v1/ai/tools/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { AIRepository } from '@/lib/ai/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const enabledOnly = searchParams.get('all') !== 'true';
    const tools = await AIRepository.getAllTools(enabledOnly);
    return apiResponse.success(tools);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch AI tools';
    return apiResponse.error({ message, code: 'AI_TOOLS_ERROR', status: 500 });
  }
}
