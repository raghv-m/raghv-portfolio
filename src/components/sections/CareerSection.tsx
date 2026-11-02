"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Reveal } from "@/components/casefile/Reveal";
import { Stamp } from "@/components/casefile/Stamp";
import { EASE_OUT } from "@/components/casefile/motion";
import { NODES, SKILLS, CERTS } from "@/components/sections/careerData";

/**
 * The career roadmap, merged into /experience (round 2). Formerly the whole
 * /career page; /career now redirects here. Markers are dossier-native —
 * numbered mono labels, rules and stamps; the old lucide glyph set (star,
 * crosshair, chevrons) was removed at the subject's request.
 *
 * The roadmap data (NODES, SKILLS, CERTS) lives in careerData.ts, shared
 * with the /roadmap progression board (audit-fix pass).
 */

const STATUS_STYLE = {
  CURRENT: { border: "rgba(173,1,23,0.55)", bg: "rgba(173,1,23,0.06)", text: "var(--gold)", dot: "var(--gold)" },
  NEXT: { border: "rgba(20,20,20,0.5)", bg: "rgba(20,20,20,0.05)", text: "var(--cf-ink)", dot: "var(--cf-ink)" },
  PLANNED: { border: "rgba(107,103,94,0.4)", bg: "rgba(107,103,94,0.04)", text: "var(--blue)", dot: "var(--blue)" },
  GOAL: { border: "rgba(173,1,23,0.6)", bg: "rgba(173,1,23,0.08)", text: "var(--gold)", dot: "var(--gold)" },
  VISION: { border: "rgba(126,1,17,0.3)", bg: "rgba(126,1,17,0.04)", text: "var(--gold-muted)", dot: "var(--gold-muted)" },
};

/* Status stamps: each node that earns one gets its own rotation, scale,
   opacity and border weight, keyed by node index. */
const STAMP_R = [-3.4, 1.8, -2.2, -5.2, 0.9];
const STAMP_S = [1.05, 0.97, 1.0, 1.08, 0.94];
const STAMP_O = [0.94, 0.88, 0.9, 0.92, 0.85];
const STAMP_BW = [2.5, 3.0, 2.2, 3.4, 2.8];
const STAMP_TONE: Record<string, "red" | "gold" | "green" | "ink"> = {
  CURRENT: "red",
  NEXT: "gold",
  GOAL: "red",
};

