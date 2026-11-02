"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";

/**
 * Layered parallax for exhibit pieces, Apple-page scale: as the layer
 * crosses the viewport it travels `range` px in each direction — a total
 * differential of 2 × range (56-68px at the call sites) against the page,
 * smoothed by a spring so the file feels physical, not mechanical.
 * Transform-only. Desktop/tablet only (min-width 768px): small screens
 * keep the calmer, cheaper scroll. Reduced motion disables it completely
 * (plain wrapper, content untouched).
 */
export function ParallaxLayer({
  children,
  range = 30,
  invert = false,
  className = "",
  style,
}: {
  children: ReactNode;
  /** Half-travel in px: the layer moves +range → -range across the viewport. */
  range?: number;
  /** Reverse the travel direction (layers moving against the others). */
  invert?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(mq.matches && !rm.matches);
    update();
    mq.addEventListener("change", update);
    rm.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      rm.removeEventListener("change", update);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const raw = useTransform(
    scrollYProgress,
    [0, 1],
    invert ? [-range, range] : [range, -range],
  );
  // Critically damped tracking spring: the layer glues itself to scroll
  // position with a physical lag, never oscillating past it. Apple's
  // default for repositioning is damping ratio 1.0; here that is
  // stiffness 90 / damping 19 (ζ = 19 / 2√90 ≈ 1.00). NOTE: framer's
  // duration-based form ({ duration, bounce: 0 }) failed to track
  // scroll-linked source values in this build — measured differential
  // was 0px — so the stiffness form carries the same physics.
  const y = useSpring(raw, { stiffness: 90, damping: 19, mass: 1 });
  const zero = useMotionValue(0);

  // ONE persistent motion node in both modes. Swapping a plain div for a
  // motion.div when the enable gate flips after mount left framer's
  // target-bound useScroll measuring a dead node — the layer froze at its
  // end value (measured: stuck at -30px). Gating the VALUE instead of
  // the element keeps the scroll binding alive.
  return (
    <motion.div ref={ref} className={className} style={{ ...style, y: enabled ? y : zero }}>
      {children}
    </motion.div>
  );
}
