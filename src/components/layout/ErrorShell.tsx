import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Shared look for the 404, 403, 401 and error pages. Plain markup with no hooks, so it works
 * in Server Components and in the client-side error boundary alike.
 */
export function ErrorShell({
  code,
  title,
  children,
  actions,
}: {
  code: string;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 pt-24 pb-16">
      <div className="w-full max-w-lg text-center">
        <p className="font-mono text-[11px] tracking-[0.3em] text-[var(--gold)]">{code}</p>
        <h1 className="mt-4 font-display text-3xl sm:text-4xl font-bold text-[var(--text)]">{title}</h1>
        <div className="mt-4 text-[var(--text-muted)] leading-relaxed">{children}</div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{actions}</div>
      </div>
    </main>
  );
}

export function ErrorLinks({ links }: { links: { href: string; label: string; primary?: boolean }[] }) {
  return (
    <>
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={l.primary ? "btn-gold" : "btn-ghost"}>
          {l.label}
        </Link>
      ))}
    </>
  );
}
