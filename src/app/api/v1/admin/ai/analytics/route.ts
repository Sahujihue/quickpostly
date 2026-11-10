// src/app/api/v1/admin/ai/analytics/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { AIRepository } from '@/lib/ai/repository';

export async function GET() {
  try {
    const analytics = await AIRepository.getAnalytics();
    return apiResponse.success(analytics);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch AI analytics';
    return apiResponse.error({ message, code: 'ADMIN_AI_ANALYTICS_ERROR', status: 500 });
  }
}
