import { useId } from "react";

/**
 * Neoclassical ornaments for the archive system. All draw in currentColor,
 * so the theme tokens decide whether they read in hairline ink or cobalt.
 * Decorative only: aria-hidden everywhere, no text, no motion.
 */

/** One laurel branch: a stem arc with five leaves. Mirrored for the pair. */
function Branch({ flip = false }: { flip?: boolean }) {
  const leaves = [
    { x: 4, y: 12.5, r: -38 },
    { x: 10, y: 8.6, r: -18 },
    { x: 17, y: 6.2, r: 2 },
    { x: 24.5, y: 5.4, r: 22 },
    { x: 31, y: 6.4, r: 42 },
  ];
  return (
    <g transform={flip ? "translate(76 0) scale(-1 1)" : undefined}>
      <path d="M1 15 C 10 6, 24 2.5, 37 4.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
      {leaves.map((l, i) => (
        <path
          key={i}
          d="M0 0 Q 3.4 -3.4 8 0 Q 3.4 3.4 0 0 Z"
          fill="currentColor"
          transform={`translate(${l.x} ${l.y}) rotate(${l.r})`}
        />
      ))}
    </g>
  );
}

/** Hairline — laurel pair tied by a diamond — hairline. The section divider. */
export function LaurelDivider({ className }: { className?: string }) {
  return (
    <div className={`cf-laurel ${className ?? ""}`} aria-hidden="true">
      <svg width="76" height="18" viewBox="0 0 76 18" fill="none">
        <Branch />
        <Branch flip />
        <rect x="35.6" y="12.4" width="4.8" height="4.8" transform="rotate(45 38 14.8)" fill="currentColor" />
      </svg>
    </div>
  );
}

/** Greek-key meander strip: the entablature band under the header and over the footer. */
export function MeanderBand() {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = `mk-${raw}`;
  return (
    <div className="cf-meander" aria-hidden="true">
      <svg width="100%" height="14" style={{ display: "block" }}>
        <defs>
          <pattern id={id} width="26" height="14" patternUnits="userSpaceOnUse">
            <path
              d="M2 12 V3.5 H20 V10 H9 V6.5 M20 10 H24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="14" fill={`url(#${id})`} />
      </svg>
    </div>
  );
}
