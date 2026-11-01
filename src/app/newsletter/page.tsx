import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import editionsData from "@/data/newsletter-editions.json";
import { PageHead } from "@/components/casefile/PageHead";
import { Reveal } from "@/components/casefile/Reveal";
import { Stamp } from "@/components/casefile/Stamp";
import { Tape } from "@/components/casefile/Tape";
import SubscribeWidget from "@/components/newsletter/SubscribeWidget";

type Edition = { number: number | null; date: string; title: string; linkedinUrl: string };

/**
 * The edition list lives in src/data/newsletter-editions.json (newest first),
 * maintained by the newsletter sync script. This page only renders it: first
 * entry is the featured latest dispatch, the rest form the archive.
 */
const editions = [...(editionsData as Edition[])].sort((a, b) => b.date.localeCompare(a.date));

/** Cover art that exists in public assets, keyed by edition number. */
const COVERS: Record<number, string> = {
  13: "/images/newsletter/edition-13.webp",
  4: "/images/newsletter/edition-04.webp",
};

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));

const edLabel = (n: number | null) => (n == null ? "Special" : `Edition ${String(n).padStart(2, "0")}`);

export default function NewsletterPage() {
  const [latest, ...archive] = editions;

  return (
    <div className="cf-wrap pb-24">
      <PageHead
        kicker="Newsletter · Filed dispatches"
        title="Blue Team Brief"
        lede="The week's real attacks in plain English. What happened, why it matters, what to hunt for. One edition most weeks, written from Edmonton, read by defenders across Canada and beyond."
      />

      {latest && (
        <Reveal className="mt-12">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div className="relative">
              {latest.number != null && COVERS[latest.number] ? (
                <div className="cf-exhibit" style={{ transform: "rotate(2.6deg)" }}>
                  <figure style={{ position: "relative", zIndex: 1, margin: 0 }}>
                    <Image
                      src={COVERS[latest.number]}
                      alt={`Blue Team Brief ${edLabel(latest.number)} cover`}
                      width={1200}
                      height={627}
                      className="cf-exhibit-frame"
                      priority
                    />
                    <figcaption className="cf-caption" style={{ marginTop: 14 }}>
                      <b>Exhibit N</b> · Cover art, {edLabel(latest.number).toLowerCase()}
                    </figcaption>
                  </figure>
                  <Tape width={118} height={30} top={-15} left={24} rotate={-7} opacity={0.8} />
                </div>
              ) : (
                <div
                  className="flex aspect-[1200/627] flex-col items-center justify-center gap-2 p-8 text-center"
                  style={{ background: "var(--cf-ink)", color: "var(--cf-paper)", transform: "rotate(1.8deg)" }}
                >
                  <span className="cf-display text-[clamp(2rem,5vw,3.4rem)] leading-none">BLUE TEAM BRIEF</span>
                  <span className="cf-mono text-[11px] tracking-widest" style={{ color: "var(--cf-gold)" }}>
                    {edLabel(latest.number).toUpperCase()} · {fmtDate(latest.date).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-4">
                <p className="cf-mono text-[11px] font-bold tracking-widest" style={{ color: "var(--cf-red)" }}>
                  LATEST DISPATCH
                </p>
                <Stamp r={-3.4} s={1.02} o={0.93} bw={3}>Latest</Stamp>
              </div>
              <h2 className="cf-display mt-4 text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.02]" style={{ color: "var(--cf-ink)" }}>
                {latest.title}
              </h2>
              <p className="cf-mono mt-4 text-[11px] tracking-wider" style={{ color: "var(--cf-muted)" }}>
                {edLabel(latest.number).toUpperCase()} · FILED {fmtDate(latest.date).toUpperCase()}
              </p>
              <p className="mt-4 max-w-[52ch] leading-relaxed" style={{ color: "var(--cf-ink-soft)" }}>
                The newest edition of the Brief. Real incidents, plain language, and the one thing worth
                hunting for in your own environment after each story.
              </p>
              <div className="mt-7">
                <a href={latest.linkedinUrl} target="_blank" rel="noopener noreferrer" className="cf-btn">
                  Read on LinkedIn <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {archive.length > 0 && (
        <section className="mt-20">
          <div className="cf-sec-head flex flex-wrap items-end justify-between gap-3">
            <h2 className="cf-h2">The archive</h2>
            <span className="cf-note">{archive.length} earlier dispatches</span>
          </div>
          <Reveal>
            <div>
              {archive.map((ed) => (
                <a
                  key={`${ed.number}-${ed.date}`}
                  href={ed.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cf-arch-row"
                >
                  <span className="cf-arch-no">{ed.number == null ? "SP" : `ED. ${String(ed.number).padStart(2, "0")}`}</span>
                  <span className="cf-arch-date">{fmtDate(ed.date)}</span>
                  <span className="cf-arch-title">{ed.title}</span>
                  <span aria-hidden="true">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </a>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      <Reveal className="mt-20">
        <div className="p-6 sm:p-8" style={{ border: "2px solid var(--cf-ink)", background: "var(--cf-paper-2)" }}>
          <p className="cf-mono text-[10px] font-bold tracking-widest" style={{ color: "var(--cf-red)" }}>
            GET THE NEXT DISPATCH
          </p>
          <h2 className="cf-display mt-3 text-[28px] leading-tight" style={{ color: "var(--cf-ink)" }}>
            Filed straight to your inbox
          </h2>
          <p className="mt-2 max-w-[55ch] text-[15px] leading-relaxed" style={{ color: "var(--cf-ink-soft)" }}>
            One email per edition, nothing else. Unsubscribe any time.
          </p>
          <div className="mt-5 max-w-xl">
            <SubscribeWidget />
          </div>
        </div>
      </Reveal>
    </div>
  );
}
