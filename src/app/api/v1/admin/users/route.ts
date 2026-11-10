import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { apiResponse } from '@/lib/api-response';
import { requireRole, AuthRepository } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Valid email address required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'USER']).default('USER'),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']).default('ACTIVE'),
  phone: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  timezone: z.string().optional().default('UTC'),
});

export async function GET(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'SUPPORT']);

    const url = new URL(req.url);
    const search = url.searchParams.get('search') || undefined;
    const role = url.searchParams.get('role') || undefined;
    const status = url.searchParams.get('status') || undefined;
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);

    const users = await AuthRepository.getAllUsers({ search, role, status });

    const total = users.length;
    const startIndex = (page - 1) * limit;
    const paginated = users.slice(startIndex, startIndex + limit).map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      emailVerified: Boolean(u.emailVerified),
      twoFactorEnabled: u.twoFactorEnabled,
      phone: u.profile?.phone || null,
      country: u.profile?.country || null,
      timezone: u.profile?.timezone || 'UTC',
      plan: u.role === 'SUPER_ADMIN' ? 'ENTERPRISE' : u.role === 'ADMIN' ? 'AGENCY' : 'PRO',
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
    }));

    return apiResponse.paginated(paginated, page, limit, total);
  } catch (error) {
    return apiResponse.handle(error, 'Admin Get Users');
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentSession = await requireRole(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json();
    const validated = createUserSchema.parse(body);

    // Permission check
    if (validated.role === 'SUPER_ADMIN' && !currentSession.isSuperAdmin) {
      return apiResponse.error('Only a Super Admin can create accounts with the Super Admin role.', 'FORBIDDEN', 403);
    }

    // Check duplicate email
    const existing = await AuthRepository.findUserByEmail(validated.email);
    if (existing) {
      return apiResponse.error('A user account with this email already exists.', 'CONFLICT', 409);
    }

    const passwordHash = bcrypt.hashSync(validated.password, 12);
    const newUser = await AuthRepository.createUser({
      name: validated.name,
      email: validated.email.toLowerCase().trim(),
      passwordHash,
      role: validated.role,
      status: validated.status,
      emailVerified: validated.status === 'ACTIVE' ? new Date().toISOString() : null,
    });

    if (validated.phone || validated.country || validated.timezone) {
      await AuthRepository.updateUserProfile(newUser.id, {
        phone: validated.phone || null,
        country: validated.country || null,
        timezone: validated.timezone || 'UTC',
      });
    }

    await AuthRepository.logActivity({
      userId: currentSession.userId,
      action: 'ADMIN_USER_CREATED',
      entityType: 'User',
      entityId: newUser.id,
      metadata: { createdEmail: newUser.email, role: newUser.role },
      userAgent: req.headers.get('user-agent'),
    });

    return apiResponse.success(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      },
      'User account created successfully.',
      201
    );
  } catch (error) {
    return apiResponse.handle(error, 'Admin Create User');
  }
}
