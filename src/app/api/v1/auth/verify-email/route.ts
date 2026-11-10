import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { AuthRepository } from '@/lib/auth';
import { verifyEmailSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = verifyEmailSchema.parse(body);

    const tokenRecord = await AuthRepository.findVerificationToken(validated.token, 'EMAIL_VERIFICATION');
    if (!tokenRecord) {
      return apiResponse.error('Verification link is invalid or has expired. Please request a new one.', 'INVALID_TOKEN', 400);
    }

    const user = await AuthRepository.findUserByEmail(tokenRecord.identifier);
    if (!user) {
      return apiResponse.error('Associated user account was not found.', 'USER_NOT_FOUND', 404);
    }

    const now = new Date().toISOString();
    await AuthRepository.updateUser(user.id, {
      emailVerified: now,
      status: 'ACTIVE',
    });

    await AuthRepository.consumeVerificationToken(validated.token, 'EMAIL_VERIFICATION');

    await AuthRepository.logActivity({
      userId: user.id,
      action: 'EMAIL_VERIFIED',
      entityType: 'User',
      entityId: user.id,
      userAgent: req.headers.get('user-agent'),
    });

    return apiResponse.success({
      message: 'Email address successfully verified! Your account is fully active.',
    });
  } catch (error) {
    return apiResponse.handle(error, 'Verify Email');
  }
}
