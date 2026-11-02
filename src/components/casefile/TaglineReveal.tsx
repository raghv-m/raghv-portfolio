"use client";

import { useEffect, useRef, useState } from "react";

/*
 * U3 (upscale pass): the one cinematic moment the redesign skill allows.
 * A full-bleed ink band between the price machine and Credentials. The
 * tagline's words sit at 30% opacity and activate one at a time, in
 * reading order, as the band crosses a trigger line at 65% of the
 * viewport height, driven by a rAF-throttled scroll check. The hot word
 * lands in red. Reduced motion (and no-JS / SSR) renders the final text:
 * the initial state is fully active and JS only mutes words that have
 * not crossed the line yet.
 */

type Word = { text: string; hot?: boolean };

const LINES: Word[][] = [
  [{ text: "A" }, { text: "website" }, { text: "is" }, { text: "a" }, { text: "perimeter." }],
  [
    { text: "Build" },
    { text: "it" },
    { text: "like" },
    { text: "you" },
    { text: "mean" },
    { text: "to" },
    { text: "defend", hot: true },
    { text: "it." },
  ],
];

const TOTAL = LINES.reduce((n, line) => n + line.length, 0);

export function TaglineReveal() {
  const ref = useRef<HTMLElement>(null);
  // Final state by default: no-JS, SSR and reduced motion all show the
  // completed line. The effect below only ever *reduces* this count for
  // words still below the trigger line.
  const [active, setActive] = useState(TOTAL);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const line = window.innerHeight * 0.65;
      const progress = Math.min(1, Math.max(0, (line - rect.top) / Math.max(rect.height, 1)));
      setActive(Math.round(progress * TOTAL));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  let index = 0;
  return (
    <section
      ref={ref}
      className="cf-tagline"
      aria-label="A website is a perimeter. Build it like you mean to defend it."
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}
    >
      <div className="cf-wrap py-14 sm:py-20" aria-hidden="true">
        <p className="cf-mono cf-fs-label uppercase mb-6" style={{ letterSpacing: "0.14em", color: "var(--cf-red)" }}>
          The position
        </p>
        <p className="cf-display" style={{ fontSize: "clamp(30px, 4.6vw, 54px)", lineHeight: 1.18 }}>
          {LINES.map((line, li) => (
            <span key={li} className="block">
              {line.map((word) => {
                const i = index++;
                return (
                  <span key={i}>
                    <span
                      className="cf-tagline-word"
                      data-on={i < active ? "true" : undefined}
                      data-hot={word.hot ? "true" : undefined}
                    >
                      {word.text}
                    </span>{" "}
                  </span>
                );
              })}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
