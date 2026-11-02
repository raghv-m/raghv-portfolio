/**
 * Brutalist divider for the public system. One raw rule: a 3px ink line
 * with a short red block parked at its left end, like the poster strips.
 * Decorative only: aria-hidden, no text, no motion. (This file held the
 * neoclassical laurel divider and Greek-key meander until Nov 2026; both
 * were deleted with that system, not restyled.)
 */
export function BlockRule({ className }: { className?: string }) {
  return (
    <div className={`cf-blockrule ${className ?? ""}`} aria-hidden="true">
      <span />
    </div>
  );
}
