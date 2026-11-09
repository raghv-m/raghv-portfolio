"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useAnimationControls, type Variants } from "framer-motion";

import { ProgIndicator } from "./Prog";
import { EASE_OUT } from "./motion";
import { bootLoaderWillPlay } from "../motion/bootGate";

/**
 * The HUD hero: the terminal readout card the owner picked, rebuilt in the
 * brutalist poster's colours. An ink panel in both themes carrying paper
 * mono readouts in its corners (name and role top-left, live status
 * top-centre, Edmonton coordinates and a ticking local clock top-right),
 * the subject's black-and-white headshot in a paper frame under scanlines,
 * a typed boot sequence, the name at poster scale, the section index, the
 * email on a solid red block, and the bio under a rule at the bottom.
 *
 * Motion: the boot lines type themselves on load, the block cursor
 * blinks, a red scan line sweeps the panel on an 8s loop, the clock and
 * the session timer tick once a second. On top of that, the entrance
 * choreography (feat/hero-animation-2026-11) rises the panel's blocks
 * in a framer-motion stagger timed to the home page's boot loader; see
 * heroItemV below. Under prefers-reduced-motion every line is printed
 * in full and nothing moves.
 *
 * Readouts stay honest: the meters use numbers printed elsewhere on this
 * site (TryHackMe SOC Level 1 at 65% is from the About narrative; SC-200
 * is "in progress", no invented percentage), the clock is the visitor's
 * own local time, and the session timer is real elapsed time on the page.
 */
const BOOT_LINES = [
  "> whoami .......... raghav mahajan",
  "> lab ............. 4-node wazuh soc — online",
  "> certs ........... security+ · isc2 cc — verified",
];

const NAV = [
  { no: "01", href: "/about", label: "About" },
  { no: "02", href: "/experience", label: "Experience" },
  { no: "03", href: "/portfolio", label: "Portfolio" },
  { no: "04", href: "/cybersecurity", label: "Cybersecurity" },
  { no: "05", href: "/estimate", label: "Get an estimate" },
  { no: "06", href: "/contact", label: "Contact" },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/* Entrance choreography (feat/hero-animation-2026-11): the panel's
   blocks rise 48px and fade in on the shared expo-out curve, staggered
   a tenth of a second apart, and the two name lines uncover inside
   clipped spans. Deliberately large travel: the owner has rejected
   invisible animation twice. The root renders with initial={false}, so
   server HTML and no-JS visits are fully visible; the hidden pose is
   only ever applied from the mount effect below, and never under
   prefers-reduced-motion. */
const heroContainerV: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const heroItemV: Variants = {
  hidden: { opacity: 0, y: 48 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE_OUT } },
};

const heroLineV: Variants = {
  hidden: { y: "112%" },
  show: { y: "0%", transition: { duration: 0.9, ease: EASE_OUT } },
};

function Meter({ label, on, note }: { label: string; on: number; note: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="cf-hud-dim">{label}</span>
      <span className="cf-meter" aria-hidden="true">
        <span className="on">{"▰".repeat(on)}</span>
        <span className="off">{"▱".repeat(10 - on)}</span>
      </span>
      <span style={{ color: "#F4F1EC" }}>{note}</span>
    </div>
  );
}

