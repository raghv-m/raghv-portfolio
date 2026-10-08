import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { AdminPage, Panel, StatusPill, when } from "@/components/admin/ui";
import { ContractText } from "@/components/contracts/ContractText";
import { invoicing } from "@/config/invoicing";
import type { ContractVariables } from "@/lib/contracts/template";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

import { ContractEditor } from "./ContractEditor";
import { ContractSendPanel } from "./ContractSendPanel";

export const dynamic = "force-dynamic";

export default async function ContractDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { data: c } = await getSupabaseAdmin().from("contracts").select("*").eq("id", id).maybeSingle();
  if (!c) notFound();
  const vars = c.variables as unknown as ContractVariables;
  const { data: client } = await getSupabaseAdmin().from("profiles").select("email").eq("id", c.client_id).maybeSingle();

  return (
    <AdminPage
      label={`Contract ${c.number}`}
      title={vars.client?.legalName ?? "Contract"}
      back={{ href: "/admin/contracts", text: "All contracts" }}
      actions={
        <>
          <StatusPill status={c.status === "sent" ? "awaiting signature" : c.status} />
          {client?.email && <Link href={`/admin/clients/${encodeURIComponent(client.email)}`} className="btn-ghost">Client</Link>}
        </>
      }
    >
      <div className="grid xl:grid-cols-[1fr_380px] gap-6 items-start">
        <div className="space-y-6">
          {c.status === "draft" && <ContractEditor id={c.id} variables={vars} body={c.body} />}
          <Panel title="Agreement text as the client will see it">
            <ContractText body={c.body} />
          </Panel>
        </div>
        <div className="space-y-6 xl:sticky xl:top-6">
          <ContractSendPanel id={c.id} status={c.status} defaultSigner={invoicing.businessName} hasPdf={Boolean(c.pdf_path)} />
          <Panel title="Record">
            <dl className="space-y-2 text-sm">
              <div><dt className="font-mono text-[9px] text-[var(--text-muted)] uppercase">Created</dt><dd>{when(c.created_at)}</dd></div>
              {c.sent_at && <div><dt className="font-mono text-[9px] text-[var(--text-muted)] uppercase">Sent &amp; signed by you</dt><dd>{when(c.sent_at)} · {c.provider_signature_name}</dd></div>}
              {c.client_signed_at && (
                <div><dt className="font-mono text-[9px] text-[var(--text-muted)] uppercase">Signed by client</dt><dd className="text-[var(--green)]">{when(c.client_signed_at)} · {c.client_signature_name}{c.client_signature_title ? `, ${c.client_signature_title}` : ""}</dd></div>
              )}
              {c.body_sha256 && <div><dt className="font-mono text-[9px] text-[var(--text-muted)] uppercase">Fingerprint (SHA-256)</dt><dd className="font-mono text-[10px] break-all text-[var(--text-muted)]">{c.body_sha256}</dd></div>}
            </dl>
          </Panel>
        </div>
      </div>
    </AdminPage>
  );
}
