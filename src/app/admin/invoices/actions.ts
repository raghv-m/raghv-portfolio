"use server";

import { revalidatePath } from "next/cache";

import { createInvoiceSchema, invoiceIdSchema } from "@/lib/invoices/schema";
import {
  cancelInvoice,
  createInvoice,
  markInvoiceOverdue,
  markInvoicePaid,
  sendInvoice,
} from "@/lib/invoices/service";
import { requireAdmin } from "@/lib/session";

/**
 * Admin invoice actions. Each one re-checks the admin session and TOTP step itself (server
 * actions are public endpoints; the page that renders the form proves nothing), validates its
 * input with zod, and the service layer audit-logs the change.
 */

type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

function firstIssue(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Invalid input";
}

function refresh() {
  revalidatePath("/admin/invoices");
  revalidatePath("/portal/invoices");
}

export async function createInvoiceAction(input: unknown): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  const parsed = createInvoiceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const result = await createInvoice(userId, parsed.data);
  if (!result.ok) return result;
  refresh();
  return { ok: true, id: result.data.id };
}

async function statusAction(
  input: unknown,
  run: (actorId: string, invoiceId: string) => Promise<{ ok: true } | { ok: false; error: string }>,
): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  const parsed = invoiceIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const result = await run(userId, parsed.data.invoiceId);
  refresh();
  return result.ok ? { ok: true, id: parsed.data.invoiceId } : result;
}

export const sendInvoiceAction = async (input: unknown) => statusAction(input, sendInvoice);
export const markInvoicePaidAction = async (input: unknown) => statusAction(input, markInvoicePaid);
export const cancelInvoiceAction = async (input: unknown) => statusAction(input, cancelInvoice);
export const markInvoiceOverdueAction = async (input: unknown) => statusAction(input, markInvoiceOverdue);
