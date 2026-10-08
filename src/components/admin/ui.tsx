import type { ReactNode } from "react";
import Link from "next/link";

/** Shared building blocks so every admin screen looks the same. Server-safe (no hooks). */

export function AdminPage({ label, title, actions, children, back }: { label: string; title: string; actions?: ReactNode; children: ReactNode; back?: { href: string; text: string } }) {
  return (
    <div className="min-h-screen px-8 py-8 max-w-6xl">
      {back && (
        <Link href={back.href} className="inline-block mb-4 font-mono text-[10px] tracking-wider text-[var(--text-muted)] hover:text-[var(--gold)]">
          ← {back.text}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="font-mono text-[9px] tracking-[0.2em] text-[var(--gold)] uppercase">{label}</p>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--text)]">{title}</h1>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function Panel({ title, children, className = "", aside }: { title?: string; children: ReactNode; className?: string; aside?: ReactNode }) {
  return (
    <section className={`rounded-xl border border-[var(--border)] bg-[var(--card)] ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
          <h2 className="font-mono text-[10px] tracking-wider text-[var(--text-muted)] uppercase">{title}</h2>
          {aside}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

const PILL: Record<string, string> = {
  new: "text-[var(--gold)] border-[rgba(212,160,23,0.35)] bg-[rgba(212,160,23,0.08)]",
  reviewed: "text-[var(--blue)] border-[rgba(59,130,246,0.35)] bg-[rgba(59,130,246,0.08)]",
  quoted: "text-[var(--cyan)] border-[rgba(34,211,238,0.35)] bg-[rgba(34,211,238,0.08)]",
  converted: "text-[var(--green)] border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.08)]",
  declined: "text-[var(--text-muted)] border-[var(--border)]",
  draft: "text-[var(--text-muted)] border-[var(--border)]",
  sent: "text-[var(--blue)] border-[rgba(59,130,246,0.35)] bg-[rgba(59,130,246,0.08)]",
  paid: "text-[var(--green)] border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.08)]",
  overdue: "text-[var(--red)] border-[rgba(255,68,68,0.35)] bg-[rgba(255,68,68,0.08)]",
  cancelled: "text-[var(--text-muted)] border-[var(--border)] line-through",
  admin: "text-[var(--gold)] border-[rgba(212,160,23,0.35)]",
  "awaiting signature": "text-[var(--gold)] border-[rgba(212,160,23,0.35)] bg-[rgba(212,160,23,0.08)]",
  signed: "text-[var(--green)] border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.08)]",
  void: "text-[var(--text-muted)] border-[var(--border)] line-through",
  client: "text-[var(--green)] border-[rgba(34,197,94,0.35)]",
  lead: "text-[var(--text-muted)] border-[var(--border)]",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full border font-mono text-[9px] tracking-wider uppercase ${PILL[status] ?? PILL.draft}`}>
      {status}
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-10 text-center text-sm text-[var(--text-muted)]">{children}</p>;
}

export function Stat({ label, value, href, accent }: { label: string; value: ReactNode; href?: string; accent?: boolean }) {
  const body = (
    <div className={`rounded-xl border p-5 h-full transition-colors ${accent ? "border-[rgba(212,160,23,0.35)] bg-[rgba(212,160,23,0.05)]" : "border-[var(--border)] bg-[var(--card)]"} ${href ? "hover:border-[rgba(212,160,23,0.5)]" : ""}`}>
      <p className="font-mono text-[9px] tracking-wider text-[var(--text-muted)] uppercase">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--text)] tabular-nums">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export const tableClass = "w-full text-sm";
export const thClass = "text-left font-mono text-[9px] tracking-wider text-[var(--text-muted)] uppercase font-normal px-4 py-2.5 border-b border-[var(--border)]";
export const tdClass = "px-4 py-3 border-b border-[var(--border)] text-[var(--text)] align-top";
export const adminInput =
  "w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[rgba(212,160,23,0.5)]";

export function money(cents: number, currency = "cad") {
  return `${new Intl.NumberFormat("en-CA", { style: "currency", currency: currency.toUpperCase(), currencyDisplay: "narrowSymbol" }).format(cents / 100)}`;
}

export function when(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeZone: "America/Edmonton" }).format(new Date(iso));
}
