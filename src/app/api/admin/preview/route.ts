import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { serialize } from "next-mdx-remote/serialize";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await req.json();
  if (typeof content !== "string") return NextResponse.json({ error: "Invalid" }, { status: 400 });

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
