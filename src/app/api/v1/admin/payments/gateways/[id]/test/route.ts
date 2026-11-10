import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { PaymentRepository } from '@/lib/payments/repository';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await PaymentRepository.testGatewayConnection(params.id);
    if (!result.success) {
      return apiResponse.badRequest(result.message);
    }
    return apiResponse.success(result, result.message);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Connection test failed';
    return apiResponse.error({ message, code: 'GATEWAY_TEST_ERROR', status: 400 });
  }
}
