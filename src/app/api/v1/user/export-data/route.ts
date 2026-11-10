import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthRepository } from '@/lib/auth';
import { apiResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await requireAuth();

    const [user, profile, activity, sessions] = await Promise.all([
      AuthRepository.findUserById(session.userId),
      AuthRepository.getUserProfile(session.userId),
      AuthRepository.getUserActivity(session.userId, 200),
      AuthRepository.getUserSessions(session.userId),
    ]);

    if (!user) {
      return apiResponse.error('User not found', 'NOT_FOUND', 404);
    }

    const exportPayload = {
      platform: 'SocialHive SaaS',
      exportDate: new Date().toISOString(),
      subject: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
      profile,
      activeSessions: sessions.map((s) => ({
        device: s.deviceInfo,
        ipAddress: s.ipAddress,
        createdAt: s.createdAt,
        lastActiveAt: s.lastActiveAt,
      })),
      activityAuditTrail: activity.map((a) => ({
        action: a.action,
        entityType: a.entityType,
        ipAddress: a.ipAddress,
        timestamp: a.createdAt,
      })),
    };

    const jsonString = JSON.stringify(exportPayload, null, 2);

    return new NextResponse(jsonString, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="socialhive-data-export-${user.id}.json"`,
      },
    });
  } catch (error) {
    return apiResponse.handle(error, 'Export Personal Data');
  }
}
