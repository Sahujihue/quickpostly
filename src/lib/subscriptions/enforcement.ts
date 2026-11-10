import { SubscriptionRepository } from './repository';
import {
  SubscriptionLimitExceededException,
  SubscriptionRequiredException,
} from '@/lib/exceptions';
import { PlanLimits, SubscriptionDTO, WorkspaceUsageDTO } from '@/modules/subscriptions/types';

export type EnforceableMetric =
  | 'socialAccounts'
  | 'scheduledPosts'
  | 'aiGenerations'
  | 'aiImageCredits'
  | 'aiVideoCredits'
  | 'teamMembers'
  | 'clients'
  | 'storageMb';

export interface UsageMetricStatus {
  metric: string;
  label: string;
  current: number;
  max: number;
  unit: string;
  percentUsed: number;
  isExceeded: boolean;
  isNearLimit: boolean; // >= 80%
}

export interface SubscriptionEnforcementOverview {
  subscription: SubscriptionDTO;
  usage: WorkspaceUsageDTO;
  canOperate: boolean;
  statusMessage?: string;
  metrics: Record<EnforceableMetric, UsageMetricStatus>;
  features: {
    hasSocialInbox: boolean;
    analyticsRetentionDays: number;
    hasApprovalWorkflows: boolean;
  };
}

export class SubscriptionEnforcementService {
  /**
   * Verifies that the workspace holds an active, trialing, or grace-period subscription.
   * Throws SubscriptionRequiredException if canceled and expired or suspended.
   */
  public static async assertActiveSubscription(workspaceId: string): Promise<SubscriptionDTO> {
    const sub = await SubscriptionRepository.getSubscriptionByWorkspace(workspaceId);
    if (!sub) {
      throw new SubscriptionRequiredException('No subscription found for this workspace. Please start a plan.');
    }

    const now = new Date();

    if (sub.status === 'EXPIRED' || sub.status === 'CANCELED') {
      const periodEnd = new Date(sub.currentPeriodEnd);
      if (now > periodEnd) {
        throw new SubscriptionRequiredException(
          `Your subscription expired on ${periodEnd.toLocaleDateString()}. Please renew your plan to continue using this workspace.`
        );
      }
    }

    if (sub.status === 'GRACE_PERIOD' && sub.gracePeriodEnd) {
      const graceEnd = new Date(sub.gracePeriodEnd);
      if (now > graceEnd) {
        throw new SubscriptionRequiredException(
          `Your 7-day payment grace period expired on ${graceEnd.toLocaleDateString()}. Please update payment method to restore access.`
        );
      }
    }

    if (sub.status === 'PAST_DUE' && sub.failedPaymentCount > 3) {
      throw new SubscriptionRequiredException('Billing account suspended due to repeated payment failures.');
    }

    return sub;
  }

  /**
   * Enforces server-side quota limits. Throws SubscriptionLimitExceededException if exceeded.
   */
  public static async assertLimit(
    workspaceId: string,
    metric: EnforceableMetric,
    incrementAmount = 1
  ): Promise<{ allowed: boolean; current: number; max: number }> {
    const sub = await SubscriptionEnforcementService.assertActiveSubscription(workspaceId);
    const usage = await SubscriptionRepository.getWorkspaceUsage(workspaceId);

    let current = 0;
    let max = 0;
    let label = '';

    switch (metric) {
      case 'socialAccounts':
        current = usage.socialAccountsCount;
        max = sub.limits.maxSocialAccounts;
        label = 'Connected Social Profiles';
        break;
      case 'scheduledPosts':
        current = usage.scheduledPostsCount;
        max = sub.limits.maxScheduledPosts;
        label = 'Scheduled Posts in Queue';
        break;
      case 'aiGenerations':
        current = usage.aiGenerationsUsed;
        max = sub.limits.aiGenerationsMonthly;
        label = 'Monthly AI Copilot Generations';
        break;
      case 'aiImageCredits':
        current = usage.aiImageCreditsUsed;
        max = sub.limits.aiImageCreditsMonthly;
        label = 'Monthly AI Image Credits';
        break;
      case 'aiVideoCredits':
        current = usage.aiVideoCreditsUsed;
        max = sub.limits.aiVideoCreditsMonthly;
        label = 'Monthly AI Video Credits';
        break;
      case 'teamMembers':
        current = usage.teamMembersCount;
        max = sub.limits.maxTeamMembers;
        label = 'Team & Client Seats';
        break;
      case 'clients':
        current = usage.clientsCount;
        max = sub.limits.maxClients;
        label = 'Client Brand Portals';
        break;
      case 'storageMb':
        current = usage.storageUsedMb;
        max = sub.limits.storageMb;
        label = 'Cloud Storage (MB)';
        break;
    }

    if (current + incrementAmount > max) {
      const suggestedPlan =
        sub.planSlug === 'free-trial'
          ? 'Starter'
          : sub.planSlug === 'starter'
          ? 'Professional'
          : sub.planSlug === 'professional'
          ? 'Business'
          : 'Agency';

      throw new SubscriptionLimitExceededException(
        `Limit exceeded for ${label}: You are using ${current} of ${max} allowed on the ${sub.planName} plan. Please upgrade to ${suggestedPlan} to unlock additional capacity.`,
        {
          metric,
          current,
          max,
          plan: sub.planName,
          suggestedPlan,
        }
      );
    }

    return { allowed: true, current, max };
  }

