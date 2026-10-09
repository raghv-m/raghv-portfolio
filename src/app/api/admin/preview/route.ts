import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { serialize } from "next-mdx-remote/serialize";
import { z } from "zod";

const previewSchema = z.object({
  content: z.string().max(200_000),
});

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = previewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { content } = parsed.data;

  try {
    const mdxSource = await serialize(content, {
      parseFrontmatter: false,
      mdxOptions: { development: false },
    });
    return NextResponse.json({ mdxSource });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 422 });
  }
}
