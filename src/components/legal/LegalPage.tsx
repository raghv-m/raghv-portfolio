import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
  { href: "/refunds", label: "Refunds" },
  { href: "/accessibility", label: "Accessibility" },
];

/** Shared layout for the legal pages: readable column, last-updated date, links between them. */
export function LegalPage({ title, updated, intro, children, path }: { title: string; updated: string; intro: ReactNode; children: ReactNode; path: string }) {
  return (
    <div className="cf-wrap pb-24">
      <article className="max-w-3xl mx-auto">
        <header className="cf-pagehead">
          <p className="cf-kicker cf-load">Legal, filed document</p>
          <h1 className="cf-load" style={{ "--cf-d": "0.08s" } as CSSProperties}>
            {title}
          </h1>
          <p className="cf-mono cf-load" style={{ "--cf-d": "0.14s", fontSize: "11.5px", color: "var(--cf-muted)", letterSpacing: "0.06em", marginTop: "14px" } as CSSProperties}>
            Last updated {updated}
          </p>
          <div className="cf-body cf-load" style={{ "--cf-d": "0.18s", marginTop: "22px" } as CSSProperties}>
            {intro}
          </div>
        </header>
        <div className="legal mt-10 space-y-8" style={{ fontSize: "15px", lineHeight: 1.8 }}>
          {children}
        </div>
        <nav aria-label="Legal pages" className="cf-mono mt-16 flex flex-wrap gap-x-5 gap-y-2" style={{ borderTop: "2px solid var(--cf-ink)", paddingTop: "20px", fontSize: "11.5px" }}>
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.href === path ? "page" : undefined}
              className="cf-navlink"
              style={{ color: link.href === path ? "var(--cf-ink)" : "var(--cf-muted)" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </article>
    </div>
  );
}
