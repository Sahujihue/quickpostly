import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SubscriptionRepository } from '@/lib/subscriptions/repository';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const saved = await SubscriptionRepository.saveCoupon({
      ...body,
      id: params.id,
    });
    return apiResponse.success(saved, 'Coupon updated successfully');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update coupon';
    return apiResponse.error({ message, code: 'ADMIN_COUPON_UPDATE_ERROR', status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await SubscriptionRepository.deleteCoupon(params.id);
    if (!success) {
      return apiResponse.notFound(`Coupon '${params.id}' not found`);
    }
    return apiResponse.success({ deleted: true }, 'Coupon deleted successfully');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete coupon';
    return apiResponse.error({ message, code: 'ADMIN_COUPON_DELETE_ERROR', status: 400 });
  }
}
