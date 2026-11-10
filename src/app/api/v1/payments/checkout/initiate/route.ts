import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { PaymentOrchestrator } from '@/lib/payments/orchestrator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      workspaceId,
      userId,
      planSlug,
      interval,
      currency,
      gatewayId,
      paymentMethod,
      customerEmail,
      customerName,
      couponCode,
      country,
    } = body;

    if (!workspaceId || !planSlug || !gatewayId || !customerEmail) {
      return apiResponse.badRequest('Missing required fields: workspaceId, planSlug, gatewayId, customerEmail');
    }

    const result = await PaymentOrchestrator.initiateCheckout({
      workspaceId,
      userId: userId || 'usr_current',
      planSlug,
      interval: interval || 'MONTHLY',
      currency: currency || 'USD',
      gatewayId,
      paymentMethod: paymentMethod || 'CARDS',
      customerEmail,
      customerName,
      couponCode,
      country,
    });

    return apiResponse.success(result, 'Checkout initiated successfully');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Checkout initiation failed';
    return apiResponse.error({ message, code: 'CHECKOUT_INITIATE_ERROR', status: 400 });
  }
}
