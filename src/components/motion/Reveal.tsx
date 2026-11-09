"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

import { EASE_OUT } from "@/components/casefile/motion";

/**
 * Framer-motion scroll reveal for the home page's biggest sections,
 * layered inside the site's existing casefile Reveal system (which is
 * CSS/IntersectionObserver based): 40px of travel, a fade, 0.7s on the
 * shared expo-out curve, once, when a quarter of the block is in view.
 *
 * Degrades the same way the casefile system does: the hidden state only
 * exists after mount, so server renders and no-JS visits are fully
 * visible, and under prefers-reduced-motion the wrapper stays a plain
 * div forever. The optional sweep draws a red bar under the block on
 * the same trigger (used on section heads in place of an eyebrow rule).
 */
const itemV: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT, delay },
  }),
};

const sweepV: Variants = {
  hidden: { scaleX: 0 },
  show: (delay: number) => ({
    scaleX: 1,
    transition: { duration: 0.9, ease: EASE_OUT, delay: delay + 0.15 },
  }),
};

export function Reveal({
  children,
  className = "",
  delay = 0,
  sweep = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Draw a red scan bar under the block as it reveals. */
  sweep?: boolean;
}) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={sweep ? `relative ${className}` : className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      variants={itemV}
      custom={delay}
    >
      {children}
      {sweep && <motion.span className="rv-sweep" variants={sweepV} custom={delay} aria-hidden="true" />}
    </motion.div>
  );
}
