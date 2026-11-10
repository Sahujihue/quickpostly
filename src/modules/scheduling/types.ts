// src/modules/scheduling/types.ts
// Official Content Calendar & Post Scheduler Types

import { SocialPlatformId, SocialPostType } from '@/modules/social/types';

export type PostPublishStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'PROCESSING'
  | 'PUBLISHED'
  | 'FAILED'
  | 'CANCELLED';

export type NotificationType =
  | 'PUBLISHING_SUCCESS'
  | 'PUBLISHING_FAILURE'
  | 'UPCOMING_POST'
  | 'TOKEN_EXPIRATION'
  | 'SYSTEM';

export type RecurrenceRule =
  | 'NONE'
  | 'DAILY'
  | 'WEEKLY'
  | 'BIWEEKLY'
  | 'MONTHLY'
  | 'EVERY_X_DAYS';

export interface ScheduledPostDTO {
  id: string;
  workspaceId: string;
  userId: string;
  content: string;
  mediaUrls: string[];
  postType: SocialPostType;
  status: PostPublishStatus;
  platforms: SocialPlatformId[];
  accountIds: string[];
  scheduledAt?: string;
  publishedAt?: string;
  timezone: string;
  hashtags: string[];
  callToAction?: string;
  isRecurring: boolean;
  recurrenceRule: RecurrenceRule;
  recurrenceInterval?: number;
  recurrenceDays?: number[]; // [0 = Sun, 1 = Mon, ..., 6 = Sat]
  evergreen: boolean;
  evergreenRecycles: number;
  maxRecycles?: number;
  categoryId?: string;
  categoryName?: string;
  categoryColor?: string;
  queuePosition?: number;
  jobId?: string;
  failureReason?: string;
  platformPostIds?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostInput {
  workspaceId: string;
  userId?: string;
  content: string;
  mediaUrls?: string[];
  postType?: SocialPostType;
  platforms: SocialPlatformId[];
  accountIds: string[];
  action: 'PUBLISH_NOW' | 'SCHEDULE' | 'SAVE_DRAFT';
  scheduledAt?: string;
  timezone?: string;
  hashtags?: string[];
  callToAction?: string;
  isRecurring?: boolean;
  recurrenceRule?: RecurrenceRule;
  recurrenceInterval?: number;
  recurrenceDays?: number[];
  evergreen?: boolean;
  maxRecycles?: number;
  categoryId?: string;
}

export interface UpdatePostInput {
  content?: string;
  mediaUrls?: string[];
  postType?: SocialPostType;
  platforms?: SocialPlatformId[];
  accountIds?: string[];
  scheduledAt?: string;
  timezone?: string;
  hashtags?: string[];
  callToAction?: string;
  isRecurring?: boolean;
  recurrenceRule?: RecurrenceRule;
  recurrenceInterval?: number;
  recurrenceDays?: number[];
  evergreen?: boolean;
  maxRecycles?: number;
  categoryId?: string;
  status?: PostPublishStatus;
}

export interface BulkScheduleItem {
  content: string;
  platforms: SocialPlatformId[];
  accountIds: string[];
  scheduledAt: string;
  timezone?: string;
  postType?: SocialPostType;
  mediaUrls?: string[];
  hashtags?: string[];
  callToAction?: string;
  categoryId?: string;
}

export interface CategoryTimeSlot {
  dayOfWeek: number; // 0 to 6
  timeString: string; // "14:30"
  timezone: string;
}

export interface ContentCategoryDTO {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
  description?: string;
  isEvergreen: boolean;
  timeSlots: CategoryTimeSlot[];
  order: number;
  isPaused: boolean;
  postsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotificationDTO {
  id: string;
  workspaceId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  entityId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface QueueMetricsDTO {
  active: number;
  waiting: number;
  delayed: number;
  failed: number;
  completed: number;
  isRedisConnected: boolean;
  totalEvergreen: number;
  totalDrafts: number;
}

export type CalendarViewMode = 'daily' | 'weekly' | 'monthly';

export interface CalendarFilterOptions {
  workspaceId?: string;
  startDate?: string;
  endDate?: string;
  platform?: SocialPlatformId;
  accountId?: string;
  categoryId?: string;
  status?: PostPublishStatus;
}
