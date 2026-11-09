"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { EASE_OUT } from "@/components/casefile/motion";
import { bootLoaderWillPlay, markBootSeen } from "./bootGate";

/**
 * Boot loader for the home page only (mounted from src/app/page.tsx).
 *
 * A black console in the site's own style: three mono red lines land in
 * sequence while a poster-scale counter runs 0 to 100, then a red panel
 * wipes the overlay up and off the hero. Total time on screen is capped
 * at ~1.4s before the wipe starts; the wipe itself takes ~0.7s.
 *
 * It is an overlay, never a gate: it renders nothing on the server and
 * nothing at all until its mount effect decides to play, the page under
 * it renders normally from the first byte, and it plays at most once per
 * browser session (sessionStorage "rv-boot-seen", written on exit).
 * Clicking anywhere skips. Under prefers-reduced-motion it never plays.
 * Decorative by design: aria-hidden throughout.
 */
const LINES = [
  "SOC LAB FEED: CONNECTED",
  "RULES LOADED: 5710 / 5712",
  "STATUS: MONITORING",
];

/** Counter + lines finish inside this window; the hard cap below is the
 *  most the overlay can sit before the wipe starts. */
const RUN_MS = 1100;
const HARD_CAP_MS = 1350;

export function BootLoader() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);
  const [count, setCount] = useState(0);
  const [linesShown, setLinesShown] = useState(0);
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    markBootSeen();
    setShow(false);
  }, []);

  useEffect(() => {
    if (reduce) return;
    if (!bootLoaderWillPlay()) return;
    setShow(true);
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / RUN_MS);
      // Ease-out-expo counter: fast off the line, settles onto 100.
      const eased = t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setCount(Math.round(eased * 100));
      setLinesShown(Math.min(LINES.length, Math.floor((now - start) / 240)));
      if (t < 1) raf = requestAnimationFrame(step);
      else finish();
    };
    raf = requestAnimationFrame(step);
    const hard = setTimeout(finish, HARD_CAP_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hard);
    };
  }, [reduce, finish]);

  // Hold the page still while the console is up (never longer than the
  // loader itself); the content underneath is rendered and laid out
  // normally the whole time.
  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* The red panel trails the black one by 90ms on exit, so the
              wipe that reveals the hero has a red edge. */}
          <motion.div
            key="rv-boot-red"
            className="rv-boot-panel"
            style={{ background: "var(--red)", zIndex: 890 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.09 }}
            aria-hidden="true"
          />
          <motion.div
            key="rv-boot"
            className="rv-boot-panel"
            style={{ background: "#0A0A0A", zIndex: 900 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            onClick={finish}
            role="presentation"
            aria-hidden="true"
          >
            <div className="absolute left-5 top-6 sm:left-10 sm:top-10">
              <p
                className="cf-mono uppercase"
                style={{ color: "#9A968C", fontSize: 11, letterSpacing: "0.22em" }}
              >
                raghv.dev — SOC console
              </p>
              <div
                className="cf-mono uppercase"
                style={{ color: "var(--red)", fontSize: 13, letterSpacing: "0.14em", marginTop: 18, lineHeight: 2.1 }}
              >
                {LINES.map((line, i) => (
                  <p
                    key={line}
                    style={{
                      opacity: i < linesShown ? 1 : 0,
                      transform: i < linesShown ? "translateY(0)" : "translateY(8px)",
                      transition: "opacity 0.25s ease, transform 0.25s ease",
                    }}
                  >
                    <span style={{ color: "#F5F5F5" }}>&gt;</span> {line}
                  </p>
                ))}
              </div>
            </div>

            <div className="absolute inset-x-5 bottom-8 flex items-end justify-between sm:inset-x-10 sm:bottom-10">
              <p
                className="cf-mono uppercase"
                style={{ color: "#9A968C", fontSize: 11, letterSpacing: "0.22em" }}
              >
                Loading case file
                <br />
                <span style={{ color: "#5C594F" }}>Click anywhere to skip</span>
              </p>
              <p
                className="cf-display"
                style={{ fontSize: "clamp(84px, 16vw, 168px)", lineHeight: 0.85, color: "#F5F5F5" }}
                aria-hidden="true"
              >
                {count}
                <span style={{ color: "var(--red)" }}>%</span>
              </p>
            </div>

            {/* Progress hairline, driven by the same counter. */}
            <div
              style={{
                position: "absolute",
                left: 0,
                bottom: 0,
                height: 3,
                width: `${count}%`,
                background: "var(--red)",
              }}
              aria-hidden="true"
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
