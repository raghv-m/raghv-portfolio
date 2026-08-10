import { RateLimiterMemory } from "rate-limiter-flexible";
import { createHmac } from "crypto";
import type { Duration } from "@upstash/ratelimit";

export type Route = "contact" | "subscribe" | "posts" | "admin" | "login";

const CONFIGS: Record<Route, { points: number; duration: number; upstashWindow: Duration }> = {
  contact:   { points: 3,   duration: 3600, upstashWindow: "1 h"  },
  subscribe: { points: 5,   duration: 3600, upstashWindow: "1 h"  },
  posts:     { points: 100, duration: 60,   upstashWindow: "1 m"  },
  admin:     { points: 20,  duration: 60,   upstashWindow: "1 m"  },
  login:     { points: 5,   duration: 900,  upstashWindow: "15 m" },
};

// ── In-memory fallback (dev / single-instance deploys) ──────────────────────
const memLimiters: Partial<Record<Route, RateLimiterMemory>> = {};

function getMemLimiter(route: Route): RateLimiterMemory {
  if (!memLimiters[route]) {
    const { points, duration } = CONFIGS[route];
    memLimiters[route] = new RateLimiterMemory({ points, duration });
  }
  return memLimiters[route]!;
}

// ── Upstash Redis (survives serverless cold starts) ──────────────────────────
interface UpstashLimiter {
  limit(key: string): Promise<{ success: boolean; reset: number }>;
}
const upstashCache: Partial<Record<Route, UpstashLimiter>> = {};

async function getUpstashLimiter(route: Route): Promise<UpstashLimiter> {
  if (!upstashCache[route]) {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");
    const { points, upstashWindow } = CONFIGS[route];
    upstashCache[route] = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(points, upstashWindow),
      prefix: `rl:${route}`,
    }) as UpstashLimiter;
  }
  return upstashCache[route]!;
}

// ── Public API ───────────────────────────────────────────────────────────────
export async function rateLimit(
  key: string,
  route: Route,
): Promise<{ success: boolean; msBeforeNext?: number }> {
  const hasUpstash = !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );

  if (hasUpstash) {
    try {
      const limiter = await getUpstashLimiter(route);
      const { success, reset } = await limiter.limit(key);
      return { success, msBeforeNext: success ? undefined : Math.max(0, reset - Date.now()) };
    } catch (e) {
      console.error("[rateLimit] Upstash error, falling back to memory:", e);
    }
  }

  // Memory fallback
  const limiter = getMemLimiter(route);
  try {
    await limiter.consume(key);
    return { success: true };
  } catch (e: unknown) {
    const err = e as { msBeforeNext?: number };
    return { success: false, msBeforeNext: err?.msBeforeNext };
  }
}

export function getClientIp(req: Request): string {
  const headers = req instanceof Request ? req.headers : new Headers();
  // x-vercel-forwarded-for is set by Vercel's edge network from the actual TCP
  // connection and cannot be spoofed by the client, unlike x-forwarded-for,
  // which client requests can supply arbitrary values for.
  return (
    headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT;
  if (!salt) {
    if (process.env.NODE_ENV === "production") throw new Error("IP_HASH_SALT must be set in production");
    console.warn("[rateLimit] IP_HASH_SALT not set — using dev fallback");
  }
  return createHmac("sha256", salt ?? "dev-insecure-fallback").update(ip).digest("hex");
}
