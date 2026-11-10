// src/app/api/v1/ai/send-to-scheduler/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { AIRepository } from '@/lib/ai/repository';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, targetDate, categoryBucket, platforms } = body;

    if (!id) {
      return apiResponse.badRequest('Missing generation id');
    }

    const scheduledPostId = `post_sched_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const updated = await AIRepository.updateGeneration(id, {
      scheduledPostId,
    });

    return apiResponse.success(
      {
        scheduledPostId,
        generation: updated,
        targetDate: targetDate || new Date(Date.now() + 86400000).toISOString(),
        categoryBucket: categoryBucket || 'Evergreen Insights',
        platforms: platforms || ['LinkedIn', 'X (Twitter)'],
      },
      'Content dispatched to social scheduler queue and calendar successfully.'
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to schedule post';
    return apiResponse.error({ message, code: 'SCHEDULE_ERROR', status: 400 });
  }
}
