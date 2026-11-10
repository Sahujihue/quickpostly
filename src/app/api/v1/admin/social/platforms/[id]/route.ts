// src/app/api/v1/admin/social/platforms/[id]/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SocialRepository } from '@/lib/social/repository';
import { SocialPlatformId } from '@/modules/social/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const config = await SocialRepository.getPlatformConfig(params.id as SocialPlatformId);
    if (!config) {
      return apiResponse.notFound(`Platform '${params.id}' not found`);
    }
    return apiResponse.success(config);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch platform config';
    return apiResponse.error({ message, code: 'ADMIN_PLATFORM_ERROR', status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = await SocialRepository.updatePlatformConfig(params.id as SocialPlatformId, body);
    return apiResponse.success(updated, `Platform '${updated.name}' settings updated.`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update platform';
    return apiResponse.error({ message, code: 'ADMIN_PLATFORM_UPDATE_ERROR', status: 400 });
  }
}
