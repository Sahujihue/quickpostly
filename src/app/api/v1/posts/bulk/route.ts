// src/app/api/v1/posts/bulk/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SchedulingRepository } from '@/lib/scheduling/repository';
import { PostScheduler } from '@/lib/queue/scheduler';
import { BulkScheduleItem } from '@/modules/scheduling/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workspaceId, userId, items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return apiResponse.badRequest('Bulk scheduling requires an array of items.');
    }

    const currentWorkspace = workspaceId || 'ws_peak_scale';
    const scheduledPosts = [];

    for (const item of items as BulkScheduleItem[]) {
      if (!item.content || !item.scheduledAt) continue;

      const post = await SchedulingRepository.createPost(
        {
          workspaceId: currentWorkspace,
          userId,
          content: item.content,
          mediaUrls: item.mediaUrls || [],
          postType: item.postType || 'TEXT',
          platforms: item.platforms || [],
          accountIds: item.accountIds || [],
          action: 'SCHEDULE',
          scheduledAt: item.scheduledAt,
          timezone: item.timezone || 'UTC',
          hashtags: item.hashtags || [],
          callToAction: item.callToAction,
          categoryId: item.categoryId,
        },
        'SCHEDULED'
      );

      await PostScheduler.schedulePost(post);
      scheduledPosts.push(post);
    }

    return apiResponse.success(
      {
        totalScheduled: scheduledPosts.length,
        posts: scheduledPosts,
      },
      `Successfully bulk-scheduled ${scheduledPosts.length} posts.`,
      201
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bulk scheduling failed';
    return apiResponse.error({ message, code: 'BULK_SCHEDULE_ERROR', status: 400 });
  }
}
