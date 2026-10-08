"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { logAudit } from "@/lib/audit";
import { requireAdmin } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const cents = z.coerce.number().int().min(0).max(100_000_000);

const itemSchema = z.object({
  id: z.uuid().optional(),
  section: z.enum(["category", "feature", "integration", "hosting", "addon"]),
  slug: z.string().regex(/^[a-z0-9-]{1,60}$/, "Slug: lowercase letters, numbers and dashes"),
  label: z.string().trim().min(1).max(120),
  description: z.string().trim().max(300),
  icon: z.string().regex(/^[a-z0-9-]{1,60}$/).nullable(),
  price_cents: cents,
  monthly_cents: cents,
  included_pages: z.coerce.number().int().min(0).max(500),
  per_page_cents: cents,
  sort_order: z.coerce.number().int().min(0).max(10_000),
  active: z.boolean(),
});

export type PricingItemInput = z.input<typeof itemSchema>;

/** Creates or updates one price-list item. The public estimator picks it up within 5 minutes. */
export async function savePricingItemAction(input: unknown) {
  const { userId } = await requireAdmin();
  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { id, ...values } = parsed.data;

  const admin = getSupabaseAdmin();
  const { data: before } = id ? await admin.from("pricing_items").select("*").eq("id", id).maybeSingle() : { data: null };
  const { error } = id
    ? await admin.from("pricing_items").update(values).eq("id", id)
    : await admin.from("pricing_items").insert(values);
  if (error) return { ok: false as const, error: error.code === "23505" ? "That slug is already used" : error.message };

  await logAudit({
    actorId: userId,
    action: id ? "pricing.update" : "pricing.create",
    resourceType: "pricing_item",
    resourceId: id ?? values.slug,
    changes: before
      ? Object.fromEntries(Object.entries(values).filter(([k, v]) => before[k as keyof typeof before] !== v).map(([k, v]) => [k, { from: before[k as keyof typeof before], to: v }]))
      : values,
  });
  revalidatePath("/admin/pricing");
  revalidatePath("/estimate");
  return { ok: true as const };
}
