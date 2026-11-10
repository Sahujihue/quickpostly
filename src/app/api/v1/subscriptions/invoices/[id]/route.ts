import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SubscriptionRepository } from '@/lib/subscriptions/repository';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoice = await SubscriptionRepository.getInvoiceById(params.id);
    if (!invoice) {
      return apiResponse.notFound(`Invoice '${params.id}' not found`);
    }

    return apiResponse.success(invoice);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve invoice';
    return apiResponse.error({ message, code: 'INVOICE_FETCH_ERROR', status: 500 });
  }
}
