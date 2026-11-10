export * from './types';
export * from '@/lib/subscriptions/repository';
export * from '@/lib/subscriptions/enforcement';

import { SubscriptionRepository } from '@/lib/subscriptions/repository';
import { SubscriptionEnforcementService, EnforceableMetric } from '@/lib/subscriptions/enforcement';

export class SubscriptionQuotaService {
  public static async getLimitsForPlan(planSlug: string) {
    const plan = await SubscriptionRepository.getPlanBySlug(planSlug);
    return plan?.limits;
  }

  public static async assertLimit(workspaceId: string, metric: EnforceableMetric, amount = 1) {
    return SubscriptionEnforcementService.assertLimit(workspaceId, metric, amount);
  }

  public static async assertFeature(workspaceId: string, feature: 'hasSocialInbox' | 'analyticsHistory') {
    return SubscriptionEnforcementService.assertFeatureAccess(workspaceId, feature);
  }
}
