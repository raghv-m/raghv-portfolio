"use client";

import { useEffect, useState } from "react";

/**
 * The site mark: "RM BLOCK" (picked by the owner, Nov 2026). An ink block
 * carrying paper RM letters, with a red block offset behind it as a hard
 * shadow. The artwork lives in public/logo.svg (static) and
 * public/logo-animated.svg (the red shadow jumps between offsets in hard
 * steps, a 2.4s stepped loop, no easing); this component only chooses
 * which file to show, so swapping the mark site-wide means replacing
 * those two assets.
 *
 * The header passes `animated` and gets the moving mark, except under
 * prefers-reduced-motion, where it falls back to the static file.
 * Everywhere else (footer, and any non-header use) is static. The same
 * static artwork feeds the OG image and email headers via /logo.svg.
 */
export function Logo({
  size = 28,
  className = "",
  style,
  animated = false,
}: {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  animated?: boolean;
}) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (!animated) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [animated]);

  const src = animated && !reducedMotion ? "/logo-animated.svg" : "/logo.svg";

  return (
    // Plain img on purpose: the animated mark's motion lives inside the
    // SVG file itself, which only runs when loaded as an image.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className={className}
      style={style}
    />
  );
}
