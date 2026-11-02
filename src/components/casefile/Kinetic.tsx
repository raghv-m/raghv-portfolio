"use client";

import { type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

/**
 * Kinetic type for the hero name, Apple-page scale: the headline follows
 * the pointer up to ±22px on real springs (overshoot, settle), and as the
 * page starts scrolling it drifts up 64px and scales down to 0.95 over the
 * first ~900px — the name visibly hands the stage over to the file below.
 * Two nested wrappers keep the two motions independent: outer owns scroll,
 * inner owns the pointer. Neither touches the cf-load spans inside, so the
 * entrance choreography is untouched. Mouse only; reduced motion = static.
 */
export function Kinetic({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();

  // Scroll hand-off: drift + shrink across the first viewport of travel.
  // Critically damped (damping ratio ≈ 1.0: stiffness 90 / damping 19):
  // continuous tracking must not overshoot — Apple's default for
  // repositioning motion. (Framer's duration-based spring form failed
  // to track scroll-linked sources in this build — the parallax layers
  // measured 0px of travel with it — so the stiffness form, same
  // physics, carries all scroll tracking here.)
  const { scrollY } = useScroll();
  const driftRaw = useTransform(scrollY, [0, 900], [0, -64]);
  const scaleRaw = useTransform(scrollY, [0, 900], [1, 0.95]);
  const drift = useSpring(driftRaw, { stiffness: 90, damping: 19, mass: 1 });
  const scale = useSpring(scaleRaw, { stiffness: 90, damping: 19, mass: 1 });

  // Pointer follow: same Apple-style spring as Magnetic (duration +
  // bounce 0.2) — decorative tracking may overshoot a touch.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { duration: 0.5, bounce: 0.2 });
  const y = useSpring(my, { duration: 0.5, bounce: 0.2 });
  const skewRaw = useTransform(x, (v) => -v * 0.06);
  const skew = useSpring(skewRaw, { duration: 0.5, bounce: 0.2 });

  if (reduce) {
    return <div>{children}</div>;
  }

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    mx.set(Math.max(-1, Math.min(1, dx)) * 22);
    my.set(Math.max(-1, Math.min(1, dy)) * 10);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div style={{ y: drift, scale, transformOrigin: "0% 50%" }}>
      <motion.div style={{ x, y, skewX: skew }} onPointerMove={onMove} onPointerLeave={onLeave}>
        {children}
      </motion.div>
    </motion.div>
  );
}
