import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { PaymentRepository } from '@/lib/payments/repository';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || 'Admin verified refund requested';

    const refundedTx = await PaymentRepository.refundTransaction(params.id, reason);
    return apiResponse.success(refundedTx, `Transaction ${refundedTx.transactionNumber} refunded successfully.`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Refund operation failed';
    return apiResponse.error({ message, code: 'ADMIN_REFUND_ERROR', status: 400 });
  }
}
