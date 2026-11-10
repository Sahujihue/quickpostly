import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { requireRole, AuthRepository } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentSession = await requireRole(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json();
    const { status } = body;

    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      return apiResponse.error("Status must be either 'ACTIVE' or 'SUSPENDED'", 'INVALID_STATUS', 400);
    }

    const targetUser = await AuthRepository.findUserById(params.id);
    if (!targetUser) {
      return apiResponse.error('Target user not found', 'NOT_FOUND', 404);
    }

    // Protect Super Admin from suspension
    if (targetUser.role === 'SUPER_ADMIN') {
      return apiResponse.error('The primary Super Admin cannot be suspended.', 'FORBIDDEN', 403);
    }

    await AuthRepository.updateUser(params.id, { status });

    // If suspended, revoke all active sessions immediately
    if (status === 'SUSPENDED') {
      await AuthRepository.revokeAllOtherSessions(params.id, '');
    }

    await AuthRepository.logActivity({
      userId: currentSession.userId,
      action: status === 'SUSPENDED' ? 'ADMIN_USER_SUSPENDED' : 'ADMIN_USER_ACTIVATED',
      entityType: 'User',
      entityId: params.id,
      metadata: { targetEmail: targetUser.email, newStatus: status },
      userAgent: req.headers.get('user-agent'),
    });

    return apiResponse.success({
      message: `User has been successfully ${status === 'SUSPENDED' ? 'suspended' : 'activated'}.`,
      status,
    });
  } catch (error) {
    return apiResponse.handle(error, 'Admin Toggle User Status');
  }
}
