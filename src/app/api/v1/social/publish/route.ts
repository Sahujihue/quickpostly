// src/app/api/v1/social/publish/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SocialPublisher } from '@/lib/social/publisher';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workspaceId, userId, accountIds, content, mediaUrls, postType, scheduledTime } = body;

    if (!accountIds || !Array.isArray(accountIds) || accountIds.length === 0 || !content) {
      return apiResponse.badRequest('Missing required fields: accountIds array, content string');
    }

    const results = await SocialPublisher.publish({
      workspaceId: workspaceId || 'ws_peak_scale',
      userId: userId || 'usr_current',
      accountIds,
      content,
      mediaUrls,
      postType: postType || 'TEXT',
      scheduledTime,
    });

    const anyFailed = results.some((r) => !r.success);

    return apiResponse.success(
      results,
      anyFailed ? 'Publishing partially completed with errors.' : 'Published to all selected social accounts successfully.'
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Publishing operation failed';
    return apiResponse.error({ message, code: 'PUBLISHING_ERROR', status: 400 });
  }
}
