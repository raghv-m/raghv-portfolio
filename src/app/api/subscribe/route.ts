import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendMail } from "@/lib/mail";

const subscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().max(100).optional(),
  website: z.string().max(0, "honeypot").optional(), // honeypot
});

export async function POST(req: NextRequest) {
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

  await sendMail({
    to: email,
    subject: "Welcome to Raghav's Cyber Daily",
    html: `
      <div style="font-family:monospace;max-width:520px;margin:0 auto;background:#0a0a0a;color:#e0e0e0;padding:32px;border-radius:12px;border:1px solid rgba(212,160,23,0.2)">
        <p style="color:#d4a017;font-size:20px;font-weight:700;margin:0 0 16px">Raghav's Cyber Daily</p>
        <p style="margin:0 0 12px">Hey${name ? ` ${name}` : ""},</p>
        <p style="margin:0 0 12px">You're in. I'll send you writeups, homelab experiments, and notes on breaking into offensive security — no fluff, no spam.</p>
        <p style="margin:0 0 24px">First issue lands when something worth reading is ready.</p>
        <p style="font-size:12px;color:#666;margin:0">Don't want emails? <a href="${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?token=${subscriber.unsubscribeToken}" style="color:#d4a017">Unsubscribe here</a></p>
      </div>
    `,
  }).catch(() => {}); // fire-and-forget

  return NextResponse.json({ ok: true });
}
