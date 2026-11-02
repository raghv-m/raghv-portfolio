"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Clock3 } from "lucide-react";

export type ThemeMode = "light" | "dark" | "auto";

const ORDER: ThemeMode[] = ["light", "dark", "auto"];
const KEY = "cf-theme";

/** Same rule as the pre-paint script: daytime (07:00-19:00 local) is light. */
export function autoTheme(): "light" | "dark" {
  const h = new Date().getHours();
  return h >= 7 && h < 19 ? "light" : "dark";
}

export function applyMode(mode: ThemeMode) {
  const root = document.documentElement;
  root.dataset.theme = mode === "auto" ? autoTheme() : mode;
  root.dataset.themeMode = mode;
  try {
    if (mode === "auto") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, mode);
  } catch {
    /* private mode: the choice just won't persist */
  }
}

/**
 * Cycles light, dark, auto. Auto follows the visitor's own clock (light from
 * 07:00 to 19:00 local, dark otherwise); a manual pick persists in
 * localStorage until cleared. Purely client-side: no backend involved.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<ThemeMode>("auto");

  useEffect(() => {
    const current = document.documentElement.dataset.themeMode;
    if (current === "light" || current === "dark" || current === "auto") setMode(current);
  }, []);

  const next = () => {
    const mode2 = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
    applyMode(mode2);
    setMode(mode2);
  };

  const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : Clock3;
  const label = mode === "light" ? "Light" : mode === "dark" ? "Dark" : "Auto";

  return (
    <button
      type="button"
      onClick={next}
      className={`cf-mono cf-theme-toggle inline-flex items-center gap-1.5 uppercase px-2 ${className}`}
      style={{ letterSpacing: "0.09em", fontSize: 10.5, minHeight: 36 }}
      aria-label={`Theme: ${label}. Activate to switch theme.`}
      title={`Theme: ${label} (tap to change)`}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
