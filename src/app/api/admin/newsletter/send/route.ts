import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { sendMailBatch } from "@/lib/mail";
import { z } from "zod";
import { apiError, withApiErrors, zodMessage } from "@/lib/api";

const sendSchema = z.object({
  subject: z.string().min(1).max(200),
  html: z.string().min(1),
});

async function handlePOST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return apiError(401, "Please sign in again.");

  let body: unknown;
  try { body = await req.json(); } catch { return apiError(400, "The request couldn't be read. Please try again."); }

  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) return apiError(422, zodMessage(parsed.error));

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

export const POST = withApiErrors("POST /api/admin/newsletter/send", handlePOST);
