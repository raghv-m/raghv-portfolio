import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/).optional(),
  excerpt: z.string().min(1).max(500).optional(),
  content: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  coverImage: z.string().url().startsWith("https://").optional().nullable().or(z.literal("").transform(() => null)),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  readTime: z.number().int().min(1).optional().nullable(),
  notifySubscribers: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = getClientIp(req);
  const limit = await rateLimit(ip, "admin");
  if (!limit.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.msBeforeNext ?? 60000) / 1000)) } }
    );
  }

  const { id } = await params;

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { tags, notifySubscribers, ...rest } = parsed.data;
  const data: Record<string, unknown> = { ...rest };
  if (tags !== undefined) data.tags = JSON.stringify(tags);
  if (notifySubscribers !== undefined) data.notifySubscribers = notifySubscribers;
  if (rest.coverImage === undefined) delete data.coverImage;
  if (rest.readTime === undefined) delete data.readTime;

  const post = await prisma.post.update({ where: { id }, data });

  // Notify if just published with notifySubscribers flag
  const justPublished = !existing.published && post.published;
  if (justPublished && post.notifySubscribers) {
    notifySubscribersAboutPost(post).catch((e) => console.error("[notify-subscribers]", e));
  }

  return NextResponse.json(post);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = getClientIp(req);
  const limit = await rateLimit(ip, "admin");
  if (!limit.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.msBeforeNext ?? 60000) / 1000)) } }
    );
  }

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

async function notifySubscribersAboutPost(post: { title: string; slug: string; excerpt: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://raghv.dev";
  const subscribers = await prisma.subscriber.findMany({
    where: { active: true },
    select: { email: true, name: true, unsubscribeToken: true },
  });
  if (subscribers.length === 0) return;

  const { sendMail } = await import("@/lib/mail");

  for (const sub of subscribers) {
    const unsubLink = `${baseUrl}/unsubscribe?token=${sub.unsubscribeToken}`;
    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:auto;background:#0a0a0a;color:#e8e8e8;border-radius:12px;border:1px solid #222;overflow:hidden;">
        <div style="padding:28px;border-bottom:1px solid #222;">
          <p style="margin:0 0 6px;font-family:monospace;font-size:10px;color:#d4a017;letter-spacing:.15em;text-transform:uppercase;">New Post</p>
          <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;">${post.title}</h1>
          <p style="margin:0 0 20px;font-size:14px;color:#888;line-height:1.7;">${post.excerpt}</p>
          <a href="${baseUrl}/blog/${post.slug}" style="display:inline-block;padding:10px 22px;border:1px solid #d4a017;border-radius:4px;font-size:12px;color:#d4a017;text-decoration:none;letter-spacing:.08em;text-transform:uppercase;">Read Post →</a>
        </div>
        <div style="padding:16px 28px;background:#0a0a0a;">
          <p style="margin:0;font-size:11px;color:#444;">You&apos;re subscribed to Raghav&apos;s Cyber Daily. <a href="${unsubLink}" style="color:#555;">Unsubscribe</a></p>
        </div>
      </div>
    `;
    try {
      await sendMail({ to: sub.email, subject: `New Post: ${post.title}`, html });
    } catch (e) {
      console.error(`[notify-subscribers] failed for ${sub.email}:`, e);
    }
  }
}
