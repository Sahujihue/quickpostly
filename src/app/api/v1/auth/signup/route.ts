import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { apiResponse } from '@/lib/api-response';
import { signupSchema } from '@/lib/validation';
import { AuthRepository, hashPassword, RateLimiter } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = RateLimiter.check(`signup:${ip}`, 10, 3600); // 10 signups / hour / ip
    if (!rateLimit.allowed) {
      return apiResponse.error(
        `Too many registration attempts. Please try again in ${rateLimit.retryAfterSeconds} seconds.`,
        'RATE_LIMIT_EXCEEDED',
        429
      );
    }

    const body = await req.json();
    const validated = signupSchema.parse(body);

    // Check existing email
    const existing = await AuthRepository.findUserByEmail(validated.email);
    if (existing) {
      return apiResponse.error('An account with this email address already exists', 'EMAIL_ALREADY_EXISTS', 409);
    }

    // Secure password hashing
    const passwordHash = await hashPassword(validated.password);

    // Create user (Public signups are strictly USER role - never admin)
    const user = await AuthRepository.createUser({
      email: validated.email,
      passwordHash,
      name: validated.name,
      role: 'USER',
      emailVerified: null,
    });

    // Generate Email Verification Token (24h validity)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await AuthRepository.createVerificationToken({
      identifier: user.email,
      token,
      type: 'EMAIL_VERIFICATION',
      expiresAt,
      userId: user.id,
    });

    // Log registration activity
    await AuthRepository.logActivity({
      userId: user.id,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user.id,
      metadata: { email: user.email, workspaceName: validated.workspaceName || 'Personal' },
      ipAddress: ip,
      userAgent: req.headers.get('user-agent'),
    });

    return apiResponse.created(
      {
        message: 'Account created successfully. A verification link has been generated.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
        },
        verificationToken: token,
        verificationUrl: `/verify-email?token=${token}`,
      }
    );
  } catch (error) {
    return apiResponse.handle(error, 'Auth Signup');
  }
}
