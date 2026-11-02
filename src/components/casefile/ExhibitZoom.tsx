"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

/**
 * Inner-image scroll choreography for exhibit frames: while the frame
 * crosses the viewport, the photograph inside it settles from scale 1.15
 * down to 1.0 and drifts 16px — the Apple product-page Ken Burns move.
 * The frame (a .cf-zoom-frame wrapper carrying the border/shadow classes)
 * crops the oversized image; transform-only, no layout shift. Reduced
 * motion renders the image at rest.
 */
export function ExhibitZoom({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Critically damped smoothing (stiffness 90 / damping 19, ratio ~1.0):
  // the image glides with scroll instead of locking to it mechanically.
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 19, mass: 1 });
  // The full 1.15 -> 1 sweep is mapped onto progress [0.55, 0.92] — the
  // window a hero exhibit actually traverses while it is on screen — so
  // the whole Ken Burns range plays during the scroll a visitor makes,
  // instead of spending half of it before the frame enters view. On
  // shorter viewports the frame enters below progress 0.55 and the full
  // clamped range plays from 1.15.
  const scale = useTransform(smooth, [0.55, 0.92], [1.15, 1]);
  const y = useTransform(smooth, [0.55, 0.92], [16, -16]);

  if (reduce) {
    return <div ref={ref}>{children}</div>;
  }
  return (
    <motion.div ref={ref} className="cf-zoom-inner" style={{ scale, y }}>
      {children}
    </motion.div>
  );
}
