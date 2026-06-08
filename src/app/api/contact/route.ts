import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp, hashIp } from "@/lib/rateLimit";
import { verifyCsrfToken } from "@/lib/csrf";
import { sendContactNotification, sendAutoReply } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(254),
  subject: z.enum(["Job Opportunity", "Collaboration", "General Inquiry", "Other"]),
  message: z.string().min(10).max(5000),
  website: z.string().max(0, "honeypot").optional(),
  _csrf: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    const limit = await rateLimit(ip, "contact");
    if (!limit.success) {
      const retryAfter = Math.ceil((limit.msBeforeNext ?? 3600000) / 1000);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    const body = await req.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
    }

    const { name, email, subject, message, website, _csrf } = parsed.data;

    if (!verifyCsrfToken(_csrf)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 403 });
    }

    // Honeypot — silently accept but don't process
    if (website && website.length > 0) {
      return NextResponse.json({ ok: true });
    }

    const ipHash = hashIp(ip);

    await prisma.contactSubmission.create({
      data: { name, email, subject, message, ipHash },
    });

    await Promise.allSettled([
      sendContactNotification({ name, email, subject, message }),
      sendAutoReply(email, name),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json(
      { error: "An error occurred. Please email directly at raaghvv0508@gmail.com" },
      { status: 500 }
    );
  }
}
