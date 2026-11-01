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
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div
        className="w-full max-w-xl text-center"
        style={{ border: "2px solid var(--cf-ink)", background: "var(--cf-paper-2)", padding: "44px 32px 40px" }}
      >
        <p className="cf-mono" style={{ fontSize: "11px", letterSpacing: "0.3em", color: "var(--cf-red)", fontWeight: 700 }}>
          Case file
        </p>
        <p className="cf-display" style={{ fontSize: "clamp(64px, 14vw, 108px)", lineHeight: 0.95, marginTop: "10px" }}>
          {code}
        </p>
        <div className="cf-rule-double" style={{ margin: "22px auto 0", maxWidth: "180px" }} />
        <h1 className="cf-h2" style={{ fontSize: "clamp(26px, 4vw, 34px)", marginTop: "20px" }}>
          {title}
        </h1>
        <div className="cf-body" style={{ marginTop: "14px" }}>
          {children}
        </div>
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
