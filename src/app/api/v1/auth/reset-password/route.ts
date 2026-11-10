import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { AuthRepository, hashPassword } from '@/lib/auth';
import { resetPasswordSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const body = await req.json();
    const validated = resetPasswordSchema.parse(body);

    const tokenRecord = await AuthRepository.findVerificationToken(validated.token, 'PASSWORD_RESET');
    if (!tokenRecord) {
      return apiResponse.error('Password reset link is invalid or has expired. Please request a new one.', 'INVALID_OR_EXPIRED_TOKEN', 400);
    }

    const user = await AuthRepository.findUserByEmail(tokenRecord.identifier);
    if (!user) {
      return apiResponse.error('User associated with this reset link no longer exists.', 'USER_NOT_FOUND', 404);
    }

    // Hash new password with bcrypt
    const passwordHash = await hashPassword(validated.password);

    // Update user password and clear any failed attempts
    await AuthRepository.updateUser(user.id, {
      passwordHash,
      failedLoginAttempts: 0,
      lockoutUntil: null,
    });

    // Invalidate the reset token
    await AuthRepository.consumeVerificationToken(validated.token, 'PASSWORD_RESET');

    // Revoke all existing sessions for security
    await AuthRepository.revokeAllOtherSessions(user.id, '');

    await AuthRepository.logActivity({
      userId: user.id,
      action: 'PASSWORD_RESET_COMPLETED',
      entityType: 'User',
      entityId: user.id,
      ipAddress: ip,
      userAgent: req.headers.get('user-agent'),
    });

    return apiResponse.success({
      message: 'Password has been successfully reset. You may now log in with your new password.',
    });
  } catch (error) {
    return apiResponse.handle(error, 'Reset Password');
  }
}
