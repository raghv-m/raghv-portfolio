"use client";

import { type CSSProperties, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

/**
 * Pointer tilt for case cards: the wrapped card leans toward the pointer
 * on a spring, up to `maxX` degrees around the X axis and `maxY` around
 * the Y axis, and settles flat on leave. The angles stay small on
 * purpose: the cards carry hard offset shadows and flat fills, and a
 * deep tilt would break the poster's flat press language. The transform
 * lives on this wrapper, so the card's own hover press (.cf-panel) and
 * spotlight (SpotWrap) compose untouched. Mouse pointers only; reduced
 * motion renders a plain wrapper and nothing ever tilts.
 */
export function TiltWrap({
  children,
  maxX = 3,
  maxY = 4,
  className = "",
  style,
}: {
  children: ReactNode;
  /** Max lean in degrees around the X axis (pointer above/below centre). */
  maxX?: number;
  /** Max lean in degrees around the Y axis (pointer left/right of centre). */
  maxY?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(my, { stiffness: 260, damping: 22, mass: 0.6 });
  const rotateY = useSpring(mx, { stiffness: 260, damping: 22, mass: 0.6 });

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    mx.set(Math.max(-1, Math.min(1, nx)) * maxY);
    my.set(Math.max(-1, Math.min(1, -ny)) * maxX);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  if (reduce) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={{ transformPerspective: 900, rotateX, rotateY, ...style }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </motion.div>
  );
}
