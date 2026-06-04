import type { RedisLike } from "./types";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

/**
 * Fixed-window rate limiter backed by the shared Redis (Upstash), so we don't
 * need a dedicated dependency. Used to protect the public OTP endpoints from
 * code-spamming (`send-otp`, per-email + per-IP) and passcode brute-forcing
 * (`verify-otp`, per-email).
 *
 * Increments a per-window counter and sets its TTL on first hit; the window
 * resets when the key expires. Fail-open on Redis errors is the caller's choice.
 */
export async function rateLimit(
  redis: RedisLike,
  key: string,
  opts: { limit: number; windowSeconds: number },
): Promise<RateLimitResult> {
  const windowKey = `ratelimit:${key}`;
  const count = await redis.incr(windowKey);
  if (count === 1) {
    await redis.expire(windowKey, opts.windowSeconds);
  }
  return {
    allowed: count <= opts.limit,
    remaining: Math.max(0, opts.limit - count),
  };
}
