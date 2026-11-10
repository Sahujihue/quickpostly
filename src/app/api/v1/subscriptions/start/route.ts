import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { billingManager } from '@/modules/payments';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workspaceId, userId, planSlug, interval, customIntervalDays, couponCode, isTrial } = body;

    if (!workspaceId || !planSlug) {
      return apiResponse.badRequest('Missing required fields: workspaceId, planSlug');
    }

    const provider = billingManager.getProvider();
    const result = await provider.createSubscription({
      workspaceId,
      userId: userId || 'usr_current_user',
      planSlug,
      interval: interval || 'MONTHLY',
      customIntervalDays,
      couponCode,
      isTrial: Boolean(isTrial),
    });

    return apiResponse.success(result, 'Subscription successfully created');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to start subscription';
    return apiResponse.error({ message, code: 'SUBSCRIPTION_START_ERROR', status: 400 });
  }
}
