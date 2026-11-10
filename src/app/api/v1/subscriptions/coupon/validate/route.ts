import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SubscriptionRepository } from '@/lib/subscriptions/repository';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, planSlug, amount } = body;

    if (!code || !planSlug) {
      return apiResponse.badRequest('Missing code or planSlug');
    }

    const result = await SubscriptionRepository.validateCoupon(
      code,
      planSlug,
      Number(amount) || 0
    );

    if (!result.valid) {
      return apiResponse.badRequest(result.message || 'Invalid coupon code');
    }

    return apiResponse.success(result, result.message);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Coupon validation failed';
    return apiResponse.error({ message, code: 'COUPON_VALIDATION_ERROR', status: 400 });
  }
}
