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

  useEffect(() => {
    if (!storedChoice()) {
      const t = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(t);
    }
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
      className="cf-scope fixed bottom-0 left-0 right-0 z-[80]"
      style={{ borderTop: "2px solid var(--cf-ink)", background: "var(--cf-paper-2)", boxShadow: "0 -12px 32px rgba(0,0,0,0.18)" }}
    >
      <div className="cf-wrap flex flex-col gap-4 py-5 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <p className="cf-mono text-[10px] font-bold uppercase" style={{ letterSpacing: "0.14em", color: "var(--cf-red)" }}>
            Privacy choices
          </p>
          <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ color: "var(--cf-ink-soft)" }}>
            This site uses essential cookies to keep you signed in and stop spam, and analytics
            (Google Analytics via Tag Manager, and Vercel Analytics) that show me which pages get
            read. Record your choice here; the site works fully either way. Details in the{" "}
            <Link href="/cookies" className="cf-ulink">cookie policy</Link>.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button type="button" onClick={() => choose("accepted")} className="cf-btn" style={{ padding: "11px 20px", fontSize: 13.5 }}>
            Accept
          </button>
          <button type="button" onClick={() => choose("declined")} className="cf-btn-ghost" style={{ padding: "11px 20px", fontSize: 13.5 }}>
            Decline
          </button>
        </div>
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
