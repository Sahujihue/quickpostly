import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { PaymentRepository } from '@/lib/payments/repository';

export async function GET() {
  try {
    const configs = await PaymentRepository.getAllGatewayConfigs();
    return apiResponse.success(configs);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve gateway configurations';
    return apiResponse.error({ message, code: 'ADMIN_GATEWAYS_FETCH_ERROR', status: 500 });
  }
}
