// src/app/api/v1/admin/analytics/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { AnalyticsRepository } from '@/lib/analytics/repository';

export async function GET() {
  try {
    const summary = await AnalyticsRepository.getAdminAnalytics();
    return apiResponse.success(summary);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch admin platform analytics';
    return apiResponse.error({ message, code: 'ADMIN_ANALYTICS_ERROR', status: 500 });
  }
}
