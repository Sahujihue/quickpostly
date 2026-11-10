// src/app/api/v1/admin/ai/tools/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { AIRepository } from '@/lib/ai/repository';

export async function GET() {
  try {
    const tools = await AIRepository.getAllTools(false);
    return apiResponse.success(tools);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch tools';
    return apiResponse.error({ message, code: 'ADMIN_TOOLS_ERROR', status: 500 });
  }
}
