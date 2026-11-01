"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Layered parallax for exhibit pieces: the wrapped layer drifts a few pixels
 * against the scroll so the file feels physical — photo, tape and panels at
 * slightly different rates. Transform-only, rAF-throttled, and only while the
 * layer is near the viewport (IntersectionObserver gate).
 *
 * Desktop/tablet only (min-width 768px): small screens keep the calmer,
 * cheaper scroll. Reduced motion disables it completely.
 */
export function ParallaxLayer({
  children,
  speed = 0.04,
  className = "",
  style,
}: {
  children: ReactNode;
  /** Fraction of the layer's distance-from-centre to travel. 0.02-0.06. */
  speed?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;

    let raf = 0;
    let visible = false;
    const update = () => {
      raf = 0;
      if (!visible) return;
      const r = el.getBoundingClientRect();
      const delta = r.top + r.height / 2 - window.innerHeight / 2;
      const ty = Math.max(-24, Math.min(24, -delta * speed));
      el.style.transform = `translate3d(0, ${ty.toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        if (visible) onScroll();
      },
      { rootMargin: "25% 0px" },
    );
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = "";
    };
  }, [speed]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
