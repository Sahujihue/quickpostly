import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SubscriptionRepository } from '@/lib/subscriptions/repository';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, reason } = body;

    if (!status) {
      return apiResponse.badRequest('Missing status');
    }

    if (status === 'CANCELED') {
      const updated = await SubscriptionRepository.cancelSubscription(params.id, reason, true);
      return apiResponse.success(updated, 'Subscription canceled');
    }

    if (status === 'ACTIVE') {
      const updated = await SubscriptionRepository.recoverPayment(params.id);
      return apiResponse.success(updated, 'Subscription marked ACTIVE');
    }

    if (status === 'GRACE_PERIOD' || status === 'PAST_DUE') {
      const updated = await SubscriptionRepository.handlePaymentFailure(params.id, reason);
      return apiResponse.success(updated, 'Subscription entered grace period');
    }

    return apiResponse.badRequest(`Unsupported status transition: ${status}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update subscription status';
    return apiResponse.error({ message, code: 'ADMIN_STATUS_UPDATE_ERROR', status: 400 });
  }
}
