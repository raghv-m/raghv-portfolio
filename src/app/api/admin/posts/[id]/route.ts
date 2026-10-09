import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
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
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(req: NextRequest, { params }: Params) {
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
    import("@/lib/mail").then(({ notifySubscribersAboutPost }) =>
      notifySubscribersAboutPost(post)
    ).catch((e) => console.error("[notify-subscribers]", e));
  }

  return NextResponse.json(post);
}

export async function DELETE(req: NextRequest, { params }: Params) {
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

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
