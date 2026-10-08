import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { PricingItemRow } from "@/lib/supabase/database.types";

import type { PricingItem } from "./engine";

/**
 * The active price list, read with the service role so pricing works the same for every visitor
 * and in static rendering (the table is public-readable anyway; only active items are returned).
 */
export async function getActiveCatalog(): Promise<PricingItem[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("pricing_items")
    .select("section, slug, label, description, icon, price_cents, monthly_cents, included_pages, per_page_cents, sort_order")
    .eq("active", true)
    .order("section")
    .order("sort_order");
  if (error) throw error;
  return data as PricingItem[];
}

/** Everything, including inactive items, for the admin pricing editor. */
export async function getFullCatalog(): Promise<PricingItemRow[]> {
  const { data, error } = await getSupabaseAdmin().from("pricing_items").select("*").order("section").order("sort_order");
  if (error) throw error;
  return data;
}
