import { randomBytes, createHmac, timingSafeEqual } from "crypto";

// Token format: {timestamp}.{rand}.{hmac(timestamp.rand)}
// Expires after 1 hour; binding to a same-site cookie prevents pre-fetched reuse.

export function generateCsrfToken(): string {
  const secret = process.env.CSRF_SECRET;
  if (!secret) throw new Error("CSRF_SECRET must be set");
  const ts = Date.now();
  const rand = randomBytes(32).toString("hex");
  const payload = `${ts}.${rand}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyCsrfToken(tokenWithSig: string): boolean {
  const secret = process.env.CSRF_SECRET;
  if (!secret) return false;
  const lastDot = tokenWithSig.lastIndexOf(".");
  if (lastDot === -1) return false;
  const payload = tokenWithSig.slice(0, lastDot);
  const sig = tokenWithSig.slice(lastDot + 1);
  const firstDot = payload.indexOf(".");
  if (firstDot === -1) return false;
  const ts = parseInt(payload.slice(0, firstDot), 10);
  if (isNaN(ts) || Date.now() - ts > 3_600_000) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
