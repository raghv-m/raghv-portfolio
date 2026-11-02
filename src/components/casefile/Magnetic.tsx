"use client";

import { type CSSProperties, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

/**
 * Magnetic pull for primary actions: the wrapped element is drawn toward
 * the pointer with a real spring (stiffness/damping tuned for the Apple
 * overshoot-and-settle feel), travelling up to `strength` px at the
 * element's edge — large enough to SEE, not just measure. On leave the
 * spring releases it home. Mouse pointers only (touch never engages), and
 * reduced motion disables it entirely. The transform lives on this wrapper
 * span, so the child's own hover/press states (e.g. .cf-btn's scale)
 * compose untouched.
 */
export function Magnetic({
  children,
  strength = 16,
  className = "",
  style,
}: {
  children: ReactNode;
  /** Max pull in px at the element's edge. Apple-grade: 14-18. */
  strength?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  // Apple's spring parameterization (duration + bounce), Emil Kowalski's
  // recommended config for decorative pointer tracking: a whisper of
  // overshoot (bounce 0.2) because the pointer "threw" the value there.
  // Springs carry velocity through interruptions — grabbing the button
  // mid-flight never restarts from zero, unlike a CSS transition.
  const x = useSpring(mx, { duration: 0.5, bounce: 0.2 });
  const y = useSpring(my, { duration: 0.5, bounce: 0.2 });

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    mx.set(Math.max(-1, Math.min(1, dx)) * strength);
    my.set(Math.max(-1, Math.min(1, dy)) * strength);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.span
      className={className}
      style={{ display: "inline-block", x, y, ...style }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </motion.span>
  );
}