  /**
   * Enforces feature-level access (boolean permissions like Social Inbox).
   */
  public static async assertFeatureAccess(
    workspaceId: string,
    feature: 'hasSocialInbox' | 'analyticsHistory'
  ): Promise<boolean> {
    const sub = await SubscriptionEnforcementService.assertActiveSubscription(workspaceId);

    if (feature === 'hasSocialInbox') {
      if (!sub.limits.hasSocialInbox) {
        throw new SubscriptionLimitExceededException(
          'Unified Social Inbox is available on Professional, Business, and Agency plans. Upgrade now to manage conversations in one feed.',
          {
            metric: 'hasSocialInbox',
            current: 0,
            max: 1,
            plan: sub.planName,
            suggestedPlan: 'Professional',
          }
        );
      }
    }

    return true;
  }

  /**
   * Returns a comprehensive quota audit and progress overview for the workspace.
   */
  public static async getUsageOverview(workspaceId: string): Promise<SubscriptionEnforcementOverview> {
    const sub = (await SubscriptionRepository.getSubscriptionByWorkspace(workspaceId)) || {
      id: 'sub_default',
      workspaceId,
      userId: 'usr_default',
      planId: 'plan_starter',
      planSlug: 'starter',
      planName: 'Starter',
      status: 'ACTIVE' as const,
      billingInterval: 'MONTHLY' as const,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
      cancelAtPeriodEnd: false,
      failedPaymentCount: 0,
      discountPercent: 0,
      amount: 29,
      currency: 'USD',
      limits: {
        maxSocialAccounts: 5,
        maxScheduledPosts: 150,
        aiGenerationsMonthly: 75,
        aiImageCreditsMonthly: 15,
        aiVideoCreditsMonthly: 2,
        maxTeamMembers: 2,
        maxWorkspaces: 1,
        maxClients: 1,
        storageMb: 2048,
        analyticsRetentionDays: 30,
        hasSocialInbox: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const usage = await SubscriptionRepository.getWorkspaceUsage(workspaceId);

    const calcMetric = (
      label: string,
      current: number,
      max: number,
      unit: string
    ): UsageMetricStatus => {
      const percentUsed = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
      return {
        metric: label,
        label,
        current,
        max,
        unit,
        percentUsed,
        isExceeded: current >= max,
        isNearLimit: percentUsed >= 80,
      };
    };

    const metrics: Record<EnforceableMetric, UsageMetricStatus> = {
      socialAccounts: calcMetric('Social Profiles', usage.socialAccountsCount, sub.limits.maxSocialAccounts, 'accounts'),
      scheduledPosts: calcMetric('Scheduled Posts', usage.scheduledPostsCount, sub.limits.maxScheduledPosts, 'posts'),
      aiGenerations: calcMetric('AI Text Generations', usage.aiGenerationsUsed, sub.limits.aiGenerationsMonthly, 'credits'),
      aiImageCredits: calcMetric('AI Image Credits', usage.aiImageCreditsUsed, sub.limits.aiImageCreditsMonthly, 'images'),
      aiVideoCredits: calcMetric('AI Video Credits', usage.aiVideoCreditsUsed, sub.limits.aiVideoCreditsMonthly, 'clips'),
      teamMembers: calcMetric('Team Members', usage.teamMembersCount, sub.limits.maxTeamMembers, 'seats'),
      clients: calcMetric('Client Portals', usage.clientsCount, sub.limits.maxClients, 'portals'),
      storageMb: calcMetric('Cloud Storage', usage.storageUsedMb, sub.limits.storageMb, 'MB'),
    };

    let canOperate = true;
    let statusMessage: string | undefined = undefined;

    if (sub.status === 'CANCELED' && new Date() > new Date(sub.currentPeriodEnd)) {
      canOperate = false;
      statusMessage = 'Subscription is canceled and current period has expired.';
    } else if (sub.status === 'GRACE_PERIOD') {
      statusMessage = 'Billing payment failed. Workspace is operating in temporary 7-day grace period.';
    }

    return {
      subscription: sub,
      usage,
      canOperate,
      statusMessage,
      metrics,
      features: {
        hasSocialInbox: sub.limits.hasSocialInbox,
        analyticsRetentionDays: sub.limits.analyticsRetentionDays,
        hasApprovalWorkflows: sub.limits.maxClients > 0 || sub.planSlug === 'business' || sub.planSlug === 'agency',
      },
    };
  }
}