function NodeGraph() {
  const [expanded, setExpanded] = useState<string | null>("current");

  const NODE_HEIGHT = 160; // approx px per node for SVG calculations
  const SVG_H = NODES.length * NODE_HEIGHT;

  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Ruled connecting line, positioned absolute behind content */}
      <svg
        className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none hidden sm:block"
        width="2"
        height={SVG_H}
        style={{ zIndex: 0 }}
        aria-hidden="true"
      >
        <line
          x1="1"
          y1="0"
          x2="1"
          y2={SVG_H}
          stroke="var(--cf-faint)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
      </svg>

      <div className="space-y-4 relative z-10">
        {NODES.map((node, i) => {
          const style = STATUS_STYLE[node.status];
          const isExpanded = expanded === node.id;
          const isCurrent = node.status === "CURRENT";
          const isGoal = node.status === "GOAL";
          const stampText = node.badge ?? (node.status === "NEXT" ? "NEXT" : null);

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: EASE_OUT }}
            >
              {/* Node connector marker (desktop center) */}
              <div className="hidden sm:flex justify-center mb-2">
                <div
                  className="w-3 h-3 z-20 relative"
                  style={{
                    background: isCurrent ? "var(--cf-red)" : "var(--cf-paper)",
                    border: "2px solid var(--cf-ink)",
                  }}
                />
              </div>

              {/* Card */}
              <button
                onClick={() => setExpanded(isExpanded ? null : node.id)}
                className="w-full text-left overflow-hidden transition-all"
                style={{
                  border: isCurrent || isGoal ? "2px solid var(--cf-ink)" : "1px solid var(--cf-faint)",
                  background: isCurrent ? "var(--cf-paper-2)" : "transparent",
                }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span
                          className="cf-mono cf-fs-data tracking-widest px-2 py-0.5"
                          style={{ color: style.text, background: "transparent", border: "1px solid var(--cf-faint)" }}
                        >
                          {node.label}
                        </span>
                        {stampText && (
                          <Stamp
                            tone={STAMP_TONE[node.status] ?? "ink"}
                            r={STAMP_R[i % STAMP_R.length]}
                            s={STAMP_S[i % STAMP_S.length]}
                            o={STAMP_O[i % STAMP_O.length]}
                            bw={STAMP_BW[i % STAMP_BW.length]}
                            delay={140 + i * 100}
                            className="cf-fs-data px-2 py-0.5"
                          >
                            {stampText}
                          </Stamp>
                        )}
                        <span className="cf-mono cf-fs-data text-[var(--cf-muted)] ml-auto">{node.timeline}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-[var(--cf-ink)]">{node.title}</h3>
                    </div>
                    {/* Dossier-native expand marker: a mono + / −, no glyph icon. */}
                    <span
                      className="cf-mono shrink-0 mt-0.5 text-[17px] leading-none select-none"
                      style={{ color: "var(--cf-red)", minWidth: 14, textAlign: "center" }}
                      aria-hidden="true"
                    >
                      {isExpanded ? "−" : "+"}
                    </span>
                  </div>

                  {/* Certs preview */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {node.certs.map((c) => (
                      <span key={c} className="tag cf-fs-data">{c}</span>
                    ))}
                  </div>
                </div>

                {/* Expanded panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE_OUT }}
                      className="overflow-hidden border-t"
                      style={{ borderColor: "var(--cf-faint)" }}
                    >
                      <div className="p-5 space-y-4">
                        <p className="text-[var(--cf-ink-soft)] text-sm leading-relaxed">{node.desc}</p>

                        <div>
                          <p className="cf-mono cf-fs-data tracking-wider mb-2" style={{ color: style.text }}>KEY SKILLS</p>
                          <div className="flex flex-wrap gap-1.5">
                            {node.skills.map((s) => <span key={s} className="tag">{s}</span>)}
                          </div>
                        </div>

                        <div className="cf-margin-note">
                          <p className="text-[13px] leading-relaxed" style={{ color: "var(--cf-ink)" }}>&ldquo;{node.note}&rdquo;</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Skills as evidence, not percentages (forensic-fix pass): the
 * self-assessed pct numbers and bars are gone. Each skill prints as a
 * label plus the one line of proof behind it, from careerData's SKILLS.
 */
function SkillEvidence() {
  return (
    <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-x-10 gap-y-6">
      {SKILLS.map((skill, i) => (
        <motion.div
          key={skill.name}
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05, ease: EASE_OUT }}
        >
          <p className="text-sm font-semibold text-[var(--cf-ink)]">{skill.name}</p>
          <p className="text-sm leading-relaxed mt-1" style={{ color: "var(--cf-ink-soft)" }}>{skill.evidence}</p>
        </motion.div>
      ))}
    </div>
  );
}

function CertTimeline() {
  const CERT_STYLE: Record<string, { bg: string; text: string; border: string }> = {
    DONE: { bg: "var(--cf-ink)", text: "var(--cf-paper)", border: "var(--cf-ink)" },
    IN_PROGRESS: { bg: "transparent", text: "var(--cf-gold)", border: "var(--cf-gold)" },
    PLANNED: { bg: "transparent", text: "var(--cf-muted)", border: "var(--cf-faint)" },
    GOAL: { bg: "var(--cf-paper-2)", text: "var(--cf-gold)", border: "var(--cf-gold)" },
    FUTURE: { bg: "transparent", text: "var(--cf-faint)", border: "var(--cf-faint)" },
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex items-center gap-0 min-w-max">
        {CERTS.map((cert, i) => {
          const s = CERT_STYLE[cert.status as keyof typeof CERT_STYLE];
          return (
            <div key={cert.abbr} className="flex items-center">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, ease: EASE_OUT }}
                className="flex flex-col items-center gap-2"
              >
                <div className="cf-mono cf-fs-data text-[var(--cf-muted)] text-center w-20">{cert.status.replace("_", " ")}</div>
                <div
                  className="w-16 h-16 flex flex-col items-center justify-center relative"
                  style={{
                    background: s.bg,
                    border: `1.5px solid ${s.border}`,
                  }}
                >
                  {/* The goal cert is marked with a red file square, not a star glyph. */}
                  {cert.star && (
                    <span
                      className="w-2 h-2 mb-1"
                      style={{ background: "var(--cf-red)" }}
                      aria-label="Primary goal"
                      role="img"
                    />
                  )}
                  <span className="cf-mono cf-fs-data font-bold text-center leading-tight" style={{ color: s.text }}>
                    {cert.abbr}
                  </span>
                </div>
                <div className="cf-mono cf-fs-data text-center w-20 leading-tight" style={{ color: s.text }}>{cert.name}</div>
              </motion.div>

              {/* Connector */}
              {i < CERTS.length - 1 && (
                <div className="w-6 h-px mx-1 shrink-0" style={{ background: "var(--cf-faint)" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CareerSection() {
  return (
    <>
      {/* Roadmap */}
      <section className="pt-20">
        <Reveal delay={0.05}>
          <div className="cf-sec-head relative">
            <p className="cf-kicker">Career roadmap</p>
            <h2 className="cf-h2 mt-2">The path from here</h2>
            <p className="cf-note mt-2">
              Every step has a purpose. Every cert, every lab, every late night. Click any node to expand.
            </p>
            <Stamp
              tone="gold"
              r={-2.9}
              s={1.05}
              o={0.89}
              bw={2.8}
              delay={300}
              className="absolute -top-5 right-2 sm:right-8 cf-fs-label"
            >
              Filed plan
            </Stamp>
          </div>
        </Reveal>
        <div
          className="inline-flex items-center gap-2.5 px-5 py-2 mb-12"
          style={{ background: "var(--cf-paper-2)", border: "2px solid var(--cf-ink)" }}
        >
          <span className="w-2.5 h-2.5 flex-none" style={{ background: "var(--cf-red)" }} aria-hidden="true" />
          <span className="cf-mono cf-fs-label tracking-wider" style={{ color: "var(--cf-ink)" }}>OSCP IS THE NORTH STAR</span>
        </div>
        <NodeGraph />
      </section>

      {/* Skills as evidence lines (forensic-fix: percentages removed) */}
      <section className="pt-20">
        <Reveal delay={0.05}>
          <div className="cf-sec-head">
            <p className="cf-kicker">Current proficiency</p>
            <h2 className="cf-h2 mt-2">Skills, with the evidence</h2>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <SkillEvidence />
        </Reveal>
      </section>

      {/* Cert timeline */}
      <section className="pt-20">
        <Reveal delay={0.05}>
          <div className="cf-sec-head">
            <p className="cf-kicker">Certification stack</p>
            <h2 className="cf-h2 mt-2">The Cert Timeline</h2>
            <p className="cf-note mt-2">OSCP is the milestone that changes the trajectory.</p>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <CertTimeline />
        </Reveal>
      </section>

      {/* CTA */}
      <Reveal delay={0.05}>
        <section className="pt-16 mt-4" style={{ borderTop: "2px solid var(--cf-ink)" }}>
          <h2 className="cf-h2 mb-4">
            Currently targeting <span className="cf-u-red">SOC Analyst roles</span>
          </h2>
          <p className="cf-body mb-8 max-w-md">
            Edmonton, AB. Open to remote and relocation. Every role on this path is a step toward OSCP and beyond.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="cf-btn">Get in Touch</Link>
            <Link href="/cybersecurity#home-lab" className="cf-btn-ghost">See the Lab</Link>
          </div>
        </section>
      </Reveal>
    </>
  );
}
