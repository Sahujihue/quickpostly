import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { billingManager } from '@/modules/payments';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscriptionId, reason, cancelImmediately } = body;

    if (!subscriptionId) {
      return apiResponse.badRequest('Missing subscriptionId');
    }

    const provider = billingManager.getProvider();
    const result = await provider.cancelSubscription({
      subscriptionId,
      reason,
      cancelImmediately: Boolean(cancelImmediately),
    });

    return apiResponse.success(result, 'Subscription cancellation processed');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to cancel subscription';
    return apiResponse.error({ message, code: 'SUBSCRIPTION_CANCEL_ERROR', status: 400 });
  }
}
