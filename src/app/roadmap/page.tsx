import Link from "next/link";

import { PageHead } from "@/components/casefile/PageHead";
import { Reveal } from "@/components/casefile/Reveal";
import { Stamp } from "@/components/casefile/Stamp";
import { RailFill } from "@/components/casefile/RailFill";
import { NODES, ROADMAP_CERTS, type CareerNode, type CertEntry } from "@/components/sections/careerData";

/**
 * /roadmap (audit-fix pass): the career roadmap as a standalone
 * progression board, built from the same careerData that feeds the
 * roadmap section on /experience. States are translated into the
 * case-file system, never green/amber: DONE carries the ink stamp,
 * CURRENT / NEXT / IN PROGRESS carry the red live-dot pulse, and
 * PLANNED / GOAL / FUTURE / VISION sit in dashed outline panels.
 * Every state printed here is the state the record already carries.
 */

const LIVE_NODE_STATES = new Set(["CURRENT", "NEXT"]);

function LiveMarker({ label }: { label: string }) {
  return (
    <span className="cf-mono cf-fs-data tracking-widest inline-flex items-center gap-2" style={{ color: "var(--cf-red)" }}>
      <span
        className="cf-live-dot inline-block w-2 h-2 flex-none"
        style={{ background: "var(--cf-red)", color: "var(--cf-red)" }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

function NodePanel({ node, index, total }: { node: CareerNode; index: number; total: number }) {
  const live = LIVE_NODE_STATES.has(node.status);
  return (
    <div className="cf-tl-item" style={{ paddingBottom: index < total - 1 ? 34 : 0 }}>
      <span className="cf-tl-node" data-hot={live ? "true" : undefined} aria-hidden="true" />
      <div className="cf-tl-date">
        <p
          className="cf-display"
          style={{ fontSize: node.label.length > 4 ? 20 : 30, lineHeight: 1, color: live ? "var(--cf-red)" : "var(--cf-ink)" }}
        >
          {node.label}
        </p>
        <p className="cf-mono cf-fs-data mt-2" style={{ color: "var(--cf-red)" }}>
          STEP {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
        <p className="cf-mono cf-fs-data text-[var(--cf-muted)] mt-1">{node.timeline}</p>
      </div>

      <div
        className="cf-panel"
        data-hot={node.status === "CURRENT" ? "true" : undefined}
        style={
          live
            ? { border: "2px solid var(--cf-ink)", background: "var(--cf-paper-2)" }
            : { border: "2px dashed var(--cf-faint)", background: "transparent" }
        }
      >
        <div className="h-[3px] w-full" style={{ background: live ? "var(--cf-ink)" : "var(--cf-faint)" }} />
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            {live ? (
              <LiveMarker label={node.status} />
            ) : (
              <span className="cf-mono cf-fs-data tracking-widest" style={{ color: "var(--cf-muted)" }}>
                {node.status}
              </span>
            )}
            {node.badge && (
              <span
                className="cf-mono cf-fs-data tracking-widest px-2 py-0.5"
                style={{ color: "var(--cf-ink)", border: "1px solid var(--cf-faint)" }}
              >
                {node.badge}
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[var(--cf-ink)] leading-snug">{node.title}</h3>
          <p className="text-[var(--cf-ink-soft)] text-sm leading-relaxed mt-3">{node.desc}</p>

          <div className="flex flex-wrap gap-1.5 mt-4">
            {node.skills.map((s) => (
              <span key={s} className="tag cf-fs-data">{s}</span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {node.certs.map((c) => (
              <span key={c} className="tag cf-fs-data">{c}</span>
            ))}
          </div>

          <div className="cf-margin-note mt-5">
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--cf-ink)" }}>&ldquo;{node.note}&rdquo;</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* DONE stamps: every instance gets its own rotation, scale, opacity and
   border weight, keyed by row index — the house stamp rule. */
const DONE_STAMP_R = [-3.1, 1.6, -1.9];
const DONE_STAMP_S = [1.03, 0.96, 1.06];
const DONE_STAMP_O = [0.92, 0.87, 0.95];
const DONE_STAMP_BW = [2.6, 3.1, 2.3];

function CertRow({ cert, index, total }: { cert: CertEntry; index: number; total: number }) {
  const done = cert.status === "DONE";
  const live = cert.status === "IN_PROGRESS";
  const doneIdx = ROADMAP_CERTS.slice(0, index + 1).filter((c) => c.status === "DONE").length - 1;
  return (
    <div
      className="flex flex-wrap items-center gap-4 px-5 sm:px-6 py-4"
      style={index > 0 ? { borderTop: "2px solid var(--cf-faint)" } : undefined}
    >
      <div
        className="w-16 h-16 flex flex-col items-center justify-center shrink-0"
        style={
          done
            ? { background: "var(--cf-ink)", border: "2px solid var(--cf-ink)" }
            : live
              ? { background: "transparent", border: "2px solid var(--cf-ink)" }
              : { background: "transparent", border: "2px dashed var(--cf-faint)" }
        }
      >
        {/* The goal cert carries the red file square, as on /experience. */}
        {cert.star && (
          <span className="w-2 h-2 mb-1" style={{ background: "var(--cf-red)" }} aria-label="Primary goal" role="img" />
        )}
        <span
          className="cf-mono cf-fs-data font-bold text-center leading-tight"
          style={{ color: done ? "var(--cf-paper)" : live ? "var(--cf-ink)" : "var(--cf-muted)" }}
        >
          {cert.abbr}
        </span>
      </div>

      <div className="flex-1 min-w-[180px]">
        <p className="font-bold text-[var(--cf-ink)]">{cert.name}</p>
        <p className="cf-mono cf-fs-data text-[var(--cf-muted)] mt-1">
          TRACK {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
      </div>

      {done ? (
        <span className="inline-flex items-center gap-3">
          <span className="cf-mono cf-fs-data tracking-widest" style={{ color: "var(--cf-ink)" }}>
            DONE{cert.when ? ` · ${cert.when.toUpperCase()}` : ""}
          </span>
          <Stamp
            tone="ink"
            r={DONE_STAMP_R[doneIdx % DONE_STAMP_R.length]}
            s={DONE_STAMP_S[doneIdx % DONE_STAMP_S.length]}
            o={DONE_STAMP_O[doneIdx % DONE_STAMP_O.length]}
            bw={DONE_STAMP_BW[doneIdx % DONE_STAMP_BW.length]}
            delay={150 + doneIdx * 120}
            className="cf-fs-data px-2 py-0.5"
          >
            Earned
          </Stamp>
        </span>
      ) : live ? (
        <LiveMarker label="IN PROGRESS" />
      ) : (
        <span className="cf-mono cf-fs-data tracking-widest" style={{ color: "var(--cf-muted)" }}>
          {cert.status}
        </span>
      )}
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <div className="pb-24">
      <div className="cf-wrap">
        <PageHead
          kicker="Career roadmap"
          title={
            <>
              The Path <span className="cf-u-red">From Here</span>
            </>
          }
          lede="Every step has a purpose. Every cert, every lab, every late night. This board prints each state as it stands: earned under an ink stamp, work under way under a red marker, and everything still to come in dashed outline."
        />

        {/* The board's legend, in the file's own mono */}
        <Reveal delay={0.05}>
          <p className="cf-mono cf-fs-label mt-10" style={{ color: "var(--cf-muted)", letterSpacing: "0.08em" }}>
            HOW TO READ THIS BOARD — <span style={{ color: "var(--cf-ink)" }}>INK STAMP: DONE</span> ·{" "}
            <span style={{ color: "var(--cf-red)" }}>RED MARKER: CURRENT / IN PROGRESS</span> ·{" "}
            <span>DASHED OUTLINE: PLANNED / GOAL / FUTURE</span>
          </p>
        </Reveal>

        {/* The progression board: the roadmap nodes on the storyboard rail */}
        <Reveal delay={0.05} className="mt-12">
          <div className="cf-tl">
            <RailFill />
            {NODES.map((node, i) => (
              <NodePanel key={node.id} node={node} index={i} total={NODES.length} />
            ))}
          </div>
        </Reveal>

        {/* The certification track, with true states only */}
        <section className="pt-20">
          <Reveal delay={0.05}>
            <div className="cf-sec-head relative">
              <p className="cf-kicker">Certification track</p>
              <h2 className="cf-h2 mt-2">Earned, in progress, planned</h2>
              <p className="cf-note mt-2">OSCP is the milestone that changes the trajectory.</p>
              <Stamp
                tone="ink"
                r={-2.4}
                s={1.02}
                o={0.9}
                bw={2.7}
                delay={300}
                className="absolute -top-5 right-2 sm:right-8 cf-fs-label"
              >
                On file
              </Stamp>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div
              style={{
                border: "2.5px solid var(--cf-ink)",
                background: "var(--cf-paper-2)",
                boxShadow: "8px 8px 0 var(--cf-shadow)",
              }}
            >
              {ROADMAP_CERTS.map((cert, i) => (
                <CertRow key={cert.abbr} cert={cert} index={i} total={ROADMAP_CERTS.length} />
              ))}
            </div>
          </Reveal>
        </section>

        {/* CTA, carried over from the roadmap section on /experience */}
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
              <Link href="/experience" className="cf-btn-ghost">See the Experience File</Link>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
