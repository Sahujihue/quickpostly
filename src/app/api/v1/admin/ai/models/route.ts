// src/app/api/v1/admin/ai/models/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { AIRepository } from '@/lib/ai/repository';
import { AITaskType } from '@/modules/ai/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const taskType = searchParams.get('taskType') as AITaskType | undefined;
    const models = await AIRepository.getAllModels(taskType);
    return apiResponse.success(models);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch models';
    return apiResponse.error({ message, code: 'ADMIN_MODELS_ERROR', status: 500 });
  }
}
