// src/app/api/v1/posts/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SchedulingRepository } from '@/lib/scheduling/repository';
import { PostScheduler } from '@/lib/queue/scheduler';
import { SocialPlatformId } from '@/modules/social/types';
import { PostPublishStatus } from '@/modules/scheduling/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_peak_scale';
    const status = searchParams.get('status') as PostPublishStatus | null;
    const platform = searchParams.get('platform') as SocialPlatformId | null;
    const accountId = searchParams.get('accountId') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const posts = await SchedulingRepository.getPosts({
      workspaceId,
      status: status || undefined,
      platform: platform || undefined,
      accountId,
      categoryId,
      startDate,
      endDate,
    });

    return apiResponse.success(posts);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch scheduled posts';
    return apiResponse.error({ message, code: 'POSTS_FETCH_ERROR', status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      workspaceId,
      userId,
      content,
      mediaUrls,
      postType,
      platforms,
      accountIds,
      action, // 'PUBLISH_NOW' | 'SCHEDULE' | 'SAVE_DRAFT'
      scheduledAt,
      timezone,
      hashtags,
      callToAction,
      isRecurring,
      recurrenceRule,
      recurrenceInterval,
      recurrenceDays,
      evergreen,
      maxRecycles,
      categoryId,
    } = body;

    if (!content || !content.trim()) {
      return apiResponse.badRequest('Post content is required.');
    }

    if (action !== 'SAVE_DRAFT' && (!accountIds || accountIds.length === 0)) {
      return apiResponse.badRequest('At least one connected account must be selected to publish or schedule.');
    }

    const currentWorkspace = workspaceId || 'ws_peak_scale';
    const currentAction = action || 'SCHEDULE';

    if (currentAction === 'SAVE_DRAFT') {
      const draftPost = await SchedulingRepository.createPost(
        {
          workspaceId: currentWorkspace,
          userId,
          content,
          mediaUrls,
          postType,
          platforms: platforms || [],
          accountIds: accountIds || [],
          action: 'SAVE_DRAFT',
          scheduledAt,
          timezone,
          hashtags,
          callToAction,
          isRecurring,
          recurrenceRule,
          recurrenceInterval,
          recurrenceDays,
          evergreen,
          maxRecycles,
          categoryId,
        },
        'DRAFT'
      );
      return apiResponse.success(draftPost, 'Post draft saved successfully.', 201);
    }

    if (currentAction === 'PUBLISH_NOW') {
      const post = await SchedulingRepository.createPost(
        {
          workspaceId: currentWorkspace,
          userId,
          content,
          mediaUrls,
          postType,
          platforms: platforms || [],
          accountIds: accountIds || [],
          action: 'PUBLISH_NOW',
          scheduledAt: new Date().toISOString(),
          timezone,
          hashtags,
          callToAction,
          isRecurring,
          recurrenceRule,
          recurrenceInterval,
          recurrenceDays,
          evergreen,
          maxRecycles,
          categoryId,
        },
        'PROCESSING'
      );

      const execResult = await PostScheduler.executePublish(post.id);
      if (execResult.success) {
        return apiResponse.success(execResult.post, 'Post published to selected social platforms successfully.');
      } else {
        return apiResponse.error({
          message: execResult.errorMessage || 'Publishing failed on platform.',
          code: 'PUBLISHING_CONFIRMATION_FAILED',
          status: 400,
          details: execResult.post,
        });
      }
    }

    // Default: SCHEDULE
    if (!scheduledAt) {
      return apiResponse.badRequest('Schedule date/time is required.');
    }

    const scheduledPost = await SchedulingRepository.createPost(
      {
        workspaceId: currentWorkspace,
        userId,
        content,
        mediaUrls,
        postType,
        platforms: platforms || [],
        accountIds: accountIds || [],
        action: 'SCHEDULE',
        scheduledAt,
        timezone: timezone || 'UTC',
        hashtags,
        callToAction,
        isRecurring,
        recurrenceRule,
        recurrenceInterval,
        recurrenceDays,
        evergreen,
        maxRecycles,
        categoryId,
      },
      'SCHEDULED'
    );

    // Enqueue delayed job in BullMQ
    await PostScheduler.schedulePost(scheduledPost);

    return apiResponse.success(scheduledPost, `Post scheduled for ${scheduledPost.scheduledAt}.`, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create post';
    return apiResponse.error({ message, code: 'POST_CREATE_ERROR', status: 400 });
  }
}
