// src/app/api/v1/admin/ai/errors/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { AIRepository } from '@/lib/ai/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    const errors = await AIRepository.getErrors(limit);
    return apiResponse.success(errors);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch AI errors';
    return apiResponse.error({ message, code: 'ADMIN_AI_ERRORS_ERROR', status: 500 });
  }
}
