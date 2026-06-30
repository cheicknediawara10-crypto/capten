import { Redis } from '@upstash/redis';

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// Memory cache fallback (for local/demo without Upstash environment variables)
const localCache = new Map<string, { count: number; expiresAt: number }>();

/**
 * Basic rate-limiter for serverless routes.
 * Key can be an IP address, user email, or combined action key.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const now = Math.floor(Date.now() / 1000);
  
  if (redis) {
    try {
      const redisKey = `ratelimit:${key}`;
      const current = await redis.get<number>(redisKey);
      
      if (current !== null && current >= limit) {
        const ttl = await redis.ttl(redisKey);
        return {
          success: false,
          limit,
          remaining: 0,
          reset: now + (ttl > 0 ? ttl : windowSeconds)
        };
      }
      
      const p = redis.pipeline();
      p.incr(redisKey);
      p.expire(redisKey, windowSeconds);
      const results = await p.exec();
      const count = results[0] as number;
      
      return {
        success: count <= limit,
        limit,
        remaining: Math.max(0, limit - count),
        reset: now + windowSeconds
      };
    } catch (err) {
      console.error("Upstash Redis error, falling back to local memory cache:", err);
    }
  }

  // Fallback to ephemeral memory cache
  const cached = localCache.get(key);
  if (cached && cached.expiresAt > now) {
    if (cached.count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: cached.expiresAt
      };
    }
    cached.count += 1;
    return {
      success: true,
      limit,
      remaining: limit - cached.count,
      reset: cached.expiresAt
    };
  } else {
    const expiresAt = now + windowSeconds;
    localCache.set(key, { count: 1, expiresAt });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: expiresAt
    };
  }
}
