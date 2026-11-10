// src/app/api/v1/admin/social/platforms/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SocialRepository } from '@/lib/social/repository';

export async function GET() {
  try {
    const configs = await SocialRepository.getAllPlatformConfigs();
    return apiResponse.success(configs);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch platform configs';
    return apiResponse.error({ message, code: 'ADMIN_PLATFORMS_ERROR', status: 500 });
  }
}
