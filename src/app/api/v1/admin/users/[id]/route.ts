import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { apiResponse } from '@/lib/api-response';
import { requireRole, AuthRepository } from '@/lib/auth';
import { adminUpdateUserSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'SUPPORT']);

    const user = await AuthRepository.findUserById(params.id);
    if (!user) {
      return apiResponse.error('User not found', 'NOT_FOUND', 404);
    }

    const [profile, activity, sessions] = await Promise.all([
      AuthRepository.getUserProfile(user.id),
      AuthRepository.getUserActivity(user.id, 50),
      AuthRepository.getUserSessions(user.id),
    ]);

    return apiResponse.success({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        emailVerified: Boolean(user.emailVerified),
        twoFactorEnabled: user.twoFactorEnabled,
        failedLoginAttempts: user.failedLoginAttempts,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
      profile,
      subscription: {
        plan: user.role === 'SUPER_ADMIN' ? 'Enterprise Staff' : 'Pro Growth Annual',
        status: 'Active',
        renewalDate: '2027-11-09T00:00:00Z',
        maxProfiles: 15,
        usedProfiles: 6,
      },
      sessionsCount: sessions.length,
      activity: activity.slice(0, 20),
    });
  } catch (error) {
    return apiResponse.handle(error, 'Admin Get User Details');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentSession = await requireRole(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json();
    const validated = adminUpdateUserSchema.parse(body);

    const targetUser = await AuthRepository.findUserById(params.id);
    if (!targetUser) {
      return apiResponse.error('Target user not found', 'NOT_FOUND', 404);
    }

    // Role protection: Only Super Admin can change someone to or from SUPER_ADMIN
    if (
      (validated.role === 'SUPER_ADMIN' || targetUser.role === 'SUPER_ADMIN') &&
      !currentSession.isSuperAdmin
    ) {
      return apiResponse.error('Only a Super Admin can modify Super Admin accounts or assign Super Admin roles.', 'FORBIDDEN', 403);
    }

    // Update password hash if provided
    let passwordHash: string | undefined;
    if (validated.password) {
      passwordHash = bcrypt.hashSync(validated.password, 12);
    }

    // Update user record
    const updatedUser = await AuthRepository.updateUser(params.id, {
      ...(validated.name && { name: validated.name }),
      ...(validated.email && { email: validated.email }),
      ...(validated.role && { role: validated.role }),
      ...(validated.status && { status: validated.status }),
      ...(passwordHash && { passwordHash }),
    });

    // Update profile record if phone, country, or timezone given
    if (validated.phone !== undefined || validated.country !== undefined || validated.timezone !== undefined) {
      await AuthRepository.updateUserProfile(params.id, {
        ...(validated.phone !== undefined && { phone: validated.phone }),
        ...(validated.country !== undefined && { country: validated.country }),
        ...(validated.timezone !== undefined && { timezone: validated.timezone }),
      });
    }

    await AuthRepository.logActivity({
      userId: currentSession.userId,
      action: 'ADMIN_USER_UPDATED',
      entityType: 'User',
      entityId: params.id,
      metadata: { targetEmail: targetUser.email, updates: validated },
      userAgent: req.headers.get('user-agent'),
    });

    return apiResponse.success({
      message: 'User details successfully updated.',
      user: updatedUser,
    });
  } catch (error) {
    return apiResponse.handle(error, 'Admin Update User');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentSession = await requireRole(['SUPER_ADMIN', 'ADMIN']);

    const targetUser = await AuthRepository.findUserById(params.id);
    if (!targetUser) {
      return apiResponse.error('Target user not found', 'NOT_FOUND', 404);
    }

    // Protection 1: Cannot delete yourself
    if (currentSession.userId === targetUser.id) {
      return apiResponse.error('You cannot delete your own logged-in account.', 'BAD_REQUEST', 400);
    }

    // Protection 2: Root Super Admin cannot be deleted
    if (targetUser.id === 'usr_superadmin_01' || targetUser.email === 'admin@quickpostly.com' || targetUser.email === 'admin@socialhive.io') {
      return apiResponse.error('The primary root system Super Admin account cannot be deleted.', 'FORBIDDEN', 403);
    }

    // Protection 3: Only Super Admin can delete other admins
    if ((targetUser.role === 'SUPER_ADMIN' || targetUser.role === 'ADMIN') && !currentSession.isSuperAdmin) {
      return apiResponse.error('Only a Super Admin can delete administrator accounts.', 'FORBIDDEN', 403);
    }

    await AuthRepository.deleteUser(params.id);

    await AuthRepository.logActivity({
      userId: currentSession.userId,
      action: 'ADMIN_USER_DELETED',
      entityType: 'User',
      entityId: params.id,
      metadata: { deletedEmail: targetUser.email, deletedName: targetUser.name },
      userAgent: req.headers.get('user-agent'),
    });

    return apiResponse.success({
      id: params.id,
      message: `User ${targetUser.name} (${targetUser.email}) has been permanently deleted.`,
    });
  } catch (error) {
    return apiResponse.handle(error, 'Admin Delete User');
  }
}
