"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Download, Loader2, Send, XCircle } from "lucide-react";

import { Panel } from "@/components/admin/ui";
import { useConfirm } from "@/components/ui/feedback";

import { cancelInvoiceAction, markInvoiceOverdueAction, markInvoicePaidAction, sendInvoiceAction } from "../actions";

export function InvoiceActions({ id, status, hasPdf }: { id: string; status: string; hasPdf: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const confirm = useConfirm();

  type Ask = Parameters<typeof confirm>[0];
  const run = async (action: (input: unknown) => Promise<{ ok: boolean; error?: string }>, success: string, ask?: Ask) => {
    if (ask && !(await confirm(ask))) return;
    start(async () => {
      const result = await action({ invoiceId: id });
      setMessage(result.ok ? { text: success } : { text: result.error ?? "Failed", error: true });
      router.refresh();
    });
  };

  return (
    <Panel title="Actions">
      <div className="space-y-2">
        {status === "draft" && (
          <button type="button" disabled={pending} onClick={() => run(sendInvoiceAction, "Sent: PDF emailed to the client", { title: "Send this invoice?", body: "The client gets it by email with the PDF attached. After sending, the invoice can't be edited.", confirmLabel: "Send invoice" })} className="btn-solid-gold w-full justify-center inline-flex items-center gap-2">
            {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Send to client
          </button>
        )}
        {(status === "sent" || status === "overdue") && (
          <button type="button" disabled={pending} onClick={() => run(markInvoicePaidAction, "Marked paid")} className="btn-gold w-full justify-center inline-flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> Mark paid
          </button>
        )}
        {status === "sent" && (
          <button type="button" disabled={pending} onClick={() => run(markInvoiceOverdueAction, "Marked overdue")} className="btn-ghost w-full justify-center">Mark overdue</button>
        )}
        {hasPdf && (
          <a href={`/api/invoices/${id}/pdf`} target="_blank" rel="noopener noreferrer" className="btn-ghost w-full justify-center inline-flex items-center gap-2">
            <Download className="w-3.5 h-3.5" /> View PDF
          </a>
        )}
        {(status === "draft" || status === "sent" || status === "overdue") && (
          <button type="button" disabled={pending} onClick={() => run(cancelInvoiceAction, "Invoice cancelled", { title: "Cancel this invoice?", body: "It stays on record as cancelled and the client no longer owes it.", confirmLabel: "Cancel invoice", cancelLabel: "Keep invoice", destructive: true })} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--red)]">
            <XCircle className="w-3.5 h-3.5" /> Cancel invoice
          </button>
        )}
        {message && <p role="status" className={`font-mono text-[11px] ${message.error ? "text-[var(--red)]" : "text-[var(--green)]"}`}>{message.text}</p>}
      </div>
    </Panel>
  );
}
