import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { apiResponse } from '@/lib/api-response';
import { requireRole, AuthRepository, UserSystemRole, UserStatus } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const staffUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'SUPPORT']).optional(),
  department: z.string().optional(),
  phone: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED']).optional(),
  password: z.string().min(6).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN']);

    const user = await AuthRepository.findUserById(params.id);
    if (!user) {
      return apiResponse.notFound('Staff member not found');
    }

    const allUsers = await AuthRepository.getAllUsers();
    const fullStaff = allUsers.find((u) => u.id === params.id);

    return apiResponse.success({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      department: fullStaff?.profile?.company || 'Operations',
      phone: fullStaff?.profile?.phone || null,
      country: fullStaff?.profile?.country || null,
      timezone: fullStaff?.profile?.timezone || 'UTC',
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    });
  } catch (error) {
    return apiResponse.handle(error, 'Admin Get Staff Member');
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentSession = await requireRole(['SUPER_ADMIN', 'ADMIN']);

    const targetUser = await AuthRepository.findUserById(params.id);
    if (!targetUser) {
      return apiResponse.notFound('Staff member not found');
    }

    const body = await req.json();
    const parsed = staffUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return apiResponse.badRequest(parsed.error.errors[0]?.message || 'Invalid update payload');
    }

    const validated = parsed.data;

    // Protection for root superadmin
    if (targetUser.id === 'usr_superadmin_01') {
      if (validated.role && validated.role !== 'SUPER_ADMIN') {
        return apiResponse.error('The root Super Admin role cannot be changed.', 'FORBIDDEN', 403);
      }
      if (validated.status && validated.status === 'SUSPENDED') {
        return apiResponse.error('The root Super Admin cannot be suspended.', 'FORBIDDEN', 403);
      }
    }

    // Role elevation safety check
    if (
      (validated.role === 'SUPER_ADMIN' || targetUser.role === 'SUPER_ADMIN') &&
      !currentSession.isSuperAdmin
    ) {
      return apiResponse.error(
        'Only a Super Admin can modify or assign Super Admin privileges.',
        'FORBIDDEN',
        403
      );
    }

    // Check email uniqueness if changing email
    if (validated.email && validated.email.toLowerCase().trim() !== targetUser.email.toLowerCase()) {
      const emailExists = await AuthRepository.findUserByEmail(validated.email);
      if (emailExists) {
        return apiResponse.error('Email is already in use by another account.', 'CONFLICT', 409);
      }
    }

    const updates: Partial<{
      name: string;
      email: string;
      role: UserSystemRole;
      status: UserStatus;
      passwordHash: string;
    }> = {};

    if (validated.name) updates.name = validated.name.trim();
    if (validated.email) updates.email = validated.email.toLowerCase().trim();
    if (validated.role) updates.role = validated.role;
    if (validated.status) updates.status = validated.status as UserStatus;
    if (validated.password) updates.passwordHash = bcrypt.hashSync(validated.password, 12);

    const updatedUser = await AuthRepository.updateUser(params.id, updates);
    if (!updatedUser) {
      return apiResponse.notFound('Staff member not found');
    }

    if (validated.department !== undefined || validated.phone !== undefined) {
      await AuthRepository.updateUserProfile(params.id, {
        company: validated.department?.trim() || 'Platform Staff',
        phone: validated.phone || null,
      });
    }

    await AuthRepository.logActivity({
      userId: currentSession.userId,
      action: 'ADMIN_STAFF_UPDATED',
      entityType: 'User',
      entityId: params.id,
      metadata: {
        updatedStaffId: params.id,
        fieldsChanged: Object.keys(validated),
      },
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent'),
    });

    return apiResponse.success(
      {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        department: validated.department || 'Platform Staff',
        phone: validated.phone || null,
        updatedAt: updatedUser.updatedAt,
      },
      'Staff member updated successfully'
    );
  } catch (error) {
    return apiResponse.handle(error, 'Admin Update Staff');
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentSession = await requireRole(['SUPER_ADMIN', 'ADMIN']);

    if (params.id === 'usr_superadmin_01') {
      return apiResponse.error(
        'The primary Super Admin account is permanently protected and cannot be deleted.',
        'FORBIDDEN',
        403
      );
    }

    if (params.id === currentSession.userId) {
      return apiResponse.error('You cannot delete your own staff account.', 'BAD_REQUEST', 400);
    }

    const targetUser = await AuthRepository.findUserById(params.id);
    if (!targetUser) {
      return apiResponse.notFound('Staff member not found');
    }

    // Only Super Admin can delete another Super Admin or Admin
    if (['SUPER_ADMIN', 'ADMIN'].includes(targetUser.role) && !currentSession.isSuperAdmin) {
      return apiResponse.error(
        'Only a Super Admin can delete administrator-level staff accounts.',
        'FORBIDDEN',
        403
      );
    }

    await AuthRepository.deleteUser(params.id);

    await AuthRepository.logActivity({
      userId: currentSession.userId,
      action: 'ADMIN_STAFF_DELETED',
      entityType: 'User',
      entityId: params.id,
      metadata: {
        deletedStaffId: params.id,
        deletedStaffEmail: targetUser.email,
        deletedStaffRole: targetUser.role,
      },
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent'),
    });

    return apiResponse.success({ deletedId: params.id }, 'Staff member deleted permanently');
  } catch (error) {
    return apiResponse.handle(error, 'Admin Delete Staff');
  }
}
