import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import {
  getServerSession,
  AuthRepository,
  SESSION_COOKIE_NAME,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (session) {
      if (session.sessionId) {
        await AuthRepository.revokeSession(session.sessionId);
      }

      await AuthRepository.logActivity({
        userId: session.userId,
        action: 'USER_LOGOUT',
        entityType: 'User',
        entityId: session.userId,
        userAgent: req.headers.get('user-agent'),
      });
    }

    const response = apiResponse.success({
      message: 'Logged out successfully.',
    });

    // Clear HTTP-only session cookie
    response.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    return apiResponse.handle(error, 'Auth Logout');
  }
}
