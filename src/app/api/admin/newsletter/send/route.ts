import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { sendMailBatch } from "@/lib/mail";
import { z } from "zod";

const sendSchema = z.object({
  subject: z.string().min(1).max(200),
  html: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const subscribers = await prisma.subscriber.findMany({ where: { active: true }, select: { email: true, name: true, unsubscribeToken: true } });
  if (subscribers.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";

  const items = subscribers.map((sub) => {
    const unsubLink = `${baseUrl}/unsubscribe?token=${sub.unsubscribeToken}`;
    const footer = `<p style="font-size:11px;color:#555;margin-top:32px;border-top:1px solid #222;padding-top:16px">You're receiving this because you subscribed to Raghav's Cyber Daily. <a href="${unsubLink}" style="color:#d4a017">Unsubscribe</a></p>`;
    return { to: sub.email, subject: parsed.data.subject, html: parsed.data.html + footer };
  });

  const { sent, errors } = await sendMailBatch(items);

  return NextResponse.json({
    ok: true,
    sent,
    total: subscribers.length,
    errors: errors.map((e) => `${e.to}: ${e.error}`),
  });
}
