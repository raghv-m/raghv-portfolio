"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { ProgIndicator } from "./Prog";

/**
 * A rubber stamp. Every instance carries its own rotation, scale, opacity and
 * border weight (passed by the caller, always different) so stamps never read
 * as cloned components. With slam on, it stamps in when scrolled into view:
 * drops from 1.7x with a slight overshoot and settles at its resting angle.
 */
export function Stamp({
  children,
  tone = "red",
  r,
  s = 1,
  o = 0.9,
  bw = 2.5,
  slam = true,
  delay = 0,
  live = false,
  className = "",
}: {
  children: ReactNode;
  tone?: "red" | "gold" | "green" | "ink";
  r: number;
  s?: number;
  o?: number;
  bw?: number;
  slam?: boolean;
  delay?: number;
  /** In-progress stamps (SC-200 and friends) carry a ticking indicator. */
  live?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !slam) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("cf-in");
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          timer = setTimeout(() => el.classList.add("cf-in"), delay);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    const safety = setTimeout(() => el.classList.add("cf-in"), 3000 + delay);
    return () => {
      io.disconnect();
      clearTimeout(timer);
      clearTimeout(safety);
    };
  }, [slam, delay]);

  return (
    <span
      ref={ref}
      className={`cf-stamp cf-stamp-${tone} ${slam ? "cf-stamp-slam" : ""} ${className}`}
      style={
        {
          "--r": `${r}deg`,
          "--s": s,
          "--o": o,
          "--bw": `${bw}px`,
          ...(slam ? {} : { opacity: o }),
        } as React.CSSProperties
      }
    >
      {children}
      {live && <ProgIndicator />}
    </span>
  );
}
