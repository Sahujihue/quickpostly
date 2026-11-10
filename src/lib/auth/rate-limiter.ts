interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfterSeconds?: number;
}

interface MemoryStoreRecord {
  count: number;
  resetAt: number;
}

// In-memory bucket cache (fast fallback & complement to DB)
const rateLimitCache = new Map<string, MemoryStoreRecord>();

export class RateLimiter {
  /**
   * Check rate limit for a specific action key
   * @param key Unique identifier (e.g. `login:ip:1.2.3.4` or `login:email:user@domain.com`)
   * @param maxAttempts Max allowed hits within window
   * @param windowSeconds Window length in seconds (e.g. 900 for 15 mins)
   */
  public static check(key: string, maxAttempts = 5, windowSeconds = 900): RateLimitResult {
    const now = Date.now();
    const existing = rateLimitCache.get(key);

    if (!existing || existing.resetAt <= now) {
      const resetAt = now + windowSeconds * 1000;
      rateLimitCache.set(key, { count: 1, resetAt });
      return {
        allowed: true,
        remaining: maxAttempts - 1,
        resetAt: new Date(resetAt),
      };
    }

    if (existing.count >= maxAttempts) {
      const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(existing.resetAt),
        retryAfterSeconds,
      };
    }

    existing.count += 1;
    rateLimitCache.set(key, existing);

    return {
      allowed: true,
      remaining: maxAttempts - existing.count,
      resetAt: new Date(existing.resetAt),
    };
  }

  public static reset(key: string): void {
    rateLimitCache.delete(key);
  }
}
