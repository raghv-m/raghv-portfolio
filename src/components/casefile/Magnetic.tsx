"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Magnetic pull for primary actions: the wrapped element leans a few pixels
 * toward the pointer while it hovers nearby, then springs back on leave.
 * Mouse pointers only (touch never engages), and reduced motion disables it
 * entirely. The transform lives on this wrapper span, so the child's own
 * hover/press states (e.g. .cf-btn's scale) compose untouched.
 */
export function Magnetic({
  children,
  strength = 6,
  className = "",
  style,
}: {
  children: ReactNode;
  /** Max pull in px at the element's edge. Keep small: 3-7. */
  strength?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const raf = useRef(0);
  const reduced = useRef<boolean | null>(null);

  const isReduced = () => {
    if (reduced.current === null) {
      reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return reduced.current;
  };

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || isReduced()) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.transition = "transform 120ms var(--cf-ease)";
      el.style.transform = `translate(${(dx * strength).toFixed(1)}px, ${(dy * strength).toFixed(1)}px)`;
    });
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    el.style.transition = "transform 450ms var(--cf-ease-spring)";
    el.style.transform = "translate(0px, 0px)";
  };

  return (
    <span
      ref={ref}
      className={className}
      style={{ display: "inline-block", ...style }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </span>
  );
}
