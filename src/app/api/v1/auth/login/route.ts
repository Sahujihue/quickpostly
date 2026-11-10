import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { apiResponse } from '@/lib/api-response';
import { loginSchema } from '@/lib/validation';
import {
  AuthRepository,
  verifyPassword,
  signSessionToken,
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
  RateLimiter,
  verifyTotpToken,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const body = await req.json();
    const validated = loginSchema.parse(body);
    const emailKey = `login:${validated.email.toLowerCase().trim()}`;
    const ipKey = `login:ip:${ip}`;

    // Rate Limiting & Login Attempt Protection
    const rateLimit = RateLimiter.check(emailKey, 5, 900); // 5 attempts per 15 min
    const ipRateLimit = RateLimiter.check(ipKey, 20, 900); // 20 attempts per IP
    if (!rateLimit.allowed || !ipRateLimit.allowed) {
      const waitTime = Math.max(rateLimit.retryAfterSeconds || 0, ipRateLimit.retryAfterSeconds || 0);
      return apiResponse.error(
        `Too many failed login attempts. Your account is temporarily locked for security. Try again in ${waitTime} seconds.`,
        'ACCOUNT_TEMPORARILY_LOCKED',
        429
      );
    }

    const user = await AuthRepository.findUserByEmail(validated.email);
    if (!user) {
      return apiResponse.error('Invalid email or password', 'INVALID_CREDENTIALS', 401);
    }

    // Check account status
    if (user.status === 'SUSPENDED') {
      return apiResponse.error(
        'Your account has been suspended by an administrator. Please contact support.',
        'ACCOUNT_SUSPENDED',
        403
      );
    }

    // Verify password with bcrypt
    const isValidPassword = await verifyPassword(validated.password, user.passwordHash);
    if (!isValidPassword) {
      // Increment user failed attempts
      await AuthRepository.updateUser(user.id, {
        failedLoginAttempts: (user.failedLoginAttempts || 0) + 1,
      });

      await AuthRepository.logActivity({
        userId: user.id,
        action: 'FAILED_LOGIN_ATTEMPT',
        entityType: 'User',
        entityId: user.id,
        metadata: { ip, remainingAttempts: rateLimit.remaining },
        ipAddress: ip,
        userAgent: req.headers.get('user-agent'),
      });

      return apiResponse.error('Invalid email or password', 'INVALID_CREDENTIALS', 401);
    }

    // Check if Two-Factor Authentication is enabled
    if (user.twoFactorEnabled) {
      if (!validated.twoFactorCode) {
        // Issue temporary 2FA token valid for 5 minutes
        const tempToken = crypto.randomBytes(32).toString('hex');
        await AuthRepository.createVerificationToken({
          identifier: user.id,
          token: tempToken,
          type: 'TWO_FACTOR_AUTH',
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          userId: user.id,
        });

        return apiResponse.success({
          requires2FA: true,
          tempToken,
          message: 'Two-factor authentication code required',
        });
      }

      // Verify provided 2FA code
      const isOtpValid = user.twoFactorSecret
        ? verifyTotpToken(validated.twoFactorCode, user.twoFactorSecret)
        : false;

      // Also check recovery codes
      const isRecoveryCode = user.twoFactorRecoveryCodes?.includes(validated.twoFactorCode);

      if (!isOtpValid && !isRecoveryCode) {
        return apiResponse.error('Invalid 2FA verification code', 'INVALID_2FA_CODE', 401);
      }

      // If recovery code was used, remove it from list
      if (isRecoveryCode && user.twoFactorRecoveryCodes) {
        const remainingCodes = user.twoFactorRecoveryCodes.filter((c) => c !== validated.twoFactorCode);
        await AuthRepository.updateUser(user.id, { twoFactorRecoveryCodes: remainingCodes });
      }
    }

    // Login successful: Reset rate limits & failed attempts
    RateLimiter.reset(emailKey);
    await AuthRepository.updateUser(user.id, {
      failedLoginAttempts: 0,
      lockoutUntil: null,
      lastLoginAt: new Date().toISOString(),
    });

    // Create session in repository
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

    // Sign JWT session token with session ID included
    const jwtToken = signSessionToken(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isSuperAdmin: user.role === 'SUPER_ADMIN',
        sessionId: sessionRecord.id,
        roles: [user.role],
        permissions:
          user.role === 'SUPER_ADMIN'
            ? ['*']
            : user.role === 'ADMIN'
            ? ['admin:access', 'workspace:all', 'cms:edit']
            : user.role === 'SUPPORT'
            ? ['support:read', 'users:view']
            : ['workspace:personal'],
      },
      validated.rememberMe ? '30d' : '7d'
    );

    // Audit log
    await AuthRepository.logActivity({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
      metadata: { role: user.role, rememberMe: validated.rememberMe },
      ipAddress: ip,
      userAgent,
    });

    // Build response with HTTP-only cookie
    const response = apiResponse.success({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        twoFactorEnabled: user.twoFactorEnabled,
        emailVerified: Boolean(user.emailVerified),
      },
      token: jwtToken,
      expiresAt: expiresAt.toISOString(),
    });

    response.cookies.set(SESSION_COOKIE_NAME, jwtToken, getSessionCookieOptions(validated.rememberMe));
    return response;
  } catch (error) {
    return apiResponse.handle(error, 'Auth Login');
  }
}
