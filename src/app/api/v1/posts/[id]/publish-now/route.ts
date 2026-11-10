// src/app/api/v1/posts/[id]/publish-now/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { PostScheduler } from '@/lib/queue/scheduler';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await PostScheduler.executePublish(params.id);
    if (result.success) {
      return apiResponse.success(
        result.post,
        'Post published and confirmed by social platforms successfully.'
      );
    } else {
      return apiResponse.error({
        message: result.errorMessage || 'Publishing failed on platform.',
        code: 'PUBLISHING_FAILED',
        status: 400,
        details: result.post,
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Immediate publish execution failed';
    return apiResponse.error({ message, code: 'PUBLISH_NOW_ERROR', status: 400 });
  }
}
