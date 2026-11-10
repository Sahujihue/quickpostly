import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { requireAuth, AuthRepository, verifyPassword } from '@/lib/auth';
import { disableTwoFactorSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const validated = disableTwoFactorSchema.parse(body);

    const user = await AuthRepository.findUserById(session.userId);
    if (!user) {
      return apiResponse.error('User not found', 'USER_NOT_FOUND', 404);
    }

    const isMatch = await verifyPassword(validated.password, user.passwordHash);
    if (!isMatch) {
      return apiResponse.error('Incorrect password. You must provide your current password to disable 2FA.', 'INCORRECT_PASSWORD', 400);
    }

    await AuthRepository.updateUser(session.userId, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorRecoveryCodes: null,
    });

    await AuthRepository.logActivity({
      userId: session.userId,
      action: '2FA_DISABLED',
      entityType: 'User',
      entityId: session.userId,
      userAgent: req.headers.get('user-agent'),
    });

    return apiResponse.success({
      message: 'Two-Factor Authentication has been successfully disabled.',
    });
  } catch (error) {
    return apiResponse.handle(error, '2FA Disable');
  }
}
