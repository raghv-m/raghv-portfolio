import { after, NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { z } from "zod";
import { apiError, withApiErrors, zodMessage } from "@/lib/api";

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

async function handleGET(_req: NextRequest, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return apiError(401, "Please sign in again.");

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return apiError(404, "That item doesn't exist.");
  return NextResponse.json(post);
}

async function handlePUT(req: NextRequest, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return apiError(401, "Please sign in again.");

  const ip = getClientIp(req);
  const limit = await rateLimit(ip, "admin");
  if (!limit.success) {
    return apiError(429, "Too many requests. Please wait a bit and try again.", { "Retry-After": String(Math.ceil((limit.msBeforeNext ?? 60000) / 1000)) });
  }

  const { id } = await params;

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return apiError(404, "That item doesn't exist.");

  let body: unknown;
  try { body = await req.json(); } catch { return apiError(400, "The request couldn't be read. Please try again."); }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return apiError(422, zodMessage(parsed.error));

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
    // after(): runs once the response is sent, and Vercel keeps the function alive until it
    // finishes. A bare un-awaited promise can be frozen mid-send, so emails silently never go out.
    after(() =>
      import("@/lib/mail")
        .then(({ notifySubscribersAboutPost }) => notifySubscribersAboutPost(post))
        .catch((e) => console.error("[notify-subscribers]", e)),
    );
  }

  return NextResponse.json(post);
}

async function handleDELETE(req: NextRequest, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return apiError(401, "Please sign in again.");

  const ip = getClientIp(req);
  const limit = await rateLimit(ip, "admin");
  if (!limit.success) {
    return apiError(429, "Too many requests. Please wait a bit and try again.", { "Retry-After": String(Math.ceil((limit.msBeforeNext ?? 60000) / 1000)) });
  }

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return apiError(404, "That item doesn't exist.");

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export const GET = withApiErrors("GET /api/admin/posts/[id]", handleGET);

export const PUT = withApiErrors("PUT /api/admin/posts/[id]", handlePUT);

export const DELETE = withApiErrors("DELETE /api/admin/posts/[id]", handleDELETE);
