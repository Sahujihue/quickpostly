import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import {
  requireAuth,
  AuthRepository,
  verifyPassword,
  SESSION_COOKIE_NAME,
} from '@/lib/auth';
import { deleteAccountSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const validated = deleteAccountSchema.parse(body);

    const user = await AuthRepository.findUserById(session.userId);
    if (!user) {
      return apiResponse.error('User not found', 'NOT_FOUND', 404);
    }

    // Protect Super Admin from self-deletion
    if (user.role === 'SUPER_ADMIN') {
      return apiResponse.error('The primary Super Admin account cannot be deleted.', 'FORBIDDEN', 403);
    }

    // Verify password with bcrypt
    const isPasswordValid = await verifyPassword(validated.password, user.passwordHash);
    if (!isPasswordValid) {
      return apiResponse.error('Incorrect password. Account deletion aborted.', 'INCORRECT_PASSWORD', 400);
    }

    // Delete user and associated records
    await AuthRepository.deleteUser(session.userId);

    const response = apiResponse.success({
      message: 'Your account and personal data have been permanently removed.',
    });

    // Clear session cookie
    response.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    return apiResponse.handle(error, 'Delete Account');
  }
}
