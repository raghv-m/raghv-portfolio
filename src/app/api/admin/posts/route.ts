import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { z } from "zod";

const postSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().min(1).max(500),
  content: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  coverImage: z.string().optional().nullable(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  readTime: z.number().int().min(1).optional().nullable(),
  notifySubscribers: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const skip = (page - 1) * limit;

  const where = {
    ...(search ? { OR: [{ title: { contains: search } }, { excerpt: { contains: search } }] } : {}),
    ...(category ? { category } : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit, select: { id: true, title: true, slug: true, category: true, published: true, featured: true, views: true, createdAt: true } }),
    prisma.post.count({ where }),
  ]);

  return NextResponse.json({ posts, total, page, limit });
}

export async function POST(req: NextRequest) {
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

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { tags, notifySubscribers, ...rest } = parsed.data;

  const existing = await prisma.post.findUnique({ where: { slug: rest.slug } });
  if (existing) return NextResponse.json({ error: "Slug already taken" }, { status: 409 });

  const post = await prisma.post.create({
    data: { ...rest, tags: JSON.stringify(tags), coverImage: rest.coverImage ?? null, readTime: rest.readTime ?? null, notifySubscribers },
  });

  if (notifySubscribers && rest.published) {
    notifySubscribersAboutPost(post).catch((e) => console.error("[notify-subscribers]", e));
  }

  return NextResponse.json(post, { status: 201 });
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
