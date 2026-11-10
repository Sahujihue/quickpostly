// src/app/api/v1/social/accounts/[id]/refresh/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SocialRepository } from '@/lib/social/repository';
import { SocialOAuthEngine } from '@/lib/social/oauth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const account = await SocialRepository.getAccountById(params.id);
    if (!account) {
      return apiResponse.notFound(`Social account '${params.id}' not found`);
    }

    const config = await SocialRepository.getPlatformConfig(account.platform);
    if (!config) {
      return apiResponse.error({
        message: `Platform '${account.platform}' configuration missing`,
        code: 'PLATFORM_NOT_FOUND',
        status: 400,
      });
    }

    const refreshResult = await SocialOAuthEngine.refreshToken({
      platformId: account.platform,
      refreshToken: 'sim_refresh_token',
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    });

    const updated = await SocialRepository.updateAccountToken(
      account.id,
      refreshResult.accessToken,
      refreshResult.refreshToken,
      refreshResult.tokenExpiresAt
    );

    return apiResponse.success(updated, 'Access token refreshed successfully.');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Token refresh failed';
    return apiResponse.error({ message, code: 'TOKEN_REFRESH_ERROR', status: 400 });
  }
}
