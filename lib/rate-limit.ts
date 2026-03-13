import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Global rate limit: 100 requests per 15 minutes per IP
export const globalRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '15 m'),
  prefix: 'anchor:global',
});

// Re-export redis for other uses (cron dedup, etc.)
export { redis };
