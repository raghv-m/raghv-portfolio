import type { ReactNode } from "react";
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
    <div className="min-h-screen pt-28 pb-24">
      <article className="max-w-3xl mx-auto px-6">
        <p className="font-mono text-[10px] tracking-[0.25em] text-[var(--gold)]">LEGAL</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-[var(--text)]">{title}</h1>
        <p className="mt-2 font-mono text-[11px] text-[var(--text-muted)]">Last updated {updated}</p>
        <div className="mt-6 text-[var(--text-muted)] leading-relaxed">{intro}</div>
        <div className="legal mt-10 space-y-8 text-[15px] leading-[1.8] text-[var(--text-muted)] [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[var(--text)] [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-[var(--gold)] [&_a]:underline [&_strong]:text-[var(--text)]">
          {children}
        </div>
        <nav aria-label="Legal pages" className="mt-16 pt-6 border-t border-[var(--border)] flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px]">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.href} href={link.href} aria-current={link.href === path ? "page" : undefined} className={link.href === path ? "text-[var(--gold)]" : "text-[var(--text-muted)] hover:text-[var(--gold)]"}>
              {link.label}
            </Link>
          ))}
        </nav>
      </article>
    </div>
  );
}
