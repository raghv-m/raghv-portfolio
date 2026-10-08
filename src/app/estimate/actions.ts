"use server";

import { headers } from "next/headers";

import { estimatorConfig } from "@/config/estimator";
import { createPortalAccessLink, ensureClient } from "@/lib/clients";
import { getActiveCatalog } from "@/lib/estimator/catalog";
import { priceEstimate, type EstimateResult } from "@/lib/estimator/engine";
import { estimateSubmissionSchema } from "@/lib/estimator/schema";
import { sendEstimateEmail, sendEstimateNotification } from "@/lib/mail";
import { getClientIp, hashIp, rateLimit } from "@/lib/rateLimit";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type SubmitEstimateResult =
  | { ok: true; reference: string; result: EstimateResult; emailed: boolean }
  | { ok: false; error: string };

/**
 * Saves a project estimate request and emails the estimate to the client (and a heads-up to
 * Raghav). The price is recalculated here from the live price list; nothing the browser sends
 * about money is used. Server actions already reject cross-site requests (Origin check).
 */
export async function submitEstimateAction(input: unknown): Promise<SubmitEstimateResult> {
  const parsed = estimateSubmissionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  const data = parsed.data;
  if (data.website) return { ok: false, error: "Something went wrong. Please email me instead." }; // honeypot

  const ip = getClientIp(new Request("http://x", { headers: await headers() }));
  const ipHash = hashIp(ip);
  const limit = await rateLimit(ipHash, "estimate");
  if (!limit.success) return { ok: false, error: "That's a few estimates in a short time. Try again in an hour, or email me." };

  const catalog = await getActiveCatalog();
  const result = priceEstimate(catalog, data, estimatorConfig.myPriceRatio);
  if (!result) return { ok: false, error: "That project type isn't available any more. Pick another one." };
  const categoryLabel = catalog.find((item) => item.slug === data.category)?.label ?? data.category;

  const admin = getSupabaseAdmin();
  const { data: saved, error } = await admin
    .from("estimates")
    .insert({
      name: data.name,
      email: data.email.toLowerCase(),
      company: data.company ?? null,
      phone: data.phone ?? null,
      address_line1: data.address.line1 ?? null,
      address_line2: data.address.line2 ?? null,
      city: data.address.city ?? null,
      region: data.address.region ?? null,
      postal_code: data.address.postalCode ?? null,
      country: data.address.country ?? null,
      place_id: data.address.placeId ?? null,
      category_slug: data.category,
      pages: data.pages,
      selections: { features: data.features, integrations: data.integrations, hosting: data.hosting, addons: data.addons },
      description: data.description ?? null,
      timeline: data.timeline ?? null,
      budget: data.budget ?? null,
      line_items: result.lines,
      one_time_cents: result.oneTimeCents,
      one_time_low_cents: result.oneTimeLowCents,
      one_time_high_cents: result.oneTimeHighCents,
      monthly_cents: result.monthlyCents,
      my_low_cents: result.myLowCents,
      my_high_cents: result.myHighCents,
      ip_hash: ipHash,
    })
    .select("id, reference")
    .single();
  if (error) {
    console.error("[estimate] save failed", error);
    return { ok: false, error: "I couldn't save that just now. Please try again in a minute." };
  }

  // Every request gets a portal account so the client can track it; returning clients reuse theirs.
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "raghv.dev";
  const origin = `${h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")}://${host}`;
  let portalUrl: string | null = null;
  let newAccount = false;
  try {
    const client = await ensureClient(null, { email: data.email, name: data.name, company: data.company });
    newAccount = client.created;
    await admin.from("estimates").update({ client_id: client.id }).eq("id", saved.id);
    portalUrl = await createPortalAccessLink(data.email, origin);
  } catch (err) {
    console.error("[estimate] client account setup failed", err);
  }

  let emailed = true;
  try {
    await sendEstimateEmail({
      to: data.email,
      name: data.name,
      reference: saved.reference,
      categoryLabel,
      pages: data.pages,
      result,
      portal: { url: portalUrl, loginUrl: `${origin}/auth/login`, newAccount },
    });
  } catch (err) {
    emailed = false;
    console.error("[estimate] client email failed", err);
  }
  await admin.from("email_sends").insert({
    estimate_id: saved.id,
    recipient_email: data.email.toLowerCase(),
    type: "estimate_sent",
    status: emailed ? "sent" : "failed",
    error_message: emailed ? null : "Client estimate email failed",
  });
  try {
    await sendEstimateNotification({ reference: saved.reference, id: saved.id, name: data.name, email: data.email, company: data.company, categoryLabel, result });
  } catch (err) {
    console.error("[estimate] admin notification failed", err);
  }

  return { ok: true, reference: saved.reference, result, emailed };
}
