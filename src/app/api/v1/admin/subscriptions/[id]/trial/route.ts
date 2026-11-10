import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SubscriptionRepository } from '@/lib/subscriptions/repository';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { additionalDays } = body;

    const days = Number(additionalDays);
    if (!days || isNaN(days) || days <= 0) {
      return apiResponse.badRequest('additionalDays must be a positive number');
    }

    const updated = await SubscriptionRepository.extendTrial(params.id, days);
    return apiResponse.success(updated, `Trial extended by ${days} days`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to extend trial';
    return apiResponse.error({ message, code: 'ADMIN_TRIAL_EXTEND_ERROR', status: 400 });
  }
}
