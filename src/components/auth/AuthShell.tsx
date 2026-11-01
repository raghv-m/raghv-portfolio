import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";

/** The card every /auth page sits in; same look as the old admin login. */
export function AuthShell({ label, title, children, footer }: { label: string; title?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-[var(--bg)]">
      <div className="w-full max-w-sm">
        <div className="overflow-hidden" style={{ border: "2px solid var(--text)", background: "var(--card)" }}>
          <div className="flex items-center gap-2.5 px-6 py-4 bg-[var(--card)]" style={{ borderBottom: "3px double var(--text)" }}>
            <Logo size={26} style={{ color: "var(--text)" }} />
            <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider">{label}</span>
            <span className="ml-auto font-mono text-[9px] tracking-[0.14em] text-[var(--text-muted)] uppercase">Restricted</span>
          </div>
          <div className="p-6 space-y-4">
            {title && <h1 className="cf-display text-[22px] leading-tight text-[var(--text)]">{title}</h1>}
            {children}
          </div>
        </div>
        {footer && <div className="text-center font-mono text-[10px] text-[var(--text-muted)] mt-4">{footer}</div>}
      </div>
    </div>
  );
}

export const authInputClass =
  "w-full bg-[var(--bg)] border border-[var(--border)] aria-[invalid=true]:border-[var(--red)] rounded-none px-4 py-2.5 text-[var(--text)] text-sm font-mono focus:outline-none focus:border-[var(--gold)] focus:shadow-[0_2px_0_var(--red)] transition-shadow";

export const authLabelClass = "font-mono text-[9px] text-[var(--text-muted)] tracking-wider block mb-1.5";

export function FormAlert({ error, message }: { error?: string; message?: string }) {
  if (error) {
    return (
      <p role="alert" className="font-mono text-[11px] text-[var(--red)] bg-[rgba(255,68,68,0.08)] px-3 py-2 rounded border border-[rgba(255,68,68,0.15)]">
        {error}
      </p>
    );
  }
  if (message) {
    return (
      <p role="status" className="font-mono text-[11px] text-[var(--gold)] bg-[rgba(212,160,23,0.06)] px-3 py-2 rounded border border-[rgba(212,160,23,0.2)]">
        {message}
      </p>
    );
  }
  return null;
}
