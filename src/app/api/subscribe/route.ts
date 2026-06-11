import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendWelcomeEmail } from "@/lib/mail";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

const subscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().max(100).optional(),
  website: z.string().max(0, "honeypot").optional(), // honeypot
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = await rateLimit(ip, "subscribe");
  if (!limit.success) {
    const retryAfter = Math.ceil((limit.msBeforeNext ?? 3600000) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 422 });

  if (parsed.data.website) return NextResponse.json({ ok: true }); // honeypot

  const { email, name } = parsed.data;

  const existing = await prisma.subscriber.findUnique({ where: { email } });
  if (existing) {
    if (existing.active) return NextResponse.json({ ok: true, message: "Already subscribed" });
    await prisma.subscriber.update({ where: { email }, data: { active: true } });
    return NextResponse.json({ ok: true });
  }

  const subscriber = await prisma.subscriber.create({ data: { email, name } });

  sendWelcomeEmail(email, name ?? null, subscriber.unsubscribeToken).catch(() => {});

  return NextResponse.json({ ok: true });
}
