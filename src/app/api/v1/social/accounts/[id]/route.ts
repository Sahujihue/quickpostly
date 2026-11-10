// src/app/api/v1/social/accounts/[id]/route.ts
import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { SocialRepository } from '@/lib/social/repository';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_peak_scale';

    await SocialRepository.disconnectAccount(params.id, workspaceId);
    return apiResponse.success(
      { disconnected: true, id: params.id },
      'Social account disconnected and credentials revoked successfully.'
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to disconnect account';
    return apiResponse.error({ message, code: 'DISCONNECT_ACCOUNT_ERROR', status: 400 });
  }
}
