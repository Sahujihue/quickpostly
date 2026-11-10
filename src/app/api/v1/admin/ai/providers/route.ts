// src/app/api/v1/admin/ai/providers/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { AIRepository } from '@/lib/ai/repository';

export async function GET() {
  try {
    const providers = await AIRepository.getAllProviders();
    return apiResponse.success(providers);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch providers';
    return apiResponse.error({ message, code: 'ADMIN_PROVIDERS_ERROR', status: 500 });
  }
}
