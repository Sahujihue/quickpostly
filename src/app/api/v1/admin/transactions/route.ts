import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { PaymentRepository } from '@/lib/payments/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const gateway = searchParams.get('gateway') || 'ALL';
    const status = searchParams.get('status') || 'ALL';

    const transactions = await PaymentRepository.getAllTransactions({
      search,
      gateway,
      status,
    });

    const totalVolume = transactions
      .filter((t) => t.status === 'SUCCEEDED')
      .reduce((sum, t) => sum + t.amount, 0);

    const refundedVolume = transactions
      .filter((t) => t.isRefunded)
      .reduce((sum, t) => sum + t.refundAmount, 0);

    return apiResponse.success({
      transactions,
      metrics: {
        totalCount: transactions.length,
        succeededCount: transactions.filter((t) => t.status === 'SUCCEEDED').length,
        refundedCount: transactions.filter((t) => t.isRefunded).length,
        failedCount: transactions.filter((t) => t.status === 'FAILED').length,
        totalVolume,
        refundedVolume,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve transactions';
    return apiResponse.error({ message, code: 'ADMIN_TRANSACTIONS_ERROR', status: 500 });
  }
}
