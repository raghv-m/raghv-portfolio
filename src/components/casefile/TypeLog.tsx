"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A captured log, presented as a terminal window: square window controls, the
 * capture's filename as the title, a REC marker, and a blinking block cursor
 * at the end of the stream. When it scrolls into view, the lines type in one
 * by one (visibility toggles, so the panel never changes height while
 * typing). All lines are in the DOM from the server render; reduced motion
 * shows the whole capture at once, cursor steady.
 */
export function TypeLog({
  head,
  headRight,
  lines,
  title = "wazuh — docker-soc — alerts.log",
  className = "",
}: {
  head: ReactNode;
  headRight?: ReactNode;
  lines: ReactNode[];
  title?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(lines.length);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || started.current) return;
        started.current = true;
        setShown(0);
        let i = 0;
        const timer = setInterval(() => {
          i += 1;
          setShown(i);
          if (i >= lines.length) clearInterval(timer);
        }, 130);
        io.disconnect();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className={`cf-term ${className}`}>
      <div className="cf-term-bar">
        <span className="cf-term-btns" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="cf-term-title">{title}</span>
        <span className="cf-term-rec" aria-hidden="true">
          <i />
          Rec
        </span>
      </div>
      <div className="cf-term-status">
        <span>{head}</span>
        {headRight && <span>{headRight}</span>}
      </div>
      <div className="cf-term-body">
        {lines.map((line, i) => (
          <div
            key={i}
            className="cf-log-line"
            style={{
              opacity: i < shown ? 1 : 0,
              visibility: i < shown ? "visible" : "hidden",
              transition: "opacity 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          >
            {line}
          </div>
        ))}
        <div className="cf-log-line" aria-hidden="true">
          <span className="cf-cursor" />
        </div>
      </div>
    </div>
  );
}
