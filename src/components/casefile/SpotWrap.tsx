"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Pointer spotlight for document surfaces: feeds the pointer position into
 * the --mx/--my custom properties that .cf-spot::before paints with. The
 * wash renders behind the content (see case-file.css), so it can never wash
 * out text. Mouse only; the CSS hides the layer for coarse pointers and
 * reduced motion.
 */
export function SpotWrap({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty("--mx", `${x.toFixed(0)}px`);
      el.style.setProperty("--my", `${y.toFixed(0)}px`);
    });
  };

  return (
    <div ref={ref} className={`cf-spot ${className}`} style={style} onPointerMove={onMove}>
      {children}
    </div>
  );
}
