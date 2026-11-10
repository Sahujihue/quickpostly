import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { apiResponse } from '@/lib/api-response';
import { requireRole, AuthRepository, UserSystemRole, UserStatus } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const STAFF_ROLES: UserSystemRole[] = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'SUPPORT'];

const staffCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'SUPPORT']),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  department: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(['ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED']).default('ACTIVE'),
});

export async function GET(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN']);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'ALL';
    const status = searchParams.get('status') || 'ALL';

    const allUsers = await AuthRepository.getAllUsers();
    
    // Filter only staff roles
    let staff = allUsers.filter((u) => STAFF_ROLES.includes(u.role as UserSystemRole));

    // Calculate overall statistics before filters
    const stats = {
      totalStaff: staff.length,
      superAdmins: staff.filter((s) => s.role === 'SUPER_ADMIN').length,
      admins: staff.filter((s) => s.role === 'ADMIN').length,
      contentManagers: staff.filter((s) => s.role === 'CONTENT_MANAGER').length,
      support: staff.filter((s) => s.role === 'SUPPORT').length,
      active: staff.filter((s) => s.status === 'ACTIVE').length,
      suspended: staff.filter((s) => s.status === 'SUSPENDED').length,
    };

    // Apply filters
    if (search) {
      const q = search.toLowerCase().trim();
      staff = staff.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.profile?.company && s.profile.company.toLowerCase().includes(q)) ||
          s.role.toLowerCase().includes(q)
      );
    }

    if (role !== 'ALL') {
      staff = staff.filter((s) => s.role === role);
    }

    if (status !== 'ALL') {
      staff = staff.filter((s) => s.status === status);
    }

    // Sanitize sensitive fields
    const safeStaff = staff.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      role: s.role,
      status: s.status,
      emailVerified: s.emailVerified,
      department: s.profile?.company || 'Operations',
      phone: s.profile?.phone || null,
      country: s.profile?.country || null,
      timezone: s.profile?.timezone || 'UTC',
      twoFactorEnabled: s.twoFactorEnabled,
      lastLoginAt: s.lastLoginAt,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      permissions:
        s.role === 'SUPER_ADMIN'
          ? ['* (Full System Access)']
          : s.role === 'ADMIN'
          ? ['User Management', 'Plans & Pricing', 'Subscriptions', 'Gateways', 'AI Config']
          : s.role === 'CONTENT_MANAGER'
          ? ['CMS & Website Builder', 'Blog Management', 'Custom Pages', 'Media Library']
          : ['Customer Tickets', 'Social Inbox Monitoring', 'User Read-Only'],
    }));

    return apiResponse.success({ staff: safeStaff, stats });
  } catch (error) {
    return apiResponse.handle(error, 'Admin Get Staff List');
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentSession = await requireRole(['SUPER_ADMIN', 'ADMIN']);

    const body = await req.json();
    const parsed = staffCreateSchema.safeParse(body);

    if (!parsed.success) {
      return apiResponse.badRequest(parsed.error.errors[0]?.message || 'Invalid input data');
    }

    const validated = parsed.data;

    // Privilege check: Only a Super Admin can create a Super Admin account
    if (validated.role === 'SUPER_ADMIN' && !currentSession.isSuperAdmin) {
      return apiResponse.error('Only a Super Admin can assign the Super Admin role.', 'FORBIDDEN', 403);
    }

    // Check duplicate email
    const existing = await AuthRepository.findUserByEmail(validated.email);
    if (existing) {
      return apiResponse.error('A user account with this email address already exists.', 'CONFLICT', 409);
    }

    const passwordHash = bcrypt.hashSync(validated.password, 12);
    const newUser = await AuthRepository.createUser({
      name: validated.name,
      email: validated.email.toLowerCase().trim(),
      passwordHash,
      role: validated.role,
      status: validated.status as UserStatus,
      emailVerified: validated.status === 'ACTIVE' ? new Date().toISOString() : null,
    });

    // Update staff profile with department and phone
    await AuthRepository.updateUserProfile(newUser.id, {
      company: validated.department?.trim() || 'Platform Staff',
      phone: validated.phone?.trim() || null,
      bio: `QuickPostly Staff Member (${validated.role})`,
    });

    await AuthRepository.logActivity({
      userId: currentSession.userId,
      action: 'ADMIN_STAFF_CREATED',
      entityType: 'User',
      entityId: newUser.id,
      metadata: {
        createdStaffId: newUser.id,
        createdStaffEmail: newUser.email,
        assignedRole: validated.role,
        department: validated.department || 'Platform Staff',
      },
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent'),
    });

    return apiResponse.created(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        department: validated.department || 'Platform Staff',
        phone: validated.phone || null,
        createdAt: newUser.createdAt,
      },
      { message: 'Staff member created successfully' }
    );
  } catch (error) {
    return apiResponse.handle(error, 'Admin Create Staff');
  }
}
