import { randomBytes, createHmac, timingSafeEqual } from "crypto";

export function generateCsrfToken(): string {
  const secret = process.env.CSRF_SECRET;
  if (!secret) throw new Error("CSRF_SECRET must be set");
  const token = randomBytes(32).toString("hex");
  const sig = createHmac("sha256", secret).update(token).digest("hex");
  return `${token}.${sig}`;
}

export function verifyCsrfToken(tokenWithSig: string): boolean {
  const secret = process.env.CSRF_SECRET;
  if (!secret) return false;
  const dot = tokenWithSig.lastIndexOf(".");
  if (dot === -1) return false;
  const token = tokenWithSig.slice(0, dot);
  const sig = tokenWithSig.slice(dot + 1);
  const expected = createHmac("sha256", secret).update(token).digest("hex");
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
