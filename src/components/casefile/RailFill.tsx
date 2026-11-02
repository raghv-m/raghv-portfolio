"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * The red read-line for a storyboard rail (.cf-tl). It fills the rail from
 * the top down to the reader's position, anchored at 72% of the viewport,
 * spring-damped so it settles rather than snapping. Because it is driven
 * by scroll position it reverses the moment the reader scrolls back up —
 * nothing locks or waits. Under prefers-reduced-motion it renders fully
 * filled and still (the finished state).
 */
export function RailFill() {
  const ref = useRef<HTMLSpanElement>(null);
  const raw = useMotionValue(0);
  const smooth = useSpring(raw, { stiffness: 110, damping: 26, mass: 0.4 });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    if (reduce) {
      raw.set(1);
      return;
    }
    let raf = 0;
    const update = () => {
      const r = host.getBoundingClientRect();
      const anchor = window.innerHeight * 0.72;
      const p = (anchor - r.top) / Math.max(r.height, 1);
      raw.set(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [raw, reduce]);

  return (
    <motion.span
      ref={ref}
      className="cf-rail-fill"
      style={{ scaleY: reduce ? raw : smooth }}
      aria-hidden="true"
    />
  );
}
