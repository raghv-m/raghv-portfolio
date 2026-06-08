import { RateLimiterMemory } from "rate-limiter-flexible";
import { createHmac } from "crypto";

const limiters: Record<string, RateLimiterMemory> = {};

function getLimiter(key: string, points: number, duration: number) {
  if (!limiters[key]) {
    limiters[key] = new RateLimiterMemory({ points, duration });
  }
  return limiters[key];
}

export async function rateLimit(
  ip: string,
  route: "contact" | "posts" | "admin",
): Promise<{ success: boolean; msBeforeNext?: number }> {
  const configs = {
    contact: { points: 3, duration: 3600 },   // 3/hour
    posts:   { points: 100, duration: 60 },   // 100/min
    admin:   { points: 20, duration: 60 },    // 20/min
  };

  const { points, duration } = configs[route];
  const limiter = getLimiter(route, points, duration);

  try {
    await limiter.consume(ip);
    return { success: true };
  } catch (e: unknown) {
    const err = e as { msBeforeNext?: number };
    return { success: false, msBeforeNext: err?.msBeforeNext };
  }
}

export function getClientIp(req: Request): string {
  const headers = req instanceof Request ? req.headers : new Headers();
  return (
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
