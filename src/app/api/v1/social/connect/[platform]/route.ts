// src/app/api/v1/social/connect/[platform]/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SocialPlatformId } from '@/modules/social/types';
import { SocialRepository } from '@/lib/social/repository';
import { SocialOAuthEngine } from '@/lib/social/oauth';

export async function POST(
  req: NextRequest,
  { params }: { params: { platform: string } }
) {
  try {
    const platformId = params.platform.toLowerCase() as SocialPlatformId;
    const body = await req.json().catch(() => ({}));
    const workspaceId = body.workspaceId || 'ws_peak_scale';
    const userId = body.userId || 'usr_current';

    const config = await SocialRepository.getPlatformConfig(platformId);
    if (!config || !config.isEnabled) {
      return apiResponse.error({
        message: `Platform '${platformId}' is currently disabled by administrator or not supported.`,
        code: 'PLATFORM_DISABLED',
        status: 400,
      });
    }

    if (!config.clientId || config.clientId.trim().length === 0) {
      return apiResponse.error({
        message: `App ID / Client ID for '${config.name}' is not configured in Admin > Social API Settings.`,
        code: 'APP_NOT_CONFIGURED',
        status: 400,
      });
    }

    const redirectUri =
      config.redirectUri || `http://localhost:3004/api/v1/social/callback/${platformId}`;

    const { authUrl, stateRecord } = SocialOAuthEngine.generateAuthUrl({
      platformId,
      clientId: config.clientId,
      redirectUri,
      workspaceId,
      userId,
      customScopes: config.scopes,
    });

    // Save CSRF state with 15-minute TTL
    await SocialRepository.saveOAuthState(stateRecord);

    return apiResponse.success({
      authUrl,
      state: stateRecord.state,
      platform: platformId,
      expiresAt: stateRecord.expiresAt,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to initiate OAuth flow';
    return apiResponse.error({ message, code: 'OAUTH_INITIATE_ERROR', status: 400 });
  }
}
