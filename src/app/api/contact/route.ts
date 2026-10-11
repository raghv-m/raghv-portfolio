import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp, hashIp } from "@/lib/rateLimit";
import { verifyCsrfToken } from "@/lib/csrf";
import { sendContactNotification, sendAutoReply } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { apiError, withApiErrors } from "@/lib/api";

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(254),
  subject: z.enum(["Job Opportunity", "Collaboration", "General Inquiry", "Other"]),
  message: z.string().min(10).max(5000),
  website: z.string().max(0, "honeypot").optional(),
  _csrf: z.string().min(1),
});

async function handlePOST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    const limit = await rateLimit(ip, "contact");
    if (!limit.success) {
      const retryAfter = Math.ceil((limit.msBeforeNext ?? 3600000) / 1000);
      return apiError(429, "Too many requests. Please wait a bit and try again.", { "Retry-After": String(retryAfter) });
    }

    const body = await req.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(400, "Please check the form and try again.");
    }

    const { name, email, subject, message, website, _csrf } = parsed.data;

    // Double-submit cookie check: body token must match the cookie value
    const cookieCsrf = req.cookies.get("csrf")?.value;
    if (!cookieCsrf || cookieCsrf !== _csrf || !verifyCsrfToken(_csrf)) {
      return apiError(403, "Your session expired. Refresh the page and try again.");
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
    return apiError(500, "An error occurred. Please email directly at raaghvv0508@gmail.com");
  }
}

export const POST = withApiErrors("POST /api/contact", handlePOST);
