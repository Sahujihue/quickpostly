import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import {
  SubscriptionEnforcementService,
  EnforceableMetric,
} from '@/lib/subscriptions/enforcement';
import { AppException } from '@/lib/exceptions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workspaceId, metric, incrementAmount, feature } = body;

    if (!workspaceId) {
      return apiResponse.badRequest('Missing workspaceId');
    }

    if (feature) {
      await SubscriptionEnforcementService.assertFeatureAccess(workspaceId, feature);
      return apiResponse.success({ allowed: true, feature, message: 'Feature access granted' });
    }

    if (metric) {
      const result = await SubscriptionEnforcementService.assertLimit(
        workspaceId,
        metric as EnforceableMetric,
        Number(incrementAmount) || 1
      );
      return apiResponse.success(result, 'Limit check passed');
    }

    // Default: verify subscription is active
    const sub = await SubscriptionEnforcementService.assertActiveSubscription(workspaceId);
    return apiResponse.success({ allowed: true, subscription: sub });
  } catch (err: unknown) {
    if (err instanceof AppException) {
      return apiResponse.error({
        message: err.message,
        code: err.code,
        status: err.statusCode,
        details: err.details,
      });
    }
    const message = err instanceof Error ? err.message : 'Subscription enforcement error';
    return apiResponse.error({ message, code: 'SUBSCRIPTION_ENFORCEMENT_ERROR', status: 500 });
  }
}
