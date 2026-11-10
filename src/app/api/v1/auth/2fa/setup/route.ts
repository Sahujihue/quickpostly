import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import {
  requireAuth,
  AuthRepository,
  generateTotpSecret,
  generateTotpQrCodeDataUrl,
  verifyTotpToken,
  generateRecoveryCodes,
} from '@/lib/auth';
import { setupTwoFactorSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

// GET: Initiates 2FA setup by generating a new secret and QR code data URL
export async function GET() {
  try {
    const session = await requireAuth();
    const secret = generateTotpSecret();
    const qrCodeDataUrl = await generateTotpQrCodeDataUrl(session.email, secret);

    return apiResponse.success({
      secret,
      qrCodeDataUrl,
      issuer: 'SocialHive',
      account: session.email,
    });
  } catch (error) {
    return apiResponse.handle(error, '2FA Setup Init');
  }
}

// POST: Confirms initial 6-digit code, saves secret, enables 2FA, returns recovery codes
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const validated = setupTwoFactorSchema.parse(body);

    const isValid = verifyTotpToken(validated.code, validated.secret);
    if (!isValid) {
      return apiResponse.error('Verification code is invalid. Please ensure your authenticator clock is synced.', 'INVALID_TOTP_CODE', 400);
    }

    const recoveryCodes = generateRecoveryCodes(8);

    await AuthRepository.updateUser(session.userId, {
      twoFactorEnabled: true,
      twoFactorSecret: validated.secret,
      twoFactorRecoveryCodes: recoveryCodes,
    });

    await AuthRepository.logActivity({
      userId: session.userId,
      action: '2FA_ENABLED',
      entityType: 'User',
      entityId: session.userId,
      metadata: { recoveryCodesCount: recoveryCodes.length },
      userAgent: req.headers.get('user-agent'),
    });

    return apiResponse.success({
      message: 'Two-Factor Authentication is now actively protecting your account.',
      recoveryCodes,
    });
  } catch (error) {
    return apiResponse.handle(error, '2FA Setup Confirm');
  }
}
