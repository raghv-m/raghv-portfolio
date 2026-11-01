"use client";

import { useEffect, useState } from "react";

/**
 * Live local clock for the dossier strip: the VISITOR's own time, ticking
 * once a second, in mono. It sits next to the theme toggle on purpose — the
 * auto theme follows this same clock (light 07:00–19:00 local). Renders a
 * placeholder until mounted so server and client HTML agree.
 */
export function LiveClock() {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, "0");
      setNow(`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="cf-mono cf-clock hidden sm:inline-flex items-center gap-2 uppercase"
      style={{ letterSpacing: "0.09em" }}
      title="Your local time — the automatic theme follows it"
    >
      <span style={{ color: "var(--cf-muted)" }}>Local</span>
      <span style={{ minWidth: 62, display: "inline-block" }}>{now ?? "--:--:--"}</span>
    </span>
  );
}
