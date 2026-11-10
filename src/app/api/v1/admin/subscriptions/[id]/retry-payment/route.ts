import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SubscriptionRepository } from '@/lib/subscriptions/repository';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updated = await SubscriptionRepository.recoverPayment(params.id);
    return apiResponse.success(updated, 'Payment successfully recovered. Active status restored.');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to recover payment';
    return apiResponse.error({ message, code: 'ADMIN_RETRY_PAYMENT_ERROR', status: 400 });
  }
}
