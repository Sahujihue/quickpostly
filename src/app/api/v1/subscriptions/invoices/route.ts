import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SubscriptionRepository } from '@/lib/subscriptions/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ALL';

    const invoices = await SubscriptionRepository.getInvoicesByWorkspace(workspaceId);
    return apiResponse.success(invoices);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve invoices';
    return apiResponse.error({ message, code: 'INVOICES_FETCH_ERROR', status: 500 });
  }
}
