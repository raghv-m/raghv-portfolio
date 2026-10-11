import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { serialize } from "next-mdx-remote/serialize";
import { z } from "zod";
import { apiError, withApiErrors } from "@/lib/api";

const previewSchema = z.object({
  content: z.string().max(200_000),
});

async function handlePOST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return apiError(401, "Please sign in again.");

  let body: unknown;
  try { body = await req.json(); } catch { return apiError(400, "The request couldn't be read. Please try again."); }

  const parsed = previewSchema.safeParse(body);
  if (!parsed.success) return apiError(400, "Some fields are missing or invalid.");
  const { content } = parsed.data;

  try {
    const mdxSource = await serialize(content, {
      parseFrontmatter: false,
      mdxOptions: { development: false },
    });
    return NextResponse.json({ mdxSource });
  } catch (e) {
    return apiError(422, `Couldn't render the preview: ${String(e instanceof Error ? e.message : e).split("\n")[0].slice(0, 200)}`);
  }
}

export const POST = withApiErrors("POST /api/admin/preview", handlePOST);
