// src/modules/analytics/types.ts
// Official Social Analytics Types & Specifications

import { SocialPlatformId, SocialPostType } from '@/modules/social/types';

export interface AnalyticsTimeframe {
  range: '7d' | '30d' | '90d' | 'custom';
  startDate?: string;
  endDate?: string;
}

export interface PlatformMetricRestriction {
  platform: SocialPlatformId;
  metric: 'shares' | 'reach' | 'clicks' | 'impressions' | 'demographics';
  reason: string;
}

export interface PlatformAnalytics {
  platform: SocialPlatformId;
  name: string;
  brandColor: string;
  followers: number;
  followerGrowth: number;
  followerGrowthPercent: number;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  engagementRate: number;
  clicks: number;
  postsPublished: number;
  unavailableMetrics: string[]; // Explicit list of unavailable metrics from official APIs
  apiLimitNotes: string;
}

export interface TimeSeriesPoint {
  date: string;
  followers: number;
  impressions: number;
  reach: number;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface BestPerformingPost {
  id: string;
  content: string;
  platform: SocialPlatformId;
  postType: SocialPostType;
  publishedAt: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  engagementRate: number;
  permalink?: string;
  mediaUrls?: string[];
}

export interface AnalyticsOverview {
  totalFollowers: number;
  followerGrowth: number;
  followerGrowthPercent: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalReach: number;
  totalImpressions: number;
  averageEngagementRate: number;
  totalClicks: number;
  totalPosts: number;
  timeRange: string;
  platforms: PlatformAnalytics[];
  timeSeries: TimeSeriesPoint[];
  topPosts: BestPerformingPost[];
  unavailableMetrics: PlatformMetricRestriction[];
}

export interface AdminAnalyticsSummary {
  aiUsage: {
    totalGenerations: number;
    totalTokens: number;
    estimatedCostUsd: number;
    byProvider: Record<string, { count: number; cost: number }>;
  };
  connectedAccounts: {
    total: number;
    active: number;
    expiring: number;
    byPlatform: Record<SocialPlatformId, number>;
  };
  publishingActivity: {
    totalPublished: number;
    totalScheduled: number;
    totalFailed: number;
    totalDrafts: number;
    throughputPerDay: number;
  };
  apiErrors: {
    totalErrors: number;
    errorRatePercent: number;
    recentErrors: Array<{
      id: string;
      platform: SocialPlatformId;
      code: string;
      message: string;
      timestamp: string;
    }>;
  };
  userActivity: {
    totalUsers: number;
    activeToday: number;
    newThisMonth: number;
    activeWorkspaces: number;
  };
  platformUsage: Array<{
    platform: SocialPlatformId;
    name: string;
    postsCount: number;
    percentage: number;
    color: string;
  }>;
}
