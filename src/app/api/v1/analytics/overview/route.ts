// src/app/api/v1/analytics/overview/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { AnalyticsRepository } from '@/lib/analytics/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_peak_scale';
    const timeRange = (searchParams.get('timeRange') || '30d') as '7d' | '30d' | '90d';

    const data = await AnalyticsRepository.getAnalyticsOverview(workspaceId, timeRange);
    return apiResponse.success(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch analytics overview';
    return apiResponse.error({ message, code: 'ANALYTICS_OVERVIEW_ERROR', status: 500 });
  }
}
