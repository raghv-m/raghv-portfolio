"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Plus } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";

import type { PricingItemRow } from "@/lib/supabase/database.types";

import { savePricingItemAction } from "./actions";

type Section = PricingItemRow["section"];
const SECTIONS: { key: Section; title: string; hint: string }[] = [
  { key: "category", title: "Project types", hint: "Base price covers the included pages; each extra page adds the per-page price." },
  { key: "feature", title: "Features", hint: "One-time prices added when selected." },
  { key: "integration", title: "Integrations", hint: "One-time prices added when selected." },
  { key: "hosting", title: "Hosting", hint: "Monthly prices. Clients pick one." },
  { key: "addon", title: "Extras", hint: "The 'rush' item adds 25% instead of a fixed price." },
];

type Row = Omit<PricingItemRow, "updated_at" | "id"> & { id?: string };

const dollars = (cents: number) => (cents / 100).toFixed(2).replace(/\.00$/, "");
const toCents = (value: string) => Math.round(Number(value.replace(/[$,\s]/g, "") || 0) * 100);
const cell = "bg-transparent border border-transparent hover:border-[var(--border)] focus:border-[rgba(212,160,23,0.5)] focus:bg-[var(--bg)] rounded px-2 py-1 text-sm text-[var(--text)] outline-none w-full";

export function PricingEditor({ items }: { items: PricingItemRow[] }) {
  const [rows, setRows] = useState<Row[]>(items);
  const add = (section: Section) =>
    setRows((current) => [
      ...current,
      {
        section,
        slug: "",
        label: "",
        description: "",
        icon: null,
        price_cents: 0,
        monthly_cents: 0,
        included_pages: 0,
        per_page_cents: 0,
        sort_order: Math.max(0, ...current.filter((r) => r.section === section).map((r) => r.sort_order)) + 1,
        active: true,
      },
    ]);

  return (
    <div className="space-y-10">
      {SECTIONS.map(({ key, title, hint }) => (
        <section key={key}>
          <div className="flex items-end justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text)]">{title}</h2>
              <p className="text-xs text-[var(--text-muted)]">{hint}</p>
            </div>
            <button type="button" onClick={() => add(key)} className="btn-ghost inline-flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Add</button>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="font-mono text-[9px] tracking-wider text-[var(--text-muted)] uppercase">
                  <th className="text-left font-normal px-3 py-2 w-8" />
                  <th className="text-left font-normal px-3 py-2">Name & description</th>
                  {key !== "hosting" && <th className="text-left font-normal px-3 py-2 w-28">Price $</th>}
                  {(key === "hosting" || key === "addon") && <th className="text-left font-normal px-3 py-2 w-28">Monthly $</th>}
                  {key === "category" && <th className="text-left font-normal px-3 py-2 w-24">Pages incl.</th>}
                  {key === "category" && <th className="text-left font-normal px-3 py-2 w-28">Per extra page $</th>}
                  <th className="text-left font-normal px-3 py-2 w-20">On</th>
                  <th className="px-3 py-2 w-24" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) =>
                  row.section === key ? (
                    <EditableRow key={row.id ?? `new-${index}`} row={row} onSaved={(saved) => setRows((r) => r.map((x, i) => (i === index ? saved : x)))} />
                  ) : null,
                )}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

function EditableRow({ row, onSaved }: { row: Row; onSaved: (row: Row) => void }) {
  const [draft, setDraft] = useState({
    label: row.label,
    description: row.description,
    slug: row.slug,
    icon: row.icon ?? "",
    price: dollars(row.price_cents),
    monthly: dollars(row.monthly_cents),
    pages: String(row.included_pages),
    perPage: dollars(row.per_page_cents),
    active: row.active,
  });
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const isNew = !row.id;
  const set = (key: keyof typeof draft, value: string | boolean) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setStatus(null);
  };

  function save() {
    const next: Row = {
      ...row,
      label: draft.label.trim(),
      description: draft.description.trim(),
      slug: (draft.slug || draft.label).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      icon: draft.icon.trim() || null,
      price_cents: toCents(draft.price),
      monthly_cents: toCents(draft.monthly),
      included_pages: Number(draft.pages) || 0,
      per_page_cents: toCents(draft.perPage),
      active: draft.active,
    };
    start(async () => {
      const result = await savePricingItemAction(next);
      setStatus(result.ok ? { ok: true, text: "Saved" } : { ok: false, text: result.error });
      if (result.ok) onSaved(next);
    });
  }

  return (
    <tr className={`border-t border-[var(--border)] ${draft.active ? "" : "opacity-50"}`}>
      <td className="px-3 py-2 align-top text-[var(--gold)]">
        <DynamicIcon name={(draft.icon || "box") as IconName} fallback={() => <span className="block w-4 h-4" />} className="w-4 h-4 mt-1.5" />
      </td>
      <td className="px-3 py-2 align-top min-w-64">
        <input value={draft.label} onChange={(e) => set("label", e.target.value)} placeholder="Name" className={`${cell} font-medium`} aria-label="Name" />
        <input value={draft.description} onChange={(e) => set("description", e.target.value)} placeholder="Short description" className={`${cell} text-xs text-[var(--text-muted)]`} aria-label="Description" />
        <div className="flex gap-2">
          <input value={draft.slug} onChange={(e) => set("slug", e.target.value)} placeholder="slug (auto)" disabled={!isNew} className={`${cell} font-mono text-[10px] text-[#666]`} aria-label="Slug" title={isNew ? "Used in URLs and saved estimates; can't be changed later" : "Fixed: saved estimates refer to it"} />
          <input value={draft.icon} onChange={(e) => set("icon", e.target.value)} placeholder="icon (lucide name)" className={`${cell} font-mono text-[10px] text-[#666]`} aria-label="Icon" />
        </div>
      </td>
      {row.section !== "hosting" && (
        <td className="px-3 py-2 align-top"><input inputMode="decimal" value={draft.price} onChange={(e) => set("price", e.target.value)} className={`${cell} tabular-nums`} aria-label="Price" /></td>
      )}
      {(row.section === "hosting" || row.section === "addon") && (
        <td className="px-3 py-2 align-top"><input inputMode="decimal" value={draft.monthly} onChange={(e) => set("monthly", e.target.value)} className={`${cell} tabular-nums`} aria-label="Monthly price" /></td>
      )}
      {row.section === "category" && (
        <>
          <td className="px-3 py-2 align-top"><input inputMode="numeric" value={draft.pages} onChange={(e) => set("pages", e.target.value)} className={`${cell} tabular-nums`} aria-label="Included pages" /></td>
          <td className="px-3 py-2 align-top"><input inputMode="decimal" value={draft.perPage} onChange={(e) => set("perPage", e.target.value)} className={`${cell} tabular-nums`} aria-label="Price per extra page" /></td>
        </>
      )}
      <td className="px-3 py-2 align-top">
        <input type="checkbox" checked={draft.active} onChange={(e) => set("active", e.target.checked)} className="mt-2 accent-[#d4a017]" aria-label="Active" />
      </td>
      <td className="px-3 py-2 align-top text-right whitespace-nowrap">
        <button type="button" onClick={save} disabled={pending || !draft.label.trim()} className="btn-gold !px-3 !py-1.5">
          {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : status?.ok ? <Check className="w-3 h-3" /> : null} {isNew ? "Add" : "Save"}
        </button>
        {status && !status.ok && <p className="mt-1 text-[10px] text-[var(--red)] max-w-40 whitespace-normal">{status.text}</p>}
      </td>
    </tr>
  );
}
