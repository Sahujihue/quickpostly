// src/app/api/v1/admin/social/platforms/[id]/test/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SocialRepository } from '@/lib/social/repository';
import { SocialPlatformId } from '@/modules/social/types';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const platformId = params.id as SocialPlatformId;
    const testResult = await SocialRepository.testPlatformConnection(platformId);

    return apiResponse.success(testResult, testResult.message);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Platform connection test failed';
    return apiResponse.error({ message, code: 'PLATFORM_TEST_ERROR', status: 400 });
  }
}
