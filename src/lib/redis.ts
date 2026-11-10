import Redis, { RedisOptions } from 'ioredis';
import { logger } from './logger';

declare global {
  // eslint-disable-next-line no-var
  var redisGlobal: Redis | undefined;
}

const getRedisUrl = (): string => {
  return process.env.REDIS_URL || 'redis://localhost:6379';
};

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  retryStrategy(times) {
    // Graceful reconnect backoff, max 10s delay
    const delay = Math.min(times * 200, 10000);
    return delay;
  },
  lazyConnect: true,
};

export const createRedisClient = (): Redis => {
  const client = new Redis(getRedisUrl(), redisOptions);

  client.on('connect', () => {
    logger.info('Redis connection initiated');
  });

  client.on('ready', () => {
    logger.info('Redis client connected and ready');
  });

  client.on('error', (err) => {
    // Prevent unhandled errors when local Redis is not running
    logger.warn('Redis connection issue (queues will operate in degraded/offline mode):', {
      error: err.message,
    });
  });

  return client;
};

export const redis = globalThis.redisGlobal ?? createRedisClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.redisGlobal = redis;
}

/**
 * Check if Redis is live and responding
 */
export async function checkRedisConnection(): Promise<{ connected: boolean; latencyMs?: number; error?: string }> {
  const start = Date.now();
  try {
    const pingPromise = (async () => {
      if (redis.status !== 'ready' && redis.status !== 'connecting' && redis.status !== 'connect') {
        await redis.connect().catch(() => {});
      }
      return redis.ping();
    })();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Redis connection timed out')), 2000)
    );

    const ping = await Promise.race([pingPromise, timeoutPromise]);
    return {
      connected: ping === 'PONG',
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Redis unreachable';
    return {
      connected: false,
      error: message,
    };
  }
}
