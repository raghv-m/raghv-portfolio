"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { estimatorConfig } from "@/config/estimator";
import { logAudit } from "@/lib/audit";
import { ensureClient, sendPortalInvite } from "@/lib/clients";
import { createInvoice } from "@/lib/invoices/service";
import { requireAdmin } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const STATUSES = ["new", "reviewed", "quoted", "converted", "declined"] as const;

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  return host ? `${h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")}://${host}` : "https://raghv.dev";
}

export async function updateEstimateAction(input: unknown) {
  const { userId } = await requireAdmin();
  const parsed = z
    .object({ id: z.uuid(), status: z.enum(STATUSES).optional(), adminNotes: z.string().max(5000).optional() })
    .safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid input" };

  const { id, status, adminNotes } = parsed.data;
  const { error } = await getSupabaseAdmin()
    .from("estimates")
    .update({ ...(status ? { status } : {}), ...(adminNotes !== undefined ? { admin_notes: adminNotes || null } : {}) })
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  await logAudit({ actorId: userId, action: "estimate.update", resourceType: "estimate", resourceId: id, changes: { status, notes: adminNotes !== undefined } });
  revalidatePath("/admin/estimates");
  revalidatePath(`/admin/estimates/${id}`);
  return { ok: true as const };
}

/**
 * Turns an estimate into a client account (if they don't have one) and a draft invoice
 * pre-filled with the estimate's one-time lines, then opens the invoice to adjust and send.
 */
export async function convertEstimateToInvoiceAction(estimateId: string) {
  const { userId } = await requireAdmin();
  if (!z.uuid().safeParse(estimateId).success) return { ok: false as const, error: "Invalid estimate" };

  const admin = getSupabaseAdmin();
  const { data: estimate } = await admin.from("estimates").select("*").eq("id", estimateId).maybeSingle();
  if (!estimate) return { ok: false as const, error: "Estimate not found" };
  if (estimate.invoice_id) redirect(`/admin/invoices/${estimate.invoice_id}`);

  const client = await ensureClient(userId, { email: estimate.email, name: estimate.name, company: estimate.company });
  const oneTime = estimate.line_items.filter((line) => line.oneTimeCents > 0);
  const monthly = estimate.line_items.filter((line) => line.monthlyCents > 0);
  const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const result = await createInvoice(userId, {
    clientId: client.id,
    dueDate: due,
    currency: "cad",
    notes: [
      `Based on estimate ${estimate.reference}.`,
      monthly.length ? `Ongoing (billed separately): ${monthly.map((l) => `${l.label} $${(l.monthlyCents / 100).toFixed(2)}/month`).join(", ")}.` : "",
    ]
      .filter(Boolean)
      .join(" "),
    // Lines start at YOUR price (market x ratio), rounded to whole dollars; adjust before sending.
    lineItems: (oneTime.length ? oneTime : [{ label: "Project", oneTimeCents: estimate.one_time_cents }]).map((line) => ({
      description: "detail" in line && line.detail ? `${line.label} (${line.detail})` : line.label,
      quantity: 1,
      unitAmount: Math.round((line.oneTimeCents * estimatorConfig.myPriceRatio) / 100) * 100,
    })),
  });
  if (!result.ok) return result;

  await admin.from("estimates").update({ status: "converted", invoice_id: result.data.id, client_id: client.id }).eq("id", estimateId);
  await logAudit({ actorId: userId, action: "estimate.convert", resourceType: "estimate", resourceId: estimateId, changes: { invoice_id: result.data.id, new_client: client.created } });
  revalidatePath("/admin/estimates");
  redirect(`/admin/invoices/${result.data.id}`);
}

export async function sendPortalInviteAction(email: string) {
  const { userId } = await requireAdmin();
  const parsed = z.email().safeParse(email);
  if (!parsed.success) return { ok: false as const, error: "Invalid email" };
  const { data: profile } = await getSupabaseAdmin().from("profiles").select("id").eq("email", parsed.data.toLowerCase()).maybeSingle();
  if (!profile) return { ok: false as const, error: "Create the client first (convert an estimate or make an invoice)." };
  try {
    await sendPortalInvite(userId, parsed.data, await origin());
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Couldn't send the invite" };
  }
}
