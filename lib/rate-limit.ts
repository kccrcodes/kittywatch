import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { RATE_LIMIT_PER_HOUR } from "@/lib/config"

let ratelimit: Ratelimit | null = null

function getRatelimit(): Ratelimit | null {
  // Without creds the Redis client throws on first use, 500-ing every
  // write endpoint - handle "unconfigured" explicitly instead.
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  if (!ratelimit) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(RATE_LIMIT_PER_HOUR, "1 h"),
      prefix: "catwatch",
    })
  }
  return ratelimit
}

export async function checkRateLimit(identifier: string): Promise<{ success: boolean }> {
  const limiter = getRatelimit()
  if (!limiter) {
    // Fail closed in production (an unconfigured limiter must not mean
    // unlimited writes - same philosophy as run-check's token gate), but
    // let local dev without Upstash creds keep working, loudly.
    if (process.env.NODE_ENV === "production") return { success: false }
    console.warn(
      "[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN not set - skipping rate limit in dev"
    )
    return { success: true }
  }
  return limiter.limit(identifier)
}

/**
 * Real auth is deferred (docs/SPEC.md: hardcoded demo user/device id for the
 * hackathon), so there's no user id to key rate limiting on yet. Client IP
 * is the best available anonymous identifier until the frontend sends a
 * real device id - x-forwarded-for is set reliably by Vercel.
 */
export function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) return forwardedFor.split(",")[0].trim()
  return request.headers.get("x-real-ip") ?? "unknown"
}
