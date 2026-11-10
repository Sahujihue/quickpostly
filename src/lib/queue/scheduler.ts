// src/lib/queue/scheduler.ts
// BullMQ Post Scheduler, Job Monitor, Duplicate Prevention & Notifications Engine

import { getQueue, QUEUE_NAMES, PostPublishJobData } from './index';
import { checkRedisConnection } from '../redis';
import { logger } from '../logger';
import { SchedulingRepository } from '../scheduling/repository';
import { SocialRepository } from '../social/repository';
import { SocialPublisher } from '../social/publisher';
import { ScheduledPostDTO, QueueMetricsDTO, RecurrenceRule } from '@/modules/scheduling/types';

export class PostScheduler {
  /**
   * Enqueues or updates a scheduled publishing job in BullMQ with deduplication
   */
  public static async schedulePost(post: ScheduledPostDTO): Promise<string> {
    if (!post.scheduledAt) {
      throw new Error('Scheduled date/time is required to schedule a post.');
    }

    const scheduledTimeMs = new Date(post.scheduledAt).getTime();
    const nowMs = Date.now();
    const delayMs = Math.max(0, scheduledTimeMs - nowMs);
    const jobId = `post_${post.id}`;

    try {
      const { connected } = await checkRedisConnection();
      if (connected) {
        const queue = getQueue(QUEUE_NAMES.POST_PUBLISHING);

        // Remove any existing job with the same ID (deduplication / rescheduling)
        const existingJob = await queue.getJob(jobId);
        if (existingJob) {
          await existingJob.remove();
          logger.info(`Removed existing BullMQ job ${jobId} for rescheduling.`);
        }

        const jobData: PostPublishJobData = {
          postId: post.id,
          workspaceId: post.workspaceId,
          socialAccountId: post.accountIds[0] || '',
          scheduledTime: post.scheduledAt,
          categoryId: post.categoryId,
        };

        await queue.add('publish-scheduled-post', jobData, {
          jobId,
          delay: delayMs,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: true,
        });

        logger.info(`Enqueued BullMQ job ${jobId} with ${delayMs}ms delay (${post.scheduledAt})`);
      } else {
        logger.info(`Redis offline - post ${post.id} scheduled in persistent repository.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn(`Could not add job to BullMQ queue: ${msg}`);
    }

    // Record jobId in post record
    await SchedulingRepository.updatePost(post.id, {
      status: 'SCHEDULED',
    });

    return jobId;
  }

  /**
   * Cancels a scheduled publishing job in BullMQ and marks post CANCELLED
   */
  public static async cancelScheduledPost(postId: string): Promise<ScheduledPostDTO> {
    const jobId = `post_${postId}`;
    try {
      const { connected } = await checkRedisConnection();
      if (connected) {
        const queue = getQueue(QUEUE_NAMES.POST_PUBLISHING);
        const job = await queue.getJob(jobId);
        if (job) {
          await job.remove();
          logger.info(`Removed BullMQ job ${jobId} upon post cancellation.`);
        }
      }
    } catch (err) {
      logger.warn(`Failed to remove BullMQ job ${jobId}:`, { err });
    }

    return await SchedulingRepository.cancelPost(postId);
  }

  /**
   * Immediately dispatches a post ("Publish Now") or processes a scheduled BullMQ job
   */
  public static async executePublish(postId: string): Promise<{
    success: boolean;
    post: ScheduledPostDTO;
    errorMessage?: string;
  }> {
    const post = await SchedulingRepository.getPostById(postId);
    if (!post) {
      throw new Error(`Post '${postId}' not found for execution.`);
    }

    if (post.status === 'PUBLISHED') {
      return { success: true, post };
    }
    if (post.status === 'CANCELLED') {
      return { success: false, post, errorMessage: 'Post has been cancelled.' };
    }

    // Set status to PROCESSING
    await SchedulingRepository.updatePost(postId, { status: 'PROCESSING' });

    try {
      // Dispatch official publishing via SocialPublisher
      const publishResults = await SocialPublisher.publish({
        workspaceId: post.workspaceId,
        userId: post.userId,
        accountIds: post.accountIds,
        content: post.content,
        mediaUrls: post.mediaUrls,
        postType: post.postType,
      });

      const successfulDispatches = publishResults.filter((r) => r.success);
      const failedDispatches = publishResults.filter((r) => !r.success);

      // ONLY mark post published after platform confirmation!
      if (successfulDispatches.length > 0) {
        const platformPostIds: Record<string, string> = {};
        successfulDispatches.forEach((s) => {
          if (s.platformPostId) {
            platformPostIds[s.platform] = s.platformPostId;
          }
        });

        const updated = await SchedulingRepository.markPostPublished(postId, platformPostIds);

        // Trigger PUBLISHING_SUCCESS Notification
        const channelList = successfulDispatches.map((s) => s.platform.toUpperCase()).join(', ');
        await SchedulingRepository.createNotification({
          workspaceId: post.workspaceId,
          userId: post.userId,
          type: 'PUBLISHING_SUCCESS',
          title: 'Post Published Successfully',
          message: `Your post was successfully confirmed and published to ${channelList}.`,
          isRead: false,
          entityId: post.id,
          metadata: {
            channels: successfulDispatches.map((s) => s.platform),
            postType: post.postType,
            platformPostIds,
          },
        });

        // Handle Recurrence: calculate next date and create recurring schedule
        if (post.isRecurring && post.recurrenceRule !== 'NONE') {
          await this.createNextRecurringPost(post);
        }

        return { success: true, post: updated };
      } else {
        // Platform confirmation failed
        const failureReason = failedDispatches.map((f) => f.errorMessage).join(' | ') || 'Social platform API rejected post.';
        const updated = await SchedulingRepository.markPostFailed(postId, failureReason);

        // Trigger PUBLISHING_FAILURE Notification
        await SchedulingRepository.createNotification({
          workspaceId: post.workspaceId,
          userId: post.userId,
          type: 'PUBLISHING_FAILURE',
          title: 'Publishing Job Failed',
          message: `Scheduled post failed to publish: ${failureReason}`,
          isRead: false,
          entityId: post.id,
          metadata: {
            failureReason,
            attemptedPlatforms: post.platforms,
          },
        });

        return { success: false, post: updated, errorMessage: failureReason };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown execution error';
      const updated = await SchedulingRepository.markPostFailed(postId, msg);

      await SchedulingRepository.createNotification({
        workspaceId: post.workspaceId,
        userId: post.userId,
        type: 'PUBLISHING_FAILURE',
        title: 'Publishing Error',
        message: `Failed to execute publishing job: ${msg}`,
        isRead: false,
        entityId: post.id,
      });

      return { success: false, post: updated, errorMessage: msg };
    }
  }

  /**
   * Helper to create the next scheduled occurrence of a recurring post
   */
  private static async createNextRecurringPost(currentPost: ScheduledPostDTO): Promise<void> {
    const baseDate = currentPost.scheduledAt ? new Date(currentPost.scheduledAt) : new Date();
    const nextDate = new Date(baseDate);

    switch (currentPost.recurrenceRule) {
      case 'DAILY':
        nextDate.setDate(nextDate.getDate() + (currentPost.recurrenceInterval || 1));
        break;
      case 'WEEKLY':
        nextDate.setDate(nextDate.getDate() + 7 * (currentPost.recurrenceInterval || 1));
        break;
      case 'BIWEEKLY':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'MONTHLY':
        nextDate.setMonth(nextDate.getMonth() + (currentPost.recurrenceInterval || 1));
        break;
      case 'EVERY_X_DAYS':
        nextDate.setDate(nextDate.getDate() + (currentPost.recurrenceInterval || 3));
        break;
    }

    const nextIso = nextDate.toISOString();

    const newPost = await SchedulingRepository.createPost(
      {
        workspaceId: currentPost.workspaceId,
        userId: currentPost.userId,
        content: currentPost.content,
        mediaUrls: currentPost.mediaUrls,
        postType: currentPost.postType,
        platforms: currentPost.platforms,
        accountIds: currentPost.accountIds,
        action: 'SCHEDULE',
        scheduledAt: nextIso,
        timezone: currentPost.timezone,
        hashtags: currentPost.hashtags,
        callToAction: currentPost.callToAction,
        isRecurring: true,
        recurrenceRule: currentPost.recurrenceRule,
        recurrenceInterval: currentPost.recurrenceInterval,
        recurrenceDays: currentPost.recurrenceDays,
        evergreen: currentPost.evergreen,
        maxRecycles: currentPost.maxRecycles,
        categoryId: currentPost.categoryId,
      },
      'SCHEDULED'
    );

    // Schedule the new job in BullMQ
    await this.schedulePost(newPost);
    logger.info(`Scheduled next recurring post ${newPost.id} at ${nextIso}`);
  }

  /**
   * Retrieves BullMQ Queue Metrics & Health
   */
  public static async getQueueMetrics(workspaceId = 'ws_peak_scale'): Promise<QueueMetricsDTO> {
    let active = 0;
    let waiting = 0;
    let delayed = 0;
    let failed = 0;
    let completed = 0;
    let isRedisConnected = false;

    try {
      const conn = await checkRedisConnection();
      isRedisConnected = conn.connected;

      if (isRedisConnected) {
        const queue = getQueue(QUEUE_NAMES.POST_PUBLISHING);
        const counts = await queue.getJobCounts('active', 'waiting', 'delayed', 'failed', 'completed');
        active = counts.active || 0;
        waiting = counts.waiting || 0;
        delayed = counts.delayed || 0;
        failed = counts.failed || 0;
        completed = counts.completed || 0;
      }
    } catch {
      isRedisConnected = false;
    }

    // Supplement with repository counts
    const posts = await SchedulingRepository.getPosts({ workspaceId });
    const repoScheduled = posts.filter((p) => p.status === 'SCHEDULED').length;
    const repoFailed = posts.filter((p) => p.status === 'FAILED').length;
    const repoCompleted = posts.filter((p) => p.status === 'PUBLISHED').length;
    const totalEvergreen = posts.filter((p) => p.evergreen).length;
    const totalDrafts = posts.filter((p) => p.status === 'DRAFT').length;

    return {
      active: active,
      waiting: waiting,
      delayed: isRedisConnected && delayed > 0 ? delayed : repoScheduled,
      failed: isRedisConnected && failed > 0 ? failed : repoFailed,
      completed: isRedisConnected && completed > 0 ? completed : repoCompleted,
      isRedisConnected,
      totalEvergreen,
      totalDrafts,
    };
  }

  /**
   * Proactive check for upcoming posts (within 3h) and expiring tokens (within 14d)
   */
  public static async checkUpcomingPostsAndExpirations(workspaceId = 'ws_peak_scale'): Promise<{
    upcomingPostsCount: number;
    expiringTokensCount: number;
  }> {
    const now = Date.now();
    const inThreeHours = now + 3 * 3600 * 1000;

    const posts = await SchedulingRepository.getPosts({
      workspaceId,
      status: 'SCHEDULED',
    });

    let upcomingPostsCount = 0;
    for (const post of posts) {
      if (post.scheduledAt) {
        const time = new Date(post.scheduledAt).getTime();
        if (time > now && time <= inThreeHours) {
          upcomingPostsCount++;
        }
      }
    }

    // Check expiring accounts
    const accounts = await SocialRepository.getAccountsForWorkspace(workspaceId);
    let expiringTokensCount = 0;
    const inFourteenDays = now + 14 * 86400 * 1000;

    for (const acc of accounts) {
      if (acc.tokenExpiresAt) {
        const exp = new Date(acc.tokenExpiresAt).getTime();
        if (exp < inFourteenDays) {
          expiringTokensCount++;
        }
      }
    }

    return { upcomingPostsCount, expiringTokensCount };
  }
}
