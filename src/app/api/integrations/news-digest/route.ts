import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { apiError, withApiErrors, zodMessage } from "@/lib/api";

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

async function handlePOST(request: NextRequest) {
  if (!authorised(request)) return apiError(401, "Please sign in again.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, "The request couldn't be read. Please try again.");
  }
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) return apiError(400, zodMessage(parsed.error));

  const digestDate = parsed.data.date ?? new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton" }).format(new Date());
  const { error } = await getSupabaseAdmin()
    .from("news_digests")
    .upsert(
      { digest_date: digestDate, items: parsed.data.items, ...(parsed.data.linkedinUrl ? { linkedin_url: parsed.data.linkedinUrl } : {}) },
      { onConflict: "digest_date" },
    );
  if (error) {
    console.error("[news-digest] save failed", error);
    return apiError(500, "Couldn't save the digest. Please try again.");
  }
  revalidatePath("/news");
  return NextResponse.json({ ok: true, date: digestDate, items: parsed.data.items.length });
}

export const POST = withApiErrors("POST /api/integrations/news-digest", handlePOST);
