import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import {
  requireAuth,
  AuthRepository,
  verifyPassword,
  hashPassword,
} from '@/lib/auth';
import { changePasswordSchema } from '@/lib/validation';

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const validated = changePasswordSchema.parse(body);

    const user = await AuthRepository.findUserById(session.userId);
    if (!user) {
      return apiResponse.error('User not found', 'USER_NOT_FOUND', 404);
    }

    // Verify current password with bcrypt
    const isCurrentValid = await verifyPassword(validated.currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      return apiResponse.error('The current password you entered is incorrect.', 'INCORRECT_PASSWORD', 400);
    }

    // Hash new password with salt 12
    const newHash = await hashPassword(validated.newPassword);

    await AuthRepository.updateUser(session.userId, {
      passwordHash: newHash,
      failedLoginAttempts: 0,
      lockoutUntil: null,
    });

    // Invalidate other sessions for security
    const revokedCount = await AuthRepository.revokeAllOtherSessions(
      session.userId,
      session.sessionId || ''
    );

    await AuthRepository.logActivity({
      userId: session.userId,
      action: 'PASSWORD_CHANGED',
      entityType: 'User',
      entityId: session.userId,
      metadata: { otherSessionsRevoked: revokedCount },
      userAgent: req.headers.get('user-agent'),
    });

    return apiResponse.success({
      message: 'Password changed successfully. All other active sessions have been signed out.',
    });
  } catch (error) {
    return apiResponse.handle(error, 'Change Password');
  }
}
