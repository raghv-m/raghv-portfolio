import "server-only";

import { invoicing } from "@/config/invoicing";
import { logAudit } from "@/lib/audit";
import { sendInvoiceEmail } from "@/lib/mail";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { InvoiceRow, InvoiceStatus } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { formatMoney } from "./money";
import { renderInvoicePdf } from "./pdf";
import type { CreateInvoiceInput } from "./schema";

/**
 * In-house invoicing. Every function here that changes data expects the caller to have run
 * requireAdmin() (src/lib/session.ts) first and passes that admin's id for the audit log.
 * PDFs live in the private `invoices` bucket; nobody gets a public URL.
 */

type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

const admin = () => getSupabaseAdmin();

/** Status changes allowed from each state. Anything else is refused. */
const TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  draft: ["sent", "cancelled"],
  sent: ["paid", "overdue", "cancelled"],
  overdue: ["paid", "cancelled"],
  paid: [],
  cancelled: [],
};

type InvoiceWithItems = InvoiceRow & {
  invoice_line_items: { description: string; quantity: number; unit_amount: number; amount: number; sort_order: number }[];
};

async function loadInvoice(invoiceId: string) {
  const { data: invoice, error } = await admin()
    .from("invoices")
    .select("*, invoice_line_items(*)")
    .eq("id", invoiceId)
    .maybeSingle();
  if (error) throw error;
  if (!invoice) return null;
  const typed = invoice as unknown as InvoiceWithItems;
  typed.invoice_line_items.sort((a, b) => a.sort_order - b.sort_order);

  const { data: client } = await admin()
    .from("profiles")
    .select("full_name, email")
    .eq("id", typed.client_id)
    .maybeSingle();
  return { invoice: typed, client };
}

export async function createInvoice(actorId: string, input: CreateInvoiceInput): Promise<Result<InvoiceRow>> {
  const { data: client, error: clientError } = await admin()
    .from("profiles")
    .select("id, tenant_id, role")
    .eq("id", input.clientId)
    .maybeSingle();
  if (clientError) throw clientError;
  if (!client || client.role !== "client") return { ok: false, error: "Client not found" };

  const { data: invoice, error } = await admin()
    .from("invoices")
    .insert({
      tenant_id: client.tenant_id,
      client_id: client.id,
      // End of the due day in Edmonton (MST/MDT; -07:00 is close enough for a day boundary).
      due_date: new Date(`${input.dueDate}T23:59:59-07:00`).toISOString(),
      currency: input.currency,
      notes: input.notes || null,
    })
    .select()
    .single();
  if (error) throw error;

  const { error: itemsError } = await admin()
    .from("invoice_line_items")
    .insert(
      input.lineItems.map((item, index) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_amount: item.unitAmount,
        sort_order: index,
      })),
    );
  if (itemsError) {
    // Don't leave an empty draft behind; nothing was sent yet.
    await admin().from("invoices").delete().eq("id", invoice.id);
    throw itemsError;
  }

  // The database trigger set amount_due from the line items; return the fresh row.
  const { data: fresh } = await admin().from("invoices").select("*").eq("id", invoice.id).single();
  await logAudit({
    actorId,
    action: "invoice.create",
    resourceType: "invoice",
    resourceId: invoice.id,
    changes: { invoice_number: invoice.invoice_number, amount_due: fresh?.amount_due, line_items: input.lineItems.length },
  });
  return { ok: true, data: fresh ?? invoice };
}

/** Renders the PDF from current data and stores it at invoices/<id>.pdf (overwriting). */
async function renderAndStore(invoiceId: string, issuedAt: string, statusOverride?: InvoiceStatus) {
  const loaded = await loadInvoice(invoiceId);
  if (!loaded) throw new Error("Invoice not found");
  const { invoice, client } = loaded;

  const pdf = await renderInvoicePdf({
    invoiceNumber: invoice.invoice_number,
    issuedAt,
    dueDate: invoice.due_date,
    currency: invoice.currency,
    status: statusOverride ?? invoice.status,
    amountDue: invoice.amount_due,
    amountPaid: invoice.amount_paid,
    notes: invoice.notes,
    client: { name: client?.full_name || client?.email || "Client", email: client?.email ?? "" },
    from: invoicing,
    lineItems: invoice.invoice_line_items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitAmount: item.unit_amount,
      amount: item.amount,
    })),
  });

  const path = `${invoice.id}.pdf`;
  const { error } = await admin()
    .storage.from("invoices")
    .upload(path, pdf, { contentType: "application/pdf", upsert: true });
  if (error) throw error;
  return { invoice, client, pdf, path };
}

