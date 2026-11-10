import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { PaymentRepository } from '@/lib/payments/repository';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = await PaymentRepository.updateGatewayConfig(params.id, body);
    return apiResponse.success(updated, `Gateway '${updated.name}' configuration saved successfully.`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update gateway settings';
    return apiResponse.error({ message, code: 'ADMIN_GATEWAY_UPDATE_ERROR', status: 400 });
  }
}
