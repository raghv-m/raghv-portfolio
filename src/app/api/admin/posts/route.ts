import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
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
  coverImage: z.string().url().startsWith("https://").optional().nullable().or(z.literal("").transform(() => null)),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  readTime: z.number().int().min(1).optional().nullable(),
  notifySubscribers: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
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
  const session = await requireAdmin();
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
    import("@/lib/mail").then(({ notifySubscribersAboutPost }) =>
      notifySubscribersAboutPost(post)
    ).catch((e) => console.error("[notify-subscribers]", e));
  }

  return NextResponse.json(post, { status: 201 });
}
