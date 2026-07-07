import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { RATE_LIMIT_PER_HOUR } from "@/lib/config"

let ratelimit: Ratelimit | null = null

function getRatelimit(): Ratelimit {
  if (!ratelimit) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(RATE_LIMIT_PER_HOUR, "1 h"),
      prefix: "catwatch",
    })
  }
  return ratelimit
}

export async function checkRateLimit(identifier: string) {
  return getRatelimit().limit(identifier)
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
