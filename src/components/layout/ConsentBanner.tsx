"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const KEY = "cf-consent";
export const CONSENT_EVENT = "cf:open-consent";

type Choice = "accepted" | "declined";

function storedChoice(): Choice | null {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "accepted" || v === "declined") return v;
  } catch {
    /* storage unavailable */
  }
  const m = document.cookie.match(/(?:^|; )cf-consent=(accepted|declined)/);
  return m ? (m[1] as Choice) : null;
}

function saveChoice(choice: Choice) {
  try {
    localStorage.setItem(KEY, choice);
  } catch {
    /* the cookie below still records it */
  }
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${KEY}=${choice}; path=/; max-age=31536000; SameSite=Lax${secure}`;
}

/**
 * Privacy notice, shown on first visit and re-openable from the footer
 * ("Privacy choices"). The choice is recorded in localStorage and a cookie.
 * It never blocks the page: declining changes nothing about whether the site
 * works, and crawlers and readers always reach the content underneath.
 *
 * The copy describes the analytics that actually run on this site (Google
 * Tag Manager / Analytics and Vercel Analytics load regardless; this banner
 * records the visitor's choice, it does not gate those scripts).
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  // Deferred on purpose (PageSpeed, Nov 2026): the banner must never be the
  // largest paint or sit in the hero's way. It mounts only after the window
  // load event plus a beat, as a small corner card with no layout impact.
  useEffect(() => {
    if (storedChoice()) return;
    let t: ReturnType<typeof setTimeout>;
    const arm = () => {
      t = setTimeout(() => setVisible(true), 1400);
    };
    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm);
    return () => {
      window.removeEventListener("load", arm);
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    const open = () => setVisible(true);
    window.addEventListener(CONSENT_EVENT, open);
    return () => window.removeEventListener(CONSENT_EVENT, open);
  }, []);

  const choose = useCallback((choice: Choice) => {
    saveChoice(choice);
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Privacy choices"
      className="cf-scope fixed z-[80]"
      style={{
        right: "calc(16px + env(safe-area-inset-right, 0px))",
        bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
        width: "min(348px, calc(100vw - 32px))",
        border: "2.5px solid var(--cf-ink)",
        background: "var(--cf-paper-2)",
        boxShadow: "7px 7px 0 var(--cf-shadow)",
        padding: "14px 16px",
      }}
    >
      <p style={{ fontFamily: "var(--cf-caps)", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--cf-red)" }}>
        Privacy choices
      </p>
      <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: "var(--cf-ink-soft)" }}>
        Essential cookies, plus analytics (Google Analytics via Tag Manager, and Vercel
        Analytics) that run either way. Your choice is recorded; the site works fully
        regardless. <Link href="/cookies" className="cf-ulink">Cookie policy</Link>
      </p>
      <div className="flex items-center gap-2.5 mt-3">
        <button type="button" onClick={() => choose("accepted")} className="cf-btn" style={{ padding: "9px 16px", fontSize: 12.5, minHeight: 44 }}>
          Accept
        </button>
        <button type="button" onClick={() => choose("declined")} className="cf-btn-ghost" style={{ padding: "9px 16px", fontSize: 12.5, minHeight: 44 }}>
          Decline
        </button>
      </div>
    </div>
  );
}

/** Footer control that re-opens the banner so a choice can be changed. */
export function PrivacyChoicesButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(CONSENT_EVENT))}
      className="cf-mono text-[10.5px] uppercase cf-navlink"
      style={{ letterSpacing: "0.09em", color: "var(--cf-muted)" }}
    >
      Privacy choices
    </button>
  );
}
