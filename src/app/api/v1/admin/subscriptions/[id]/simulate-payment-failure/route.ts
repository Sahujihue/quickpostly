import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SubscriptionRepository } from '@/lib/subscriptions/repository';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || 'Simulated recurring billing processor decline (insufficient funds)';

    const updated = await SubscriptionRepository.handlePaymentFailure(params.id, reason);
    return apiResponse.success(
      updated,
      'Payment failure simulated. Workspace entered 7-day grace period with retry schedule.'
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to simulate payment failure';
    return apiResponse.error({ message, code: 'ADMIN_SIMULATE_FAILURE_ERROR', status: 400 });
  }
}
