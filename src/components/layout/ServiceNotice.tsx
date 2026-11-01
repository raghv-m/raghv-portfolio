import Link from "next/link";

/**
 * Shown in place of a section whose data couldn't load (database or Supabase down), so the
 * page still renders with a friendly message instead of crashing.
 */
export function ServiceNotice({ what }: { what: string }) {
  return (
    <div role="status" className="p-6 sm:p-8" style={{ border: "2px solid var(--cf-ink)", background: "var(--cf-paper-2)" }}>
      <p className="cf-mono" style={{ fontSize: "11px", letterSpacing: "0.25em", color: "var(--cf-red)", fontWeight: 700 }}>
        TEMPORARILY UNAVAILABLE
      </p>
      <p className="mt-3 font-semibold" style={{ color: "var(--cf-ink)", fontSize: "17px" }}>
        {what} can&apos;t load right now.
      </p>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--cf-muted)" }}>
        This is on our side and usually clears up within a few minutes. Please refresh shortly, or get in touch directly.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/contact" className="cf-btn">
          Contact me
        </Link>
        <Link href="/" className="cf-btn-ghost">
          Home
        </Link>
      </div>
    </div>
  );
}
