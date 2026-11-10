// src/app/api/v1/analytics/sync/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { AnalyticsRepository } from '@/lib/analytics/repository';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const workspaceId = body.workspaceId || 'ws_peak_scale';

    const result = await AnalyticsRepository.syncPlatformMetrics(workspaceId);
    return apiResponse.success(result, 'Social platform analytics synchronized successfully.');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Sync failed';
    return apiResponse.error({ message, code: 'ANALYTICS_SYNC_ERROR', status: 500 });
  }
}
