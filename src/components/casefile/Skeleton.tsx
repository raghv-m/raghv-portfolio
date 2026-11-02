import type { CSSProperties } from "react";

/**
 * One skeleton block: a flat ink wash in the shape of the content it stands
 * in for, pulsing on a hard two-step cycle (see .cf-skel in ux-pass.css).
 * Loading states are built from these so they mirror the real layout
 * instead of spinning. Decorative by definition: aria-hidden, with the
 * loading announcement carried by the parent (role="status" / sr-only).
 */
export function Skel({
  w,
  h,
  style,
  className = "",
}: {
  w?: number | string;
  h?: number | string;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`cf-skel ${className}`}
      style={{ width: w, height: h, ...style }}
    />
  );
}

/** The inner-page head mirrored in blocks: kicker, display title, lede. */
export function SkelPageHead() {
  return (
    <div style={{ paddingTop: 56 }}>
      <Skel w={150} h={12} />
      <Skel w="min(520px, 82%)" h={54} style={{ marginTop: 18 }} />
      <Skel w="min(640px, 100%)" h={14} style={{ marginTop: 22 }} />
      <Skel w="min(480px, 76%)" h={14} style={{ marginTop: 9 }} />
    </div>
  );
}
