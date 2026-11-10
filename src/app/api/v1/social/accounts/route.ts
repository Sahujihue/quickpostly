// src/app/api/v1/social/accounts/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SocialRepository } from '@/lib/social/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_peak_scale';

    const accounts = await SocialRepository.getAccountsForWorkspace(workspaceId);
    return apiResponse.success(accounts);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch social accounts';
    return apiResponse.error({ message, code: 'SOCIAL_ACCOUNTS_FETCH_ERROR', status: 500 });
  }
}