export function HudHero() {
  const [boot, setBoot] = useState(BOOT_LINES.join("\n"));
  const [clock, setClock] = useState("--:--:--");
  const [session, setSession] = useState("00:00:00");
  const heroControls = useAnimationControls();

  // Entrance timing: when the boot loader is playing (same session
  // predicate the loader itself uses, read before the loader writes its
  // flag on exit), the reveal holds ~1.15s so it starts as the wipe
  // lifts; on repeat visits it starts almost at once. Reduced motion
  // skips the hidden pose entirely and the panel is simply there.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const delay = bootLoaderWillPlay() ? 1.15 : 0.1;
    heroControls.set("hidden");
    void heroControls.start("show", { delay });
  }, [heroControls]);

  // Boot sequence: retype the readout lines once on load. SSR and
  // reduced-motion keep the full text from the initial state. Audit-fix:
  // the typing plays once per browser session — a return view in the same
  // session keeps the full text instead of retyping (the flag is set when
  // the sequence starts; storage failures just let it replay).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (window.sessionStorage.getItem("cf-hero-boot") === "1") return;
      window.sessionStorage.setItem("cf-hero-boot", "1");
    } catch {
      /* storage unavailable: play the sequence */
    }
    const full = BOOT_LINES.join("\n");
    let i = 0;
    setBoot("");
    const id = setInterval(() => {
      i += 1;
      setBoot(full.slice(0, i));
      if (i >= full.length) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, []);

  // Ticking readouts: the visitor's local clock and a real session timer.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = Date.now();
    const tick = () => {
      const d = new Date();
      setClock(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
      const s = Math.floor((Date.now() - start) / 1000);
      setSession(`${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`);
    };
    tick();
    if (reduced) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.section
      className="cf-hud"
      aria-label="Raghav Mahajan — readout"
      variants={heroContainerV}
      initial={false}
      animate={heroControls}
    >

      {/* ── Top strip: corner readouts ─────────────────────────────── */}
      <motion.div
        variants={heroItemV}
        className="grid gap-x-6 gap-y-2 px-5 py-4 sm:grid-cols-[1fr_auto_1fr] items-start"
        style={{ borderBottom: "2px solid #3A3A38" }}
      >
        <div className="cf-mono uppercase" style={{ letterSpacing: "0.14em" }}>
          <p className="text-[12.5px] font-bold" style={{ color: "#F4F1EC" }}>
            Raghav Mahajan
          </p>
          <p className="cf-hud-dim text-[10.5px] mt-1">Web developer + SOC analyst</p>
        </div>
        <p
          className="cf-mono uppercase cf-fs-label font-bold flex items-center gap-2.5"
          style={{ letterSpacing: "0.18em", color: "#F4F1EC" }}
          role="status"
        >
          <span
            className="cf-live-dot inline-block w-2 h-2 flex-none"
            style={{ background: "var(--cf-red)", color: "var(--cf-red)" }}
          />
          Status: Open to SOC roles
        </p>
        <div className="cf-mono uppercase sm:text-right" style={{ letterSpacing: "0.12em" }}>
          <p className="cf-fs-label" style={{ color: "#F4F1EC" }}>
            Edmonton 53.5461° N / 113.4938° W
          </p>
          <p className="cf-hud-dim text-[10.5px] mt-1">
            Local {clock} · Session {session}
          </p>
        </div>
      </motion.div>

      {/* ── Main deck: photograph | headline + index ───────────────── */}
      <div className="grid lg:grid-cols-[5fr_7fr]">
        <motion.div variants={heroItemV} className="p-5 sm:p-6">
          <div
            className="cf-scanlines"
            style={{ border: "3px solid #F4F1EC", boxShadow: "8px 8px 0 var(--cf-red)" }}
          >
            <Image
              src="/images/subject-photo.jpg"
              alt="Raghav Mahajan, black-and-white portrait"
              width={640}
              height={800}
              sizes="(max-width: 1024px) 100vw, 460px"
              className="grayscale contrast-125 block w-full"
              style={{ aspectRatio: "4 / 4.6", objectFit: "cover", objectPosition: "50% 32%" }}
              priority
            />
            <div className="cf-photo-scan" aria-hidden="true" />
          </div>
          <div className="cf-mono uppercase mt-6 space-y-2.5 text-[10.5px]" style={{ letterSpacing: "0.1em" }}>
            <p className="cf-hud-dim">Subject: Raghav Mahajan — Edmonton, AB</p>
            <Meter label="TryHackMe SOC L1" on={7} note="65%" />
            <div className="flex items-baseline justify-between gap-3">
              <span className="cf-hud-dim">Microsoft SC-200</span>
              <span style={{ color: "#F4F1EC" }}>
                In progress
                <ProgIndicator />
              </span>
            </div>
          </div>
        </motion.div>

        <div className="cf-hud-main p-5 sm:p-7 lg:py-7">
          {/* Boot readout */}
          <motion.div
            variants={heroItemV}
            className="cf-mono text-[12px] leading-[1.9]"
            style={{ color: "#9A968C", whiteSpace: "pre-wrap", minHeight: 84 }}
            aria-label={BOOT_LINES.join(". ")}
          >
            <span aria-hidden="true">{boot}</span>
            <span className="cf-cursor" aria-hidden="true" style={{ marginLeft: 6 }} />
          </motion.div>

          <motion.h1
            variants={heroItemV}
            className="cf-display"
            style={{ fontSize: "clamp(54px, 7.4vw, 106px)", lineHeight: 0.94, marginTop: 10, color: "#F4F1EC" }}
          >
            {/* Each line uncovers inside a clipped span. The padding /
                negative-margin pair gives the "g" descender room inside
                the clip box without moving the layout. */}
            <span className="block overflow-hidden" style={{ paddingBottom: "0.12em", marginBottom: "-0.12em" }}>
              <motion.span variants={heroLineV} className="block">
                Raghav
              </motion.span>
            </span>
            <span className="block overflow-hidden" style={{ paddingBottom: "0.12em", marginBottom: "-0.12em" }}>
              <motion.span variants={heroLineV} className="block" style={{ color: "var(--cf-red)" }}>
                Mahajan
              </motion.span>
            </span>
          </motion.h1>

          {/* J1 (forensic-fix pass, owner decision — reverses U1): the
              outcome line is SOC-first. Every fact in it is printed
              elsewhere on this page: the four-node Wazuh lab (bottom
              strip), the documented runs (homepage), and the open-to-SOC
              status (top strip). */}
          <motion.p variants={heroItemV} className="cf-lede" style={{ color: "#D8D3C6", marginTop: 18, maxWidth: "46ch" }}>
            I investigate attacks in a four-node home SOC lab and document every run. Open to SOC roles across Canada.
          </motion.p>

          <motion.nav variants={heroItemV} className="cf-hud-nav mt-7" aria-label="Sections">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}>
                <span className="cf-hud-nav-no">{item.no}</span>
                {/* U4: the label is wrapped so the hover slide can be an
                    inner translateX (a bare text node cannot transform). */}
                <span className="cf-hud-nav-label">{item.label}</span>
                <span className="cf-hud-nav-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </motion.nav>

          {/* J1 (forensic-fix pass, owner decision — reverses U1): ONE
              primary action, SOC-first. The filled block is now the
              featured investigation (LAB-001); the resume stays the ghost
              secondary; the estimator is demoted to the small mono text
              link the email used to occupy, so the business path stays
              one click away without competing. */}
          <motion.div variants={heroItemV} className="flex flex-wrap items-center gap-4 mt-8">
            <Link
              href="/investigations/lab-001-ssh-brute-force"
              className="cf-btn cf-btn-red"
              style={{ boxShadow: "5px 5px 0 #F4F1EC" }}
            >
              Read the investigation
            </Link>
            <a
              href="/resume.pdf"
              download="Raghav_Mahajan_Resume.pdf"
              className="cf-btn-ghost"
              style={{ borderColor: "#F4F1EC", color: "#F4F1EC", boxShadow: "5px 5px 0 var(--cf-red)" }}
            >
              Resume ↓
            </a>
            <Link
              href="/estimate"
              className="cf-mono font-bold text-[13.5px] uppercase"
              style={{
                color: "#F4F1EC",
                letterSpacing: "0.1em",
                textDecoration: "underline",
                textDecorationThickness: 2,
                textUnderlineOffset: 4,
              }}
            >
              Need a website? Run the estimator →
            </Link>
          </motion.div>
          <motion.p
            variants={heroItemV}
            className="cf-mono cf-hud-dim text-[10.5px] uppercase mt-5"
            style={{ letterSpacing: "0.1em" }}
          >
            ↑ Recruiters: the resume is one click. No form. No funnel.
          </motion.p>
        </div>
      </div>

      {/* ── Bottom strip: bio under a rule, then the data cells ────── */}
      <motion.div variants={heroItemV} className="px-5 sm:px-6 py-6" style={{ borderTop: "2px solid #3A3A38" }}>
        <p className="text-[15.5px] leading-[1.7] max-w-3xl" style={{ color: "#D8D3C6" }}>
          By day, Raghav builds websites for small businesses. By night, he hunts intruders in a home
          SOC lab. <span className="cf-u-red">Currently open to SOC analyst roles</span> anywhere in
          Canada.
        </p>
        <dl
          className="cf-mono uppercase grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4 mt-6 pt-5 text-[10.5px]"
          style={{ letterSpacing: "0.09em", borderTop: "1px solid #3A3A38" }}
        >
          <div>
            <dt className="cf-hud-dim">Subject</dt>
            <dd className="font-bold mt-1 normal-case text-[13px] tracking-normal" style={{ color: "#F4F1EC" }}>
              Raghav Mahajan
            </dd>
          </div>
          <div>
            <dt className="cf-hud-dim">Based</dt>
            <dd className="font-bold mt-1 normal-case text-[13px] tracking-normal" style={{ color: "#F4F1EC" }}>
              Edmonton, AB
            </dd>
          </div>
          <div>
            <dt className="cf-hud-dim">Languages</dt>
            <dd className="font-bold mt-1 normal-case text-[13px] tracking-normal" style={{ color: "#F4F1EC" }}>
              English, Hindi, Punjabi, Urdu
            </dd>
          </div>
          <div>
            <dt className="cf-hud-dim">Distinguishing marks</dt>
            <dd className="font-bold mt-1 normal-case text-[13px] tracking-normal" style={{ color: "#F4F1EC" }}>
              Runs a 4-node Wazuh lab at home
            </dd>
          </div>
        </dl>
      </motion.div>
    </motion.section>
  );
}
