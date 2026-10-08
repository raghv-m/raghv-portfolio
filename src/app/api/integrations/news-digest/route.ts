import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * POST /api/integrations/news-digest
 * Called by the LinkedIn autopost job (news_digest.py) with the day's top security stories.
 * Auth: "Authorization: Bearer <INTEGRATION_API_KEY>". Upserts one digest per date; /news shows them.
 */

const httpsUrl = z.url().refine((u) => u.startsWith("https://"), "https only");
const payloadSchema = z.object({
  date: z.iso.date().optional(),
  linkedinUrl: httpsUrl.optional(),
  items: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(300),
        url: httpsUrl,
        source: z.string().trim().min(1).max(120),
        summary: z.string().trim().max(500).optional(),
        publishedAt: z.string().max(40).optional(),
      }),
    )
    .min(1)
    .max(10),
});

function authorised(request: NextRequest): boolean {
  const expected = process.env.INTEGRATION_API_KEY;
  const given = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!expected || !given) return false;
  // Compare fixed-length hashes so timing doesn't leak the key's length or prefix.
  const a = createHash("sha256").update(expected).digest();
  const b = createHash("sha256").update(given).digest();
  return timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (!authorised(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });

  const digestDate = parsed.data.date ?? new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton" }).format(new Date());
  const { error } = await getSupabaseAdmin()
    .from("news_digests")
    .upsert(
      { digest_date: digestDate, items: parsed.data.items, ...(parsed.data.linkedinUrl ? { linkedin_url: parsed.data.linkedinUrl } : {}) },
      { onConflict: "digest_date" },
    );
  if (error) {
    console.error("[news-digest] save failed", error);
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }
  revalidatePath("/news");
  return NextResponse.json({ ok: true, date: digestDate, items: parsed.data.items.length });
}
