"use client";

import { useEffect, useRef, type ReactNode } from "react";

// staggerDelay lives in ./stagger (no "use client") so server components can
// call it; re-exported here for convenience for other client components.
export { staggerDelay } from "./stagger";

/**
 * Scroll reveal: content travels 56px, settles from scale 0.96, and fades
 * in with the shared easing when it enters the viewport — large travel,
 * deliberately visible (the owner has rejected invisible animation twice).
 * The hidden pre-state is applied from JS only (data-cf="pre"), so server
 * renders and no-JS visits stay fully visible, and a safety timer
 * guarantees nothing can stay hidden. Reduced motion shows everything
 * immediately.
 *
 * Variants change only the pre-state pose: "rise" (default), "scale"
 * (deeper settle, from 0.92), "left" (slides from -56px on the x axis,
 * the index-row direction), "wipe" (clip-path uncover left-to-right with
 * a -40px slide, for section heads).
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  id,
  variant = "rise",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  id?: string;
  variant?: "rise" | "scale" | "left" | "wipe";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.cf = "in";
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      const raf = requestAnimationFrame(() => {
        el.dataset.cf = "in";
      });
      return () => cancelAnimationFrame(raf);
    }
    el.dataset.cf = "pre";
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.dataset.cf = "in";
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    const safety = setTimeout(() => {
      el.dataset.cf = "in";
      io.disconnect();
    }, 3000);
    return () => {
      io.disconnect();
      clearTimeout(safety);
    };
  }, []);

  return (
    <div
      ref={ref}
      id={id}
      className={`cf-rv ${className}`}
      data-variant={variant === "rise" ? undefined : variant}
      style={{ "--cf-d": `${delay}s` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
