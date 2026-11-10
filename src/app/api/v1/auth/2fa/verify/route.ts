import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { apiResponse } from '@/lib/api-response';
import { verifyTwoFactorSchema } from '@/lib/validation';
import {
  AuthRepository,
  verifyTotpToken,
  signSessionToken,
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const body = await req.json();
    const validated = verifyTwoFactorSchema.parse(body);

    // Find and consume temporary 2FA token
    const tokenRecord = await AuthRepository.findVerificationToken(validated.tempToken, 'TWO_FACTOR_AUTH');
    if (!tokenRecord || !tokenRecord.userId) {
      return apiResponse.error('Verification session has expired or is invalid. Please log in again.', 'SESSION_EXPIRED', 400);
    }

    const user = await AuthRepository.findUserById(tokenRecord.userId);
    if (!user || user.status === 'SUSPENDED') {
      return apiResponse.error('User not found or account suspended', 'USER_INVALID', 403);
    }

    // Verify OTP
    const isOtpValid = user.twoFactorSecret
      ? verifyTotpToken(validated.code, user.twoFactorSecret)
      : false;

    // Check backup recovery codes
    const isRecoveryCode = user.twoFactorRecoveryCodes?.includes(validated.code);

    if (!isOtpValid && !isRecoveryCode) {
      return apiResponse.error('Invalid 2FA code. Please check your authenticator app and try again.', 'INVALID_2FA_CODE', 400);
    }

    // Consume temp token
    await AuthRepository.consumeVerificationToken(validated.tempToken, 'TWO_FACTOR_AUTH');

    // If recovery code was used, consume it
    if (isRecoveryCode && user.twoFactorRecoveryCodes) {
      const remainingCodes = user.twoFactorRecoveryCodes.filter((c) => c !== validated.code);
      await AuthRepository.updateUser(user.id, { twoFactorRecoveryCodes: remainingCodes });
    }

    // Create session
    const sessionToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + (validated.rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000);
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    const sessionRecord = await AuthRepository.createSession({
      userId: user.id,
      token: sessionToken,
      userAgent,
      ipAddress: ip,
      deviceInfo: userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser',
      expiresAt,
    });

    const jwtToken = signSessionToken(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isSuperAdmin: user.role === 'SUPER_ADMIN',
        sessionId: sessionRecord.id,
        roles: [user.role],
        permissions: user.role === 'SUPER_ADMIN' ? ['*'] : ['workspace:personal'],
      },
      validated.rememberMe ? '30d' : '7d'
    );

    await AuthRepository.logActivity({
      userId: user.id,
      action: '2FA_LOGIN_SUCCESS',
      entityType: 'User',
      entityId: user.id,
      metadata: { method: isRecoveryCode ? 'recovery_code' : 'totp' },
      ipAddress: ip,
      userAgent,
    });

    const response = apiResponse.success({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
      token: jwtToken,
    });

    response.cookies.set(SESSION_COOKIE_NAME, jwtToken, getSessionCookieOptions(validated.rememberMe));
    return response;
  } catch (error) {
    return apiResponse.handle(error, '2FA Verify');
  }
}
