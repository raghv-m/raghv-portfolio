import { after, NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendWelcomeEmail } from "@/lib/mail";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { apiError, withApiErrors } from "@/lib/api";

const subscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().max(100).optional(),
  website: z.string().max(0, "honeypot").optional(), // honeypot
});

async function handlePOST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = await rateLimit(ip, "subscribe");
  if (!limit.success) {
    const retryAfter = Math.ceil((limit.msBeforeNext ?? 3600000) / 1000);
    return apiError(429, "Too many requests. Please wait a bit and try again.", { "Retry-After": String(retryAfter) });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return apiError(400, "The request couldn't be read. Please try again."); }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) return apiError(422, "Enter a valid email address.");

  if (parsed.data.website) return NextResponse.json({ ok: true }); // honeypot

  const { email, name } = parsed.data;

  const existing = await prisma.subscriber.findUnique({ where: { email } });
  if (existing) {
    if (!existing.active) {
      await prisma.subscriber.update({ where: { email }, data: { active: true } });
    }
    // Return identical response regardless of existing/new to prevent email enumeration
    return NextResponse.json({ ok: true });
  }

  const subscriber = await prisma.subscriber.create({ data: { email, name } });

  // after(): runs once the response is sent, and Vercel keeps the function alive until it
  // finishes. A bare un-awaited promise can be frozen mid-send, so emails silently never go out.
  after(() => sendWelcomeEmail(email, name ?? null, subscriber.unsubscribeToken).catch((error) => console.error("[subscribe] welcome email failed", error)));

  return NextResponse.json({ ok: true });
}

export const POST = withApiErrors("POST /api/subscribe", handlePOST);
