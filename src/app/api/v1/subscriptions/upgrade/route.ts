import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { billingManager } from '@/modules/payments';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscriptionId, newPlanSlug, interval, couponCode } = body;

    if (!subscriptionId || !newPlanSlug) {
      return apiResponse.badRequest('Missing required fields: subscriptionId, newPlanSlug');
    }

    const provider = billingManager.getProvider();
    const result = await provider.updateSubscription({
      subscriptionId,
      newPlanSlug,
      interval,
      couponCode,
    });

    return apiResponse.success(result, 'Plan updated successfully');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update plan';
    return apiResponse.error({ message, code: 'SUBSCRIPTION_UPDATE_ERROR', status: 400 });
  }
}
