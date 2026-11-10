import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { getServerSession, AuthRepository } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return apiResponse.error('Not authenticated', 'UNAUTHORIZED', 401);
    }

    const user = await AuthRepository.findUserById(session.userId);
    if (!user) {
      return apiResponse.error('User not found', 'NOT_FOUND', 404);
    }

    const profile = await AuthRepository.getUserProfile(session.userId);

    return apiResponse.success({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        image: user.image,
        emailVerified: Boolean(user.emailVerified),
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
      },
      profile,
      permissions: session.permissions,
      isSuperAdmin: session.isSuperAdmin,
    });
  } catch (error) {
    return apiResponse.handle(error, 'Auth Me');
  }
}
