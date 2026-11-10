import { Queue, QueueOptions } from 'bullmq';
import { redis } from '../redis';
import { logger } from '../logger';

// Queue names
export const QUEUE_NAMES = {
  POST_PUBLISHING: 'post-publishing',
  ANALYTICS_SYNC: 'analytics-sync',
  SOCIAL_TOKEN_REFRESH: 'social-token-refresh',
  AI_GENERATION: 'ai-generation',
  NOTIFICATIONS: 'notifications',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

const defaultQueueOptions: QueueOptions = {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      age: 24 * 3600, // keep completed jobs 24h
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // keep failed jobs 7d
    },
  },
};

// Queue instances cache
const queues: Partial<Record<QueueName, Queue>> = {};

export function getQueue(queueName: QueueName): Queue {
  if (!queues[queueName]) {
    queues[queueName] = new Queue(queueName, defaultQueueOptions);
    logger.info(`BullMQ Queue initialized: ${queueName}`);
  }
  return queues[queueName]!;
}

// Typed job payloads
export interface PostPublishJobData {
  postId: string;
  workspaceId: string;
  socialAccountId: string;
  scheduledTime: string;
  categoryId?: string;
}

export interface AnalyticsSyncJobData {
  workspaceId: string;
  socialAccountId: string;
  rangeDays: number;
}

export interface AiGenerationJobData {
  workspaceId: string;
  userId: string;
  topic: string;
  tone: string;
  platforms: string[];
}

export interface NotificationJobData {
  recipientEmail: string;
  subject: string;
  template: 'welcome' | 'post_failed' | 'post_published' | 'invite';
  variables: Record<string, unknown>;
}

/**
 * Dispatch job helpers
 */
export async function enqueuePostPublish(data: PostPublishJobData, delayMs = 0) {
  try {
    const queue = getQueue(QUEUE_NAMES.POST_PUBLISHING);
    return await queue.add('publish-post', data, { delay: delayMs });
  } catch (error) {
    logger.warn('Failed to enqueue post-publish job (Redis offline?):', { error });
    return null;
  }
}

export async function enqueueAnalyticsSync(data: AnalyticsSyncJobData) {
  try {
    const queue = getQueue(QUEUE_NAMES.ANALYTICS_SYNC);
    return await queue.add('sync-metrics', data);
  } catch (error) {
    logger.warn('Failed to enqueue analytics sync job:', { error });
    return null;
  }
}

export async function enqueueAiGeneration(data: AiGenerationJobData) {
  try {
    const queue = getQueue(QUEUE_NAMES.AI_GENERATION);
    return await queue.add('generate-content', data);
  } catch (error) {
    logger.warn('Failed to enqueue AI generation job:', { error });
    return null;
  }
}
