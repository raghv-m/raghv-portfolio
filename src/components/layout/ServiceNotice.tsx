import Link from "next/link";

/**
 * Shown in place of a section whose data couldn't load (database or Supabase down), so the
 * page still renders with a friendly message instead of crashing.
 */
export function ServiceNotice({ what }: { what: string }) {
  return (
    <div role="status" className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
      <p className="font-mono text-[10px] tracking-[0.25em] text-[var(--gold)]">TEMPORARILY UNAVAILABLE</p>
      <p className="mt-3 text-[var(--text)] font-medium">{what} can&apos;t load right now.</p>
      <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">
        This is on our side and usually clears up within a few minutes. Please refresh shortly, or get in touch directly.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/contact" className="btn-gold">Contact me</Link>
        <Link href="/" className="btn-ghost">Home</Link>
      </div>
    </div>
  );
}
