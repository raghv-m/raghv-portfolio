import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: redirect to the confirmation page — do NOT perform the unsubscribe.
// Mail security scanners and prefetchers follow GET links, which would silently
// unsubscribe users who never clicked. The actual action requires a POST.
export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/unsubscribe?status=invalid", req.url));
  return NextResponse.redirect(new URL(`/unsubscribe?token=${encodeURIComponent(token)}`, req.url));
}

// POST: performs the unsubscribe. Called from the confirmation form on /unsubscribe.
export async function POST(req: NextRequest) {
  let token: string | null = null;
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await req.formData();
    token = form.get("token") as string | null;
  } else {
    try {
      const body = await req.json();
      token = body?.token ?? null;
    } catch {
      token = null;
    }
  }

  if (!token) return NextResponse.redirect(new URL("/unsubscribe?status=invalid", req.url));

  const sub = await prisma.subscriber.findUnique({ where: { unsubscribeToken: token } });
  if (!sub) return NextResponse.redirect(new URL("/unsubscribe?status=notfound", req.url));

  await prisma.subscriber.update({ where: { id: sub.id }, data: { active: false } });
  return NextResponse.redirect(new URL("/unsubscribe?status=done", req.url));
}
