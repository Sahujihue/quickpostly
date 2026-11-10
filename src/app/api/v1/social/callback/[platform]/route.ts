// src/app/api/v1/social/callback/[platform]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SocialPlatformId } from '@/modules/social/types';
import { SocialRepository } from '@/lib/social/repository';
import { SocialOAuthEngine } from '@/lib/social/oauth';

export async function GET(
  req: NextRequest,
  { params }: { params: { platform: string } }
) {
  const platformId = params.platform.toLowerCase() as SocialPlatformId;
  const { searchParams } = new URL(req.url);

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    const errorUrl = `/dashboard/accounts?error=${encodeURIComponent(
      errorDescription || error
    )}&platform=${platformId}`;
    return NextResponse.redirect(new URL(errorUrl, req.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/dashboard/accounts?error=Missing+authorization+code+or+state', req.url)
    );
  }

  try {
    // 1. Consume and validate CSRF state (protects against replay attacks)
    const statePayload = await SocialRepository.consumeOAuthState(state);
    if (!statePayload) {
      return NextResponse.redirect(
        new URL('/dashboard/accounts?error=Invalid+or+expired+OAuth+session+state', req.url)
      );
    }

    // 2. Fetch platform configuration
    const config = await SocialRepository.getPlatformConfig(platformId);
    if (!config) {
      return NextResponse.redirect(
        new URL('/dashboard/accounts?error=Platform+configuration+missing', req.url)
      );
    }

    // 3. Exchange code for access token & fetch profile
    const tokenResult = await SocialOAuthEngine.exchangeCodeForToken({
      platformId,
      code,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: statePayload.redirectUri,
      codeVerifier: statePayload.codeVerifier,
    });

    // 4. Save Connected Social Account
    const accountId = `acc_${platformId}_${Date.now()}`;
    await SocialRepository.connectAccount({
      id: accountId,
      workspaceId: statePayload.workspaceId,
      userId: statePayload.userId,
      platform: platformId,
      platformAccountId: tokenResult.platformAccountId,
      accountName: tokenResult.accountName,
      accountHandle: tokenResult.accountHandle,
      accountType: tokenResult.accountType,
      profilePictureUrl: tokenResult.profilePictureUrl,
      followersCount: tokenResult.followersCount,
      tokenExpiresAt: tokenResult.tokenExpiresAt,
      scopesGranted: tokenResult.scopesGranted,
      connectionStatus: 'CONNECTED',
      lastSyncAt: new Date().toISOString(),
      metadata: tokenResult.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.redirect(
      new URL(
        `/dashboard/accounts?connected=${platformId}&accountName=${encodeURIComponent(
          tokenResult.accountName
        )}`,
        req.url
      )
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'OAuth callback processing failed';
    return NextResponse.redirect(
      new URL(
        `/dashboard/accounts?error=${encodeURIComponent(msg)}&platform=${platformId}`,
        req.url
      )
    );
  }
}
