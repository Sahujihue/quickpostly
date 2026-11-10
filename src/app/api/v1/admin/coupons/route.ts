import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SubscriptionRepository } from '@/lib/subscriptions/repository';

export async function GET() {
  try {
    const coupons = await SubscriptionRepository.getAllCoupons();
    return apiResponse.success(coupons);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch coupons';
    return apiResponse.error({ message, code: 'ADMIN_COUPONS_ERROR', status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, discountType, discountValue, currency, maxRedemptions, perUserLimit, applicablePlanSlugs, expiresAt, isActive } = body;

    if (!code || discountValue === undefined) {
      return apiResponse.badRequest('Missing required fields: code, discountValue');
    }

    const saved = await SubscriptionRepository.saveCoupon({
      code,
      discountType: discountType || 'PERCENTAGE',
      discountValue: Number(discountValue),
      currency: currency || 'USD',
      maxRedemptions: Number(maxRedemptions) || 100,
      perUserLimit: Number(perUserLimit) || 1,
      applicablePlanSlugs: Array.isArray(applicablePlanSlugs) ? applicablePlanSlugs : ['all'],
      expiresAt: expiresAt || undefined,
      isActive: isActive ?? true,
    });

    return apiResponse.success(saved, 'Coupon created successfully');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create coupon';
    return apiResponse.error({ message, code: 'ADMIN_COUPON_CREATE_ERROR', status: 400 });
  }
}
