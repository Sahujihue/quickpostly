import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { PaymentOrchestrator } from '@/lib/payments/orchestrator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      transactionId,
      gatewayId,
      paymentRef,
      orderId,
      signature,
      workspaceId,
      userId,
      planSlug,
      interval,
    } = body;

    if (!transactionId || !gatewayId || !paymentRef || !workspaceId || !planSlug) {
      return apiResponse.badRequest(
        'Missing required verification fields: transactionId, gatewayId, paymentRef, workspaceId, planSlug'
      );
    }

    const result = await PaymentOrchestrator.verifyAndActivate({
      transactionId,
      gatewayId,
      paymentRef,
      orderId,
      signature,
      workspaceId,
      userId: userId || 'usr_current',
      planSlug,
      interval: interval || 'MONTHLY',
    });

    return apiResponse.success(result, result.message);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server-side payment verification failed';
    return apiResponse.error({ message, code: 'PAYMENT_VERIFICATION_FAILED', status: 400 });
  }
}
