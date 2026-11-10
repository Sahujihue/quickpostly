import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

const createPrismaClient = () => {
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'stdout', level: 'error' },
            { emit: 'stdout', level: 'warn' },
          ]
        : [{ emit: 'stdout', level: 'error' }],
  });

  if (process.env.NODE_ENV === 'development') {
    (client as any).$on('query', (e: { query: string; duration: number }) => {
      if (process.env.LOG_LEVEL === 'debug') {
        logger.debug(`Prisma Query (${e.duration}ms): ${e.query}`);
      }
    });
  }

  return client;
};

export const prisma = globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

/**
 * Health check helper for database connectivity
 */
export async function checkDatabaseConnection(): Promise<{ connected: boolean; latencyMs?: number; error?: string }> {
  const start = Date.now();
  try {
    const queryPromise = prisma.$queryRaw`SELECT 1`;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Database connection timed out')), 2000)
    );
    await Promise.race([queryPromise, timeoutPromise]);
    return {
      connected: true,
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    logger.warn('Database connection check failed (migrations or PostgreSQL may be offline):', { error: message });
    return {
      connected: false,
      error: message,
    };
  }
}
