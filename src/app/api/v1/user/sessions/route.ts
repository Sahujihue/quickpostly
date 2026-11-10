import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { requireAuth, AuthRepository } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await requireAuth();
    const activeSessions = await AuthRepository.getUserSessions(session.userId);

    const formatted = activeSessions.map((s) => ({
      id: s.id,
      deviceInfo: s.deviceInfo || 'Unknown Device',
      userAgent: s.userAgent || 'Unknown Browser',
      ipAddress: s.ipAddress || 'Unknown IP',
      isCurrent: s.id === session.sessionId,
      lastActiveAt: s.lastActiveAt,
      createdAt: s.createdAt,
    }));

    return apiResponse.success({
      sessions: formatted,
    });
  } catch (error) {
    return apiResponse.handle(error, 'Get Sessions');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth();
    const url = new URL(req.url);
    const targetSessionId = url.searchParams.get('id');
    const revokeAllOthers = url.searchParams.get('allOthers') === 'true';

    if (revokeAllOthers) {
      const count = await AuthRepository.revokeAllOtherSessions(session.userId, session.sessionId || '');
      await AuthRepository.logActivity({
        userId: session.userId,
        action: 'REVOKE_ALL_OTHER_SESSIONS',
        entityType: 'Session',
        metadata: { revokedCount: count },
      });
      return apiResponse.success({ message: `Successfully revoked ${count} other sessions.` });
    }

    if (!targetSessionId) {
      return apiResponse.error('Session ID is required', 'MISSING_SESSION_ID', 400);
    }

    const sessions = await AuthRepository.getUserSessions(session.userId);
    const target = sessions.find((s) => s.id === targetSessionId);
    if (!target) {
      return apiResponse.error('Session not found', 'NOT_FOUND', 404);
    }

    await AuthRepository.revokeSession(target.token);

    await AuthRepository.logActivity({
      userId: session.userId,
      action: 'REVOKE_SINGLE_SESSION',
      entityType: 'Session',
      entityId: targetSessionId,
    });

    return apiResponse.success({ message: 'Session revoked successfully.' });
  } catch (error) {
    return apiResponse.handle(error, 'Revoke Session');
  }
}
