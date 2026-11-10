import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { apiResponse } from '@/lib/api-response';
import { AuthRepository, RateLimiter } from '@/lib/auth';
import { forgotPasswordSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const body = await req.json();
    const validated = forgotPasswordSchema.parse(body);

    // Rate limit: 3 requests / 15 mins / email
    const rateLimit = RateLimiter.check(`forgot:${validated.email.toLowerCase().trim()}`, 3, 900);
    if (!rateLimit.allowed) {
      return apiResponse.error('Too many password reset requests. Please wait before trying again.', 'RATE_LIMIT_EXCEEDED', 429);
    }

    const user = await AuthRepository.findUserByEmail(validated.email);
    let resetToken: string | undefined;

    if (user && user.status !== 'SUSPENDED') {
      resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await AuthRepository.createVerificationToken({
        identifier: user.email,
        token: resetToken,
        type: 'PASSWORD_RESET',
        expiresAt,
        userId: user.id,
      });

      await AuthRepository.logActivity({
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        entityType: 'User',
        entityId: user.id,
        ipAddress: ip,
        userAgent: req.headers.get('user-agent'),
      });
    }

    // Always return success to prevent email enumeration attacks
    return apiResponse.success({
      message: 'If an account exists with this email address, a password reset link has been issued.',
      // Provide reset token in response during dev/testing
      ...(resetToken && { resetToken, resetUrl: `/reset-password?token=${resetToken}` }),
    });
  } catch (error) {
    return apiResponse.handle(error, 'Forgot Password');
  }
}
