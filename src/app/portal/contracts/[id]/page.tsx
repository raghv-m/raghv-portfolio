import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { ContractText } from "@/components/contracts/ContractText";
import { requirePortalUser } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { SignPanel } from "./SignPanel";

export const metadata: Metadata = { title: "Agreement", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const when = (iso: string) => new Intl.DateTimeFormat("en-CA", { dateStyle: "long", timeStyle: "short", timeZone: "America/Edmonton" }).format(new Date(iso));

export default async function PortalContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { profile } = await requirePortalUser();
  const supabase = await createSupabaseServerClient();
  // RLS: only the client's own, non-draft contracts.
  const { data: c } = await supabase.from("contracts").select("*").eq("id", id).maybeSingle();
  if (!c) notFound();
  const vars = c.variables as { client?: { signerName?: string; signerTitle?: string } };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/portal" className="font-mono text-[10px] tracking-wider text-[var(--text-muted)] hover:text-[var(--gold)]">← Back to portal</Link>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[10px] tracking-[0.2em] text-[var(--gold)]">AGREEMENT {c.number}</p>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{c.status === "sent" ? "Awaiting your signature" : c.status}</span>
        </div>

        <article className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-10">
          <ContractText body={c.body} />
          <div className="mt-10 pt-6 border-t border-[var(--border)] text-xs text-[var(--text-muted)] space-y-1">
            {c.provider_signed_at && <p>Signed by {c.provider_signature_name} for the Developer on {when(c.provider_signed_at)}.</p>}
            {c.client_signed_at && <p>Signed by {c.client_signature_name}{c.client_signature_title ? `, ${c.client_signature_title}` : ""} for the Client on {when(c.client_signed_at)}.</p>}
            {c.body_sha256 && <p className="font-mono break-all">Fingerprint: {c.body_sha256}</p>}
          </div>
        </article>

        {c.status === "sent" && <SignPanel id={c.id} defaultName={vars.client?.signerName ?? profile.full_name ?? ""} defaultTitle={vars.client?.signerTitle ?? ""} />}
        {c.status === "signed" && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a href={`/api/contracts/${c.id}/pdf`} target="_blank" rel="noopener noreferrer" className="btn-gold">Download signed PDF</a>
            <p className="text-sm text-[var(--text-muted)]">A copy was also emailed to you.</p>
          </div>
        )}
        {c.status === "void" && <p className="mt-6 text-sm text-[var(--text-muted)]">This agreement was withdrawn and is no longer in effect.</p>}
      </div>
    </div>
  );
}
