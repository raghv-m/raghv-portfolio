import type { ReactNode } from "react";
import { Lock } from "lucide-react";

/** The card every /auth page sits in; same look as the old admin login. */
export function AuthShell({ label, title, children, footer }: { label: string; title?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-[var(--bg)]">
      <div className="w-full max-w-sm">
        <div className="glass rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 px-6 py-4 border-b border-[var(--border)] bg-[var(--card)]">
            <Lock className="w-3.5 h-3.5 text-[var(--gold)]" aria-hidden="true" />
            <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider">{label}</span>
          </div>
          <div className="p-6 space-y-4">
            {title && <h1 className="text-lg font-semibold text-[var(--text)]">{title}</h1>}
            {children}
          </div>
        </div>
        {footer && <div className="text-center font-mono text-[10px] text-[var(--text-muted)] mt-4">{footer}</div>}
      </div>
    </div>
  );
}

export const authInputClass =
  "w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--text)] text-sm font-mono focus:outline-none focus:border-[rgba(212,160,23,0.4)] transition-colors";

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
