// src/app/api/v1/admin/ai/routing/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { AIRepository } from '@/lib/ai/repository';
import { AITaskType } from '@/modules/ai/types';

export async function GET() {
  try {
    const rules = await AIRepository.getAllRoutingRules();
    return apiResponse.success(rules);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch routing rules';
    return apiResponse.error({ message, code: 'ADMIN_ROUTING_ERROR', status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskType, primaryProviderId, fallbackProviderIds, maxCostThreshold, autoFallbackEnabled, timeoutMs } = body;

    if (!taskType || !primaryProviderId) {
      return apiResponse.badRequest('Missing taskType or primaryProviderId');
    }

    const updated = await AIRepository.updateRoutingRule(taskType as AITaskType, {
      primaryProviderId,
      fallbackProviderIds,
      maxCostThreshold,
      autoFallbackEnabled,
      timeoutMs,
    });

    return apiResponse.success(updated, `Routing rule for ${taskType} updated successfully.`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update routing rule';
    return apiResponse.error({ message, code: 'ADMIN_ROUTING_UPDATE_ERROR', status: 400 });
  }
}
