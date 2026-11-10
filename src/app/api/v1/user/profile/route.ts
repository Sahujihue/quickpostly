import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { requireAuth, AuthRepository } from '@/lib/auth';
import { updateProfileSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await requireAuth();
    const user = await AuthRepository.findUserById(session.userId);
    if (!user) {
      return apiResponse.error('User not found', 'USER_NOT_FOUND', 404);
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
        twoFactorEnabled: user.twoFactorEnabled,
        emailVerified: Boolean(user.emailVerified),
        createdAt: user.createdAt,
      },
      profile,
    });
  } catch (error) {
    return apiResponse.handle(error, 'Get Profile');
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const validated = updateProfileSchema.parse(body);

    // Update name on user record
    await AuthRepository.updateUser(session.userId, {
      name: validated.name,
      image: validated.avatarUrl || null,
    });

    // Update profile record
    const updatedProfile = await AuthRepository.updateUserProfile(session.userId, {
      bio: validated.bio || null,
      company: validated.company || null,
      phone: validated.phone || null,
      country: validated.country || null,
      timezone: validated.timezone,
      language: validated.language,
      currency: validated.currency,
      avatarUrl: validated.avatarUrl || null,
    });

    await AuthRepository.logActivity({
      userId: session.userId,
      action: 'PROFILE_UPDATED',
      entityType: 'UserProfile',
      entityId: session.userId,
      userAgent: req.headers.get('user-agent'),
    });

    return apiResponse.success({
      message: 'Profile updated successfully.',
      profile: updatedProfile,
    });
  } catch (error) {
    return apiResponse.handle(error, 'Update Profile');
  }
}
