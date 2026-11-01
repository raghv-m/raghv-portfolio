"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Scroll reveal: content rises 18px and fades in with the shared Apple easing
 * when it enters the viewport. The hidden pre-state is applied from JS only
 * (data-cf="pre"), so server renders and no-JS visits stay fully visible, and
 * a safety timer guarantees nothing can stay hidden. Reduced motion shows
 * everything immediately.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  id,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  id?: string;
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
      style={{ "--cf-d": `${delay}s` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
