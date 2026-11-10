import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { billingManager } from '@/modules/payments';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return apiResponse.badRequest('Missing subscriptionId');
    }

    const provider = billingManager.getProvider();
    const result = await provider.renewSubscription(subscriptionId);

    return apiResponse.success(result, 'Subscription renewed successfully');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to renew subscription';
    return apiResponse.error({ message, code: 'SUBSCRIPTION_RENEW_ERROR', status: 400 });
  }
}
