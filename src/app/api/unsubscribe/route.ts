import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/", req.url));

  const sub = await prisma.subscriber.findUnique({ where: { unsubscribeToken: token } });
  if (!sub) return NextResponse.redirect(new URL("/unsubscribe?status=notfound", req.url));

  await prisma.subscriber.update({ where: { id: sub.id }, data: { active: false } });
  return NextResponse.redirect(new URL("/unsubscribe?status=done", req.url));
}
