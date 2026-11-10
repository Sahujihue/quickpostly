import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SubscriptionRepository } from '@/lib/subscriptions/repository';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { planSlug, interval } = body;

    if (!planSlug) {
      return apiResponse.badRequest('Missing planSlug');
    }

    const updated = await SubscriptionRepository.upgradeOrDowngradePlan(
      params.id,
      planSlug,
      interval
    );

    return apiResponse.success(updated, `Plan changed to ${updated.planName}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update subscription plan';
    return apiResponse.error({ message, code: 'ADMIN_PLAN_UPDATE_ERROR', status: 400 });
  }
}
