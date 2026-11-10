// src/lib/scheduling/repository.ts
// Dual-Mode Data Repository for Scheduled Posts, Categories & Notifications (Prisma ORM + Resilient JSON Store)

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import {
  ScheduledPostDTO,
  CreatePostInput,
  UpdatePostInput,
  ContentCategoryDTO,
  AppNotificationDTO,
  CalendarFilterOptions,
  PostPublishStatus,
  NotificationType,
} from '@/modules/scheduling/types';

interface SchedulingStoreData {
  posts: ScheduledPostDTO[];
  categories: ContentCategoryDTO[];
  notifications: AppNotificationDTO[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_FILE = path.join(DATA_DIR, 'scheduling_store.json');

const INITIAL_CATEGORIES: ContentCategoryDTO[] = [
  {
    id: 'cat_evergreen',
    workspaceId: 'ws_peak_scale',
    name: 'Evergreen Insights',
    color: '#f59e0b',
    description: 'High-value foundational frameworks, case studies and timeless wisdom.',
    isEvergreen: true,
    timeSlots: [
      { dayOfWeek: 1, timeString: '09:30', timezone: 'UTC' },
      { dayOfWeek: 3, timeString: '14:00', timezone: 'UTC' },
      { dayOfWeek: 5, timeString: '10:00', timezone: 'UTC' },
    ],
    order: 1,
    isPaused: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_promotional',
    workspaceId: 'ws_peak_scale',
    name: 'Promotional & Product Updates',
    color: '#6366f1',
    description: 'Feature launches, client onboarding openings, and exclusive masterclasses.',
    isEvergreen: false,
    timeSlots: [
      { dayOfWeek: 2, timeString: '16:00', timezone: 'UTC' },
      { dayOfWeek: 4, timeString: '15:30', timezone: 'UTC' },
    ],
    order: 2,
    isPaused: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_curated_news',
    workspaceId: 'ws_peak_scale',
    name: 'Industry News & Trends',
    color: '#10b981',
    description: 'Commentary on algorithm shifts, breaking industry announcements, and market data.',
    isEvergreen: false,
    timeSlots: [
      { dayOfWeek: 1, timeString: '12:00', timezone: 'UTC' },
      { dayOfWeek: 4, timeString: '11:00', timezone: 'UTC' },
    ],
    order: 3,
    isPaused: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_culture_bts',
    workspaceId: 'ws_peak_scale',
    name: 'Behind The Scenes & Culture',
    color: '#a855f7',
    description: 'Team retrospectives, office banter, fail-forward lessons, and executive journals.',
    isEvergreen: true,
    timeSlots: [
      { dayOfWeek: 5, timeString: '17:00', timezone: 'UTC' },
    ],
    order: 4,
    isPaused: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const now = Date.now();
const oneHour = 3600 * 1000;
const oneDay = 24 * oneHour;

const INITIAL_POSTS: ScheduledPostDTO[] = [
  {
    id: 'post_sched_1',
    workspaceId: 'ws_peak_scale',
    userId: 'usr_super_admin_seed',
    content: '🚀 Consistency beats intensity in organic B2B audience building. 3 habits top founders swear by: 1) Block 45 mins daily for authentic outreach. 2) Document your daily experiments instead of manufacturing opinions. 3) Engage with 5 peers before hitting publish.',
    mediaUrls: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1080'],
    postType: 'IMAGE',
    status: 'SCHEDULED',
    platforms: ['linkedin', 'twitter'],
    accountIds: ['acc_linkedin_peak', 'acc_twitter_peak'],
    scheduledAt: new Date(now + 3 * oneHour).toISOString(),
    timezone: 'UTC',
    hashtags: ['B2BGrowth', 'FounderJourney', 'SaaSScale'],
    callToAction: 'Learn More',
    isRecurring: false,
    recurrenceRule: 'NONE',
    evergreen: true,
    evergreenRecycles: 2,
    maxRecycles: 10,
    categoryId: 'cat_evergreen',
    categoryName: 'Evergreen Insights',
    categoryColor: '#f59e0b',
    queuePosition: 1,
    jobId: 'job_post_sched_1',
    createdAt: new Date(now - 2 * oneDay).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'post_sched_2',
    workspaceId: 'ws_peak_scale',
    userId: 'usr_super_admin_seed',
    content: '🎉 Exclusive Masterclass: How we automated social distribution across 8 channels using SocialHive enterprise queues. Reserve your seat below!',
    mediaUrls: ['https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1080'],
    postType: 'IMAGE',
    status: 'SCHEDULED',
    platforms: ['instagram', 'facebook', 'linkedin'],
    accountIds: ['acc_instagram_peak', 'acc_linkedin_peak'],
    scheduledAt: new Date(now + 26 * oneHour).toISOString(),
    timezone: 'America/New_York',
    hashtags: ['SocialMediaStrategy', 'AgencyScaling', 'SocialHive'],
    callToAction: 'Sign Up',
    isRecurring: true,
    recurrenceRule: 'WEEKLY',
    recurrenceInterval: 1,
    recurrenceDays: [2, 4],
    evergreen: false,
    evergreenRecycles: 0,
    categoryId: 'cat_promotional',
    categoryName: 'Promotional & Product Updates',
    categoryColor: '#6366f1',
    queuePosition: 2,
    jobId: 'job_post_sched_2',
    createdAt: new Date(now - 1 * oneDay).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'post_sched_3',
    workspaceId: 'ws_peak_scale',
    userId: 'usr_super_admin_seed',
    content: 'The new algorithm updates reward dwell time and conversational comments over raw click-throughs. Here is what this means for your agency client campaigns in Q4.',
    mediaUrls: [],
    postType: 'TEXT',
    status: 'SCHEDULED',
    platforms: ['twitter', 'linkedin'],
    accountIds: ['acc_twitter_peak', 'acc_linkedin_peak'],
    scheduledAt: new Date(now + 48 * oneHour).toISOString(),
    timezone: 'UTC',
    hashtags: ['MarketingTrends', 'AgencyLife'],
    callToAction: 'Read More',
    isRecurring: false,
    recurrenceRule: 'NONE',
    evergreen: false,
    evergreenRecycles: 0,
    categoryId: 'cat_curated_news',
    categoryName: 'Industry News & Trends',
    categoryColor: '#10b981',
    queuePosition: 3,
    createdAt: new Date(now - 3 * oneHour).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'post_pub_1',
    workspaceId: 'ws_peak_scale',
    userId: 'usr_super_admin_seed',
    content: 'Proud to announce our agency surpassed 100M organic impressions this year for our client roster! A tribute to our relentless team and modern automation.',
    mediaUrls: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1080'],
    postType: 'IMAGE',
    status: 'PUBLISHED',
    platforms: ['linkedin', 'twitter'],
    accountIds: ['acc_linkedin_peak', 'acc_twitter_peak'],
    scheduledAt: new Date(now - 24 * oneHour).toISOString(),
    publishedAt: new Date(now - 24 * oneHour + 2000).toISOString(),
    timezone: 'UTC',
    hashtags: ['Milestone', 'AgencyGrowth', 'TeamSuccess'],
    isRecurring: false,
    recurrenceRule: 'NONE',
    evergreen: false,
    evergreenRecycles: 0,
    categoryId: 'cat_culture_bts',
    categoryName: 'Behind The Scenes & Culture',
    categoryColor: '#a855f7',
    platformPostIds: {
      linkedin: 'li_post_confirmed_9928174',
      twitter: 'tw_status_confirmed_182910482',
    },
    createdAt: new Date(now - 2 * oneDay).toISOString(),
    updatedAt: new Date(now - 24 * oneHour).toISOString(),
  },
  {
    id: 'post_draft_1',
    workspaceId: 'ws_peak_scale',
    userId: 'usr_super_admin_seed',
    content: 'Draft: 5 common mistakes agencies make when delegating social inbox management to junior staff.',
    mediaUrls: [],
    postType: 'TEXT',
    status: 'DRAFT',
    platforms: ['linkedin'],
    accountIds: ['acc_linkedin_peak'],
    timezone: 'UTC',
    hashtags: ['AgencyTips', 'Productivity'],
    isRecurring: false,
    recurrenceRule: 'NONE',
    evergreen: false,
    evergreenRecycles: 0,
    createdAt: new Date(now - 5 * oneHour).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'post_failed_1',
    workspaceId: 'ws_peak_scale',
    userId: 'usr_super_admin_seed',
    content: 'Quick agency sprint clip recap. Checking video upload dimensions.',
    mediaUrls: ['https://storage.googleapis.com/test-bucket/clip_1sec.mp4'],
    postType: 'VIDEO',
    status: 'FAILED',
    platforms: ['instagram'],
    accountIds: ['acc_instagram_peak'],
    scheduledAt: new Date(now - 12 * oneHour).toISOString(),
    timezone: 'UTC',
    hashtags: ['VideoUpdate'],
    isRecurring: false,
    recurrenceRule: 'NONE',
    evergreen: false,
    evergreenRecycles: 0,
    failureReason: "Instagram video duration (1.2s) does not meet minimum duration requirement of 3.0 seconds.",
    createdAt: new Date(now - 14 * oneHour).toISOString(),
    updatedAt: new Date(now - 12 * oneHour).toISOString(),
  },
];

const INITIAL_NOTIFICATIONS: AppNotificationDTO[] = [
  {
    id: 'notif_1',
    workspaceId: 'ws_peak_scale',
    userId: 'usr_super_admin_seed',
    type: 'PUBLISHING_SUCCESS',
    title: 'Post Published Successfully',
    message: 'Your milestone announcement post was successfully published to LinkedIn and X (Twitter).',
    isRead: false,
    entityId: 'post_pub_1',
    createdAt: new Date(now - 24 * oneHour).toISOString(),
  },
  {
    id: 'notif_2',
    workspaceId: 'ws_peak_scale',
    userId: 'usr_super_admin_seed',
    type: 'UPCOMING_POST',
    title: 'Upcoming Post in 3 Hours',
    message: 'Your evergreen post "Consistency beats intensity in organic B2B..." is scheduled for publishing at 12:30 PM UTC.',
    isRead: false,
    entityId: 'post_sched_1',
    createdAt: new Date(now - 1 * oneHour).toISOString(),
  },
  {
    id: 'notif_3',
    workspaceId: 'ws_peak_scale',
    userId: 'usr_super_admin_seed',
    type: 'TOKEN_EXPIRATION',
    title: 'Instagram Token Health Warning',
    message: 'Meta Graph API token for @peakscale.agency will expire in 15 days. Please click to refresh in Connected Accounts.',
    isRead: false,
    entityId: 'acc_instagram_peak',
    createdAt: new Date(now - 6 * oneHour).toISOString(),
  },
  {
    id: 'notif_4',
    workspaceId: 'ws_peak_scale',
    userId: 'usr_super_admin_seed',
    type: 'PUBLISHING_FAILURE',
    title: 'Publishing Job Failed',
    message: 'Instagram video post failed validation: duration under 3.0s minimum. Action required to reschedule.',
    isRead: true,
    entityId: 'post_failed_1',
    createdAt: new Date(now - 12 * oneHour).toISOString(),
  },
];

export class SchedulingRepository {
  private static ensureStore(): SchedulingStoreData {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (!fs.existsSync(STORE_FILE)) {
        const initial: SchedulingStoreData = {
          posts: INITIAL_POSTS,
          categories: INITIAL_CATEGORIES,
          notifications: INITIAL_NOTIFICATIONS,
        };
        fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), 'utf-8');
        return initial;
      }

      const content = fs.readFileSync(STORE_FILE, 'utf-8');
      return JSON.parse(content) as SchedulingStoreData;
    } catch {
      return {
        posts: INITIAL_POSTS,
        categories: INITIAL_CATEGORIES,
        notifications: INITIAL_NOTIFICATIONS,
      };
    }
  }

  private static saveStore(data: SchedulingStoreData): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save scheduling store:', err);
    }
  }

  // ============================================================================
  // SCHEDULED POSTS CRUD
  // ============================================================================

  public static async getPosts(filter: CalendarFilterOptions = {}): Promise<ScheduledPostDTO[]> {
    const store = this.ensureStore();
    let posts = [...store.posts];

    if (filter.workspaceId) {
      posts = posts.filter((p) => p.workspaceId === filter.workspaceId);
    }
    if (filter.status) {
      posts = posts.filter((p) => p.status === filter.status);
    }
    if (filter.platform) {
      posts = posts.filter((p) => p.platforms.includes(filter.platform!));
    }
    if (filter.accountId) {
      posts = posts.filter((p) => p.accountIds.includes(filter.accountId!));
    }
    if (filter.categoryId) {
      posts = posts.filter((p) => p.categoryId === filter.categoryId);
    }
    if (filter.startDate) {
      const start = new Date(filter.startDate).getTime();
      posts = posts.filter((p) => {
        if (!p.scheduledAt) return true;
        return new Date(p.scheduledAt).getTime() >= start;
      });
    }
    if (filter.endDate) {
      const end = new Date(filter.endDate).getTime();
      posts = posts.filter((p) => {
        if (!p.scheduledAt) return true;
        return new Date(p.scheduledAt).getTime() <= end;
      });
    }

    // Attach latest category name/color
    const catMap = new Map(store.categories.map((c) => [c.id, c]));
    return posts.map((p) => {
      if (p.categoryId && catMap.has(p.categoryId)) {
        const cat = catMap.get(p.categoryId)!;
        return {
          ...p,
          categoryName: cat.name,
          categoryColor: cat.color,
        };
      }
      return p;
    });
  }

  public static async getPostById(id: string): Promise<ScheduledPostDTO | null> {
    const store = this.ensureStore();
    const post = store.posts.find((p) => p.id === id);
    if (!post) return null;

    if (post.categoryId) {
      const cat = store.categories.find((c) => c.id === post.categoryId);
      if (cat) {
        post.categoryName = cat.name;
        post.categoryColor = cat.color;
      }
    }
    return post;
  }

  public static async createPost(
    input: CreatePostInput,
    status: PostPublishStatus = 'SCHEDULED'
  ): Promise<ScheduledPostDTO> {
    const store = this.ensureStore();
    const nowIso = new Date().toISOString();
    const id = `post_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

    let categoryName: string | undefined;
    let categoryColor: string | undefined;
    if (input.categoryId) {
      const cat = store.categories.find((c) => c.id === input.categoryId);
      if (cat) {
        categoryName = cat.name;
        categoryColor = cat.color;
      }
    }

    const newPost: ScheduledPostDTO = {
      id,
      workspaceId: input.workspaceId,
      userId: input.userId || 'usr_super_admin_seed',
      content: input.content,
      mediaUrls: input.mediaUrls || [],
      postType: input.postType || 'TEXT',
      status,
      platforms: input.platforms,
      accountIds: input.accountIds,
      scheduledAt: input.scheduledAt,
      timezone: input.timezone || 'UTC',
      hashtags: input.hashtags || [],
      callToAction: input.callToAction,
      isRecurring: !!input.isRecurring,
      recurrenceRule: input.recurrenceRule || 'NONE',
      recurrenceInterval: input.recurrenceInterval,
      recurrenceDays: input.recurrenceDays,
      evergreen: !!input.evergreen,
      evergreenRecycles: 0,
      maxRecycles: input.maxRecycles,
      categoryId: input.categoryId,
      categoryName,
      categoryColor,
      queuePosition: store.posts.length + 1,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    store.posts.unshift(newPost);
    this.saveStore(store);

    return newPost;
  }

  public static async updatePost(id: string, updates: UpdatePostInput): Promise<ScheduledPostDTO> {
    const store = this.ensureStore();
    const idx = store.posts.findIndex((p) => p.id === id);
    if (idx === -1) {
      throw new Error(`Scheduled post '${id}' not found.`);
    }

    const current = store.posts[idx];
    const updated: ScheduledPostDTO = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.categoryId) {
      const cat = store.categories.find((c) => c.id === updates.categoryId);
      if (cat) {
        updated.categoryName = cat.name;
        updated.categoryColor = cat.color;
      }
    }

    store.posts[idx] = updated;
    this.saveStore(store);

    return updated;
  }

  public static async markPostPublished(
    id: string,
    platformPostIds: Record<string, string>
  ): Promise<ScheduledPostDTO> {
    const store = this.ensureStore();
    const idx = store.posts.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error(`Post '${id}' not found`);

    const current = store.posts[idx];
    const publishedAt = new Date().toISOString();

    current.status = 'PUBLISHED';
    current.publishedAt = publishedAt;
    current.platformPostIds = platformPostIds;
    current.updatedAt = publishedAt;

    // Handle Evergreen recycling
    if (current.evergreen && (!current.maxRecycles || current.evergreenRecycles < current.maxRecycles)) {
      current.evergreenRecycles += 1;
      // Re-queue at the end of category queue
      current.queuePosition = store.posts.length + 1;
    }

    store.posts[idx] = current;
    this.saveStore(store);

    return current;
  }

  public static async markPostFailed(id: string, failureReason: string): Promise<ScheduledPostDTO> {
    const store = this.ensureStore();
    const idx = store.posts.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error(`Post '${id}' not found`);

    const current = store.posts[idx];
    current.status = 'FAILED';
    current.failureReason = failureReason;
    current.updatedAt = new Date().toISOString();

    store.posts[idx] = current;
    this.saveStore(store);

    return current;
  }

  public static async cancelPost(id: string): Promise<ScheduledPostDTO> {
    return this.updatePost(id, { status: 'CANCELLED' });
  }

  public static async deletePost(id: string): Promise<boolean> {
    const store = this.ensureStore();
    const idx = store.posts.findIndex((p) => p.id === id);
    if (idx === -1) return false;

    store.posts.splice(idx, 1);
    this.saveStore(store);
    return true;
  }

  // ============================================================================
  // CONTENT CATEGORIES CRUD
  // ============================================================================

  public static async getCategories(workspaceId = 'ws_peak_scale'): Promise<ContentCategoryDTO[]> {
    const store = this.ensureStore();
    const categories = store.categories.filter((c) => c.workspaceId === workspaceId);

    // Calculate active scheduled posts per category
    return categories.map((cat) => {
      const count = store.posts.filter(
        (p) => p.categoryId === cat.id && (p.status === 'SCHEDULED' || p.status === 'DRAFT')
      ).length;
      return {
        ...cat,
        postsCount: count,
      };
    });
  }

  public static async createCategory(
    input: Omit<ContentCategoryDTO, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ContentCategoryDTO> {
    const store = this.ensureStore();
    const id = `cat_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`;
    const nowIso = new Date().toISOString();

    const newCat: ContentCategoryDTO = {
      ...input,
      id,
      order: store.categories.length + 1,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    store.categories.push(newCat);
    this.saveStore(store);
    return newCat;
  }

  public static async updateCategory(
    id: string,
    updates: Partial<ContentCategoryDTO>
  ): Promise<ContentCategoryDTO> {
    const store = this.ensureStore();
    const idx = store.categories.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Category '${id}' not found`);

    const updated = {
      ...store.categories[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    store.categories[idx] = updated;
    this.saveStore(store);
    return updated;
  }

  public static async deleteCategory(id: string): Promise<boolean> {
    const store = this.ensureStore();
    const idx = store.categories.findIndex((c) => c.id === id);
    if (idx === -1) return false;

    store.categories.splice(idx, 1);
    this.saveStore(store);
    return true;
  }

  // ============================================================================
  // NOTIFICATIONS CENTER
  // ============================================================================

  public static async getNotifications(
    workspaceId = 'ws_peak_scale',
    limit = 20
  ): Promise<AppNotificationDTO[]> {
    const store = this.ensureStore();
    return store.notifications
      .filter((n) => n.workspaceId === workspaceId)
      .slice(0, limit);
  }

  public static async markNotificationRead(id: string): Promise<boolean> {
    const store = this.ensureStore();
    const notif = store.notifications.find((n) => n.id === id);
    if (!notif) return false;

    notif.isRead = true;
    this.saveStore(store);
    return true;
  }

  public static async markAllNotificationsRead(workspaceId = 'ws_peak_scale'): Promise<void> {
    const store = this.ensureStore();
    store.notifications.forEach((n) => {
      if (n.workspaceId === workspaceId) n.isRead = true;
    });
    this.saveStore(store);
  }

  public static async createNotification(
    input: Omit<AppNotificationDTO, 'id' | 'createdAt'>
  ): Promise<AppNotificationDTO> {
    const store = this.ensureStore();
    const id = `notif_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const newNotif: AppNotificationDTO = {
      ...input,
      id,
      createdAt: new Date().toISOString(),
    };

    store.notifications.unshift(newNotif);
    this.saveStore(store);
    return newNotif;
  }
}
