import { checkDatabaseConnection } from '@/lib/prisma';
import { checkRedisConnection } from '@/lib/redis';
import { apiResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [dbStatus, redisStatus] = await Promise.all([
    checkDatabaseConnection(),
    checkRedisConnection(),
  ]);

  const healthy = dbStatus.connected || redisStatus.connected;

  return apiResponse.success(
    {
      status: healthy ? 'operational' : 'degraded',
      service: 'QuickPostly Core SaaS API',
      timestamp: new Date().toISOString(),
      dependencies: {
        database: {
          status: dbStatus.connected ? 'connected' : 'pending_migrations_or_offline',
          latencyMs: dbStatus.latencyMs,
          error: dbStatus.error,
        },
        redis: {
          status: redisStatus.connected ? 'connected' : 'offline_or_degraded',
          latencyMs: redisStatus.latencyMs,
          error: redisStatus.error,
        },
      },
      environment: process.env.NODE_ENV,
      version: '1.0.0',
    },
    200
  );
}
