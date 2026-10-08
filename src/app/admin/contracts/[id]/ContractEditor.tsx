"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

import { adminInput, Panel } from "@/components/admin/ui";
import { PAYMENT_METHODS } from "@/lib/contracts/questionnaire";
import { SCHEDULE_PRESETS, type ContractVariables } from "@/lib/contracts/template";

import { updateContractTermsAction, updateContractTextAction } from "../actions";

const lines = (text: string) => text.split("\n").map((l) => l.trim()).filter(Boolean);
const toCents = (v: string) => Math.round(Number(v.replace(/[$,\s]/g, "") || 0) * 100);

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="block font-mono text-[9px] tracking-wider text-[var(--text-muted)] uppercase mb-1">{label}</span>
      {children}
    </label>
  );
}

/** Edit a draft's terms (the text regenerates from them) or, if needed, the text directly. */
export function ContractEditor({ id, variables, body }: { id: string; variables: ContractVariables; body: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<"terms" | "text">("terms");
  const [v, setV] = useState(variables);
  const [fee, setFee] = useState((variables.feeCents / 100).toFixed(2));
  const [monthly, setMonthly] = useState(variables.monthly ? (variables.monthly.cents / 100).toFixed(2) : "");
  const [scope, setScope] = useState(variables.scope.join("\n"));
  const [exclusions, setExclusions] = useState(variables.exclusions.join("\n"));
  const [text, setText] = useState(body);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [pending, start] = useTransition();

  const setClient = (key: keyof ContractVariables["client"]) => (e: React.ChangeEvent<HTMLInputElement>) => setV((c) => ({ ...c, client: { ...c.client, [key]: e.target.value } }));
  const scheduleTotal = v.schedule.reduce((s, p) => s + p.pct, 0);

  function saveTerms() {
    const next: ContractVariables = {
      ...v,
      feeCents: toCents(fee),
      scope: lines(scope),
      exclusions: lines(exclusions),
      monthly: monthly && toCents(monthly) > 0 ? { cents: toCents(monthly), description: v.monthly?.description || "Managed hosting" } : null,
      startDate: v.startDate || undefined,
      targetLaunch: v.targetLaunch || undefined,
      client: { ...v.client, operatingName: v.client.operatingName || undefined },
    };
    start(async () => {
      const result = await updateContractTermsAction(id, next);
      setMessage(result.ok ? { text: "Saved: the agreement text below is updated" } : { text: result.error, error: true });
      if (result.ok) router.refresh();
    });
  }

  function saveText() {
    start(async () => {
      const result = await updateContractTextAction(id, text);
      setMessage(result.ok ? { text: "Text saved" } : { text: result.error, error: true });
      if (result.ok) router.refresh();
    });
  }

  return (
    <Panel
      title="Edit draft"
      aside={
        <div className="flex gap-1">
          {(["terms", "text"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={`px-2.5 py-1 rounded font-mono text-[10px] uppercase ${tab === t ? "bg-[rgba(212,160,23,0.12)] text-[var(--gold)]" : "text-[var(--text-muted)]"}`}>
              {t === "terms" ? "Terms" : "Edit text"}
            </button>
          ))}
        </div>
      }
    >
      {tab === "terms" ? (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Client legal name"><input value={v.client.legalName} onChange={setClient("legalName")} className={adminInput} /></Field>
            <Field label="Operating name"><input value={v.client.operatingName ?? ""} onChange={setClient("operatingName")} className={adminInput} /></Field>
            <Field label="Client address" wide><input value={v.client.address} onChange={setClient("address")} className={adminInput} /></Field>
            <Field label="Signer name"><input value={v.client.signerName} onChange={setClient("signerName")} className={adminInput} /></Field>
            <Field label="Signer title"><input value={v.client.signerTitle} onChange={setClient("signerTitle")} className={adminInput} /></Field>
            <Field label="Signer email" wide><input type="email" value={v.client.email} onChange={setClient("email")} className={adminInput} /></Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Project title" wide><input value={v.projectTitle} onChange={(e) => setV({ ...v, projectTitle: e.target.value })} className={adminInput} /></Field>
            <Field label="Scope (one item per line)" wide><textarea rows={6} value={scope} onChange={(e) => setScope(e.target.value)} className={adminInput} /></Field>
            <Field label="Not included (one per line)" wide><textarea rows={4} value={exclusions} onChange={(e) => setExclusions(e.target.value)} className={adminInput} /></Field>
            <Field label="Effective date"><input type="date" value={v.effectiveDate} onChange={(e) => setV({ ...v, effectiveDate: e.target.value })} className={adminInput} /></Field>
            <Field label="Start date (optional)"><input type="date" value={v.startDate ?? ""} onChange={(e) => setV({ ...v, startDate: e.target.value })} className={adminInput} /></Field>
            <Field label="Target launch"><input type="date" value={v.targetLaunch ?? ""} onChange={(e) => setV({ ...v, targetLaunch: e.target.value })} className={adminInput} /></Field>
            <Field label="Revision rounds"><input type="number" min={0} value={v.revisionRounds} onChange={(e) => setV({ ...v, revisionRounds: Number(e.target.value) })} className={adminInput} /></Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Project fee ($)"><input inputMode="decimal" value={fee} onChange={(e) => setFee(e.target.value)} className={adminInput} /></Field>
            <Field label="Monthly after launch ($, blank for none)"><input inputMode="decimal" value={monthly} onChange={(e) => setMonthly(e.target.value)} className={adminInput} /></Field>
            <Field label="Payment schedule preset">
              <select onChange={(e) => SCHEDULE_PRESETS[e.target.value] && setV({ ...v, schedule: SCHEDULE_PRESETS[e.target.value] })} defaultValue="" className={adminInput}>
                <option value="" disabled>Choose a preset…</option>
                {Object.keys(SCHEDULE_PRESETS).map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </Field>
            <Field label="Warranty days"><input type="number" min={0} value={v.warrantyDays} onChange={(e) => setV({ ...v, warrantyDays: Number(e.target.value) })} className={adminInput} /></Field>
          </div>

          <div>
            <p className="font-mono text-[9px] tracking-wider text-[var(--text-muted)] uppercase mb-2">Payment schedule ({scheduleTotal}%{scheduleTotal !== 100 ? " – must total 100%" : ""})</p>
            <div className="space-y-2">
              {v.schedule.map((p, i) => (
                <div key={i} className="grid grid-cols-[1fr_90px] gap-2">
                  <input value={p.label} onChange={(e) => setV({ ...v, schedule: v.schedule.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} className={adminInput} aria-label="Payment label" />
                  <input type="number" value={p.pct} onChange={(e) => setV({ ...v, schedule: v.schedule.map((x, j) => (j === i ? { ...x, pct: Number(e.target.value) } : x)) })} className={adminInput} aria-label="Percent" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[9px] tracking-wider text-[var(--text-muted)] uppercase mb-2">Accepted payment methods</p>
            <div className="flex flex-wrap gap-3">
              {PAYMENT_METHODS.map((m) => (
                <label key={m} className="flex items-center gap-2 text-sm text-[var(--text)]">
                  <input
                    type="checkbox"
                    className="accent-[#d4a017]"
                    checked={v.paymentMethods.includes(m)}
                    onChange={(e) => setV({ ...v, paymentMethods: e.target.checked ? [...v.paymentMethods, m] : v.paymentMethods.filter((x) => x !== m) })}
                  />
                  {m}
                </label>
              ))}
            </div>
          </div>

          <button type="button" disabled={pending || scheduleTotal !== 100} onClick={saveTerms} className="btn-solid-gold inline-flex items-center gap-2">
            {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save terms &amp; regenerate text
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-[var(--text-muted)]">
            Direct edits to the wording. Use &ldquo;## &rdquo; for headings and &ldquo;- &rdquo; for bullets. Saving terms again
            regenerates the text and replaces these edits.
          </p>
          <textarea rows={28} value={text} onChange={(e) => setText(e.target.value)} className={`${adminInput} font-mono text-xs leading-relaxed`} />
          <button type="button" disabled={pending} onClick={saveText} className="btn-solid-gold inline-flex items-center gap-2">
            {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save text
          </button>
        </div>
      )}
      {message && <p role="status" className={`mt-4 font-mono text-[11px] ${message.error ? "text-[var(--red)]" : "text-[var(--green)]"}`}>{message.text}</p>}
    </Panel>
  );
}
