// src/app/api/v1/posts/queue/metrics/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { PostScheduler } from '@/lib/queue/scheduler';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_peak_scale';
    const metrics = await PostScheduler.getQueueMetrics(workspaceId);
    return apiResponse.success(metrics);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch queue metrics';
    return apiResponse.error({ message, code: 'QUEUE_METRICS_ERROR', status: 500 });
  }
}
