"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A number that counts up when it scrolls into view: 1.3s, cubic ease-out,
 * triggered once. The server render (and no-JS, and reduced motion) shows
 * the final value, so the fact is never wrong on the page; the animation
 * is layered on top for JS visitors with motion allowed.
 */
export function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1300,
  className = "",
  style,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVal(to);
      return;
    }
    setVal(0);
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const t0 = performance.now();
        const step = (t: number) => {
          const p = Math.min(1, (t - t0) / duration);
          setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  return (
    <span ref={ref} className={`cf-countup ${className}`} style={style}>
      {prefix}
      {val.toLocaleString("en-CA")}
      {suffix}
    </span>
  );
}
