import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { PaymentOrchestrator } from '@/lib/payments/orchestrator';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const currency = searchParams.get('currency') || 'USD';
    const country = searchParams.get('country') || 'GLOBAL';
    const isRecurring = searchParams.get('recurring') === 'true';

    const gateways = await PaymentOrchestrator.getAvailableGateways({
      currency,
      country,
      isRecurring,
    });

    return apiResponse.success(gateways);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve available gateways';
    return apiResponse.error({ message, code: 'PAYMENT_GATEWAYS_FETCH_ERROR', status: 500 });
  }
}
