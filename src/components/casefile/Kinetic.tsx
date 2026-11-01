"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Kinetic type for the hero name: the wrapped headline leans a few pixels
 * toward the pointer (with a whisper of skew) and drifts up slightly as the
 * page starts to scroll. Always readable — the whole effect lives inside
 * ±6px and half a degree. Mouse only; reduced motion leaves it static.
 * Transforms apply to this wrapper, never to the cf-load spans inside, so
 * the entrance choreography is untouched.
 */
export function Kinetic({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0, s: 0 });
  const raf = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const apply = () => {
      raf.current = 0;
      const { x, y, s } = pos.current;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${(y + s).toFixed(1)}px, 0) skewX(${(-x * 0.09).toFixed(2)}deg)`;
    };
    const queue = () => {
      if (!raf.current) raf.current = requestAnimationFrame(apply);
    };
    const onScroll = () => {
      pos.current.s = -Math.min(window.scrollY * 0.045, 18);
      queue();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    pos.current.x = ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * 5;
    pos.current.y = ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * 3.5;
    el.style.transition = "transform 160ms var(--cf-ease)";
    el.style.transform = `translate3d(${pos.current.x.toFixed(1)}px, ${(pos.current.y + pos.current.s).toFixed(1)}px, 0) skewX(${(-pos.current.x * 0.09).toFixed(2)}deg)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    pos.current.x = 0;
    pos.current.y = 0;
    el.style.transition = "transform 500ms var(--cf-ease-spring)";
    el.style.transform = `translate3d(0px, ${pos.current.s.toFixed(1)}px, 0) skewX(0deg)`;
  };

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </div>
  );
}
