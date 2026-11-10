// src/app/api/v1/admin/ai/providers/[id]/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { AIRepository } from '@/lib/ai/repository';
import { AIProviderId } from '@/modules/ai/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const provider = await AIRepository.getProvider(params.id as AIProviderId);
    if (!provider) {
      return apiResponse.notFound(`Provider '${params.id}' not found`);
    }
    return apiResponse.success(provider);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch provider';
    return apiResponse.error({ message, code: 'ADMIN_PROVIDER_ERROR', status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = await AIRepository.updateProvider(params.id as AIProviderId, body);
    return apiResponse.success(updated, `Provider '${updated.name}' settings updated.`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update provider';
    return apiResponse.error({ message, code: 'ADMIN_PROVIDER_UPDATE_ERROR', status: 400 });
  }
}