/** Draft → sent: renders the PDF, stores it privately, emails it to the client as an attachment. */
export async function sendInvoice(actorId: string, invoiceId: string): Promise<Result> {
  const loaded = await loadInvoice(invoiceId);
  if (!loaded) return { ok: false, error: "Invoice not found" };
  const current = loaded.invoice;
  if (!TRANSITIONS[current.status].includes("sent")) {
    return { ok: false, error: `A ${current.status} invoice can't be sent` };
  }
  if (current.invoice_line_items.length === 0 || current.amount_due <= 0) {
    return { ok: false, error: "Add at least one line item with an amount first" };
  }

  const sentAt = new Date().toISOString();
  const { invoice, client, pdf, path } = await renderAndStore(invoiceId, sentAt, "sent");

  // Only flip to sent if it's still a draft (guards a double click or two open tabs).
  const { data: updated, error } = await admin()
    .from("invoices")
    .update({ status: "sent", sent_date: sentAt, pdf_path: path })
    .eq("id", invoiceId)
    .eq("status", "draft")
    .select("id");
  if (error) throw error;
  if (!updated?.length) return { ok: false, error: "Invoice was already sent" };

  let emailError: string | null = client?.email ? null : "Client has no email address";
  if (client?.email) {
    try {
      await sendInvoiceEmail({
        to: client.email,
        clientName: client.full_name || "there",
        invoiceNumber: invoice.invoice_number,
        amount: formatMoney(invoice.amount_due, invoice.currency),
        dueDate: invoice.due_date,
        pdf,
      });
    } catch (error) {
      emailError = error instanceof Error ? error.message : "Email failed";
    }
  }
  await admin()
    .from("email_sends")
    .insert({
      invoice_id: invoice.id,
      recipient_email: client?.email ?? "(none)",
      type: "invoice_sent",
      status: emailError ? "failed" : "sent",
      error_message: emailError,
    });
  await logAudit({
    actorId,
    action: "invoice.send",
    resourceType: "invoice",
    resourceId: invoiceId,
    changes: { from: "draft", to: "sent", emailed: !emailError },
  });

  return emailError
    ? { ok: false, error: `Invoice marked sent, but the email didn't go out (${emailError}). Send the PDF manually.` }
    : { ok: true, data: undefined };
}

async function transition(
  actorId: string,
  invoiceId: string,
  to: Extract<InvoiceStatus, "paid" | "cancelled" | "overdue">,
): Promise<Result> {
  const loaded = await loadInvoice(invoiceId);
  if (!loaded) return { ok: false, error: "Invoice not found" };
  const current = loaded.invoice;
  if (!TRANSITIONS[current.status].includes(to)) {
    return { ok: false, error: `Can't change a ${current.status} invoice to ${to}` };
  }
  const now = new Date().toISOString();
  const { data, error } = await admin()
    .from("invoices")
    .update(to === "paid" ? { status: to, paid_date: now, amount_paid: current.amount_due } : { status: to })
    .eq("id", invoiceId)
    .eq("status", current.status)
    .select("id");
  if (error) throw error;
  if (!data?.length) return { ok: false, error: "The invoice changed in the meantime. Reload and try again." };

  // Re-stamp the stored PDF (PAID / CANCELLED) when one exists.
  if (current.pdf_path) await renderAndStore(invoiceId, current.sent_date ?? current.created_at);

  await logAudit({
    actorId,
    action: `invoice.${to}`,
    resourceType: "invoice",
    resourceId: invoiceId,
    changes: { from: current.status, to },
  });
  return { ok: true, data: undefined };
}

export const markInvoicePaid = (actorId: string, id: string) => transition(actorId, id, "paid");
export const cancelInvoice = (actorId: string, id: string) => transition(actorId, id, "cancelled");
export const markInvoiceOverdue = (actorId: string, id: string) => transition(actorId, id, "overdue");

/**
 * Short-lived link to an invoice PDF for whoever is signed in. Visibility is decided by RLS as
 * that user (a client only sees their own tenant's non-draft invoices); only then does the
 * service role mint a 5-minute signed URL for the private object.
 */
export async function getInvoicePdfUrl(invoiceId: string): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data: visible } = await supabase.from("invoices").select("id, pdf_path").eq("id", invoiceId).maybeSingle();
  if (!visible?.pdf_path) return null;
  const { data } = await admin().storage.from("invoices").createSignedUrl(visible.pdf_path, 300);
  return data?.signedUrl ?? null;
}

/** Replaces a draft's details and line items (only drafts are editable; sent invoices are final). */
export async function updateDraftInvoice(actorId: string, invoiceId: string, input: Omit<CreateInvoiceInput, "clientId">): Promise<Result> {
  const loaded = await loadInvoice(invoiceId);
  if (!loaded) return { ok: false, error: "Invoice not found" };
  if (loaded.invoice.status !== "draft") return { ok: false, error: "Only draft invoices can be edited" };

  const { error } = await admin()
    .from("invoices")
    .update({
      due_date: new Date(`${input.dueDate}T23:59:59-07:00`).toISOString(),
      currency: input.currency,
      notes: input.notes || null,
    })
    .eq("id", invoiceId)
    .eq("status", "draft");
  if (error) throw error;

  const { error: deleteError } = await admin().from("invoice_line_items").delete().eq("invoice_id", invoiceId);
  if (deleteError) throw deleteError;
  const { error: insertError } = await admin()
    .from("invoice_line_items")
    .insert(
      input.lineItems.map((item, index) => ({
        invoice_id: invoiceId,
        description: item.description,
        quantity: item.quantity,
        unit_amount: item.unitAmount,
        sort_order: index,
      })),
    );
  if (insertError) throw insertError;

  await logAudit({ actorId, action: "invoice.update", resourceType: "invoice", resourceId: invoiceId, changes: { line_items: input.lineItems.length } });
  return { ok: true, data: undefined };
}

/** The data the admin invoice editor needs. */
export async function getInvoiceForAdmin(invoiceId: string) {
  return loadInvoice(invoiceId);
}
