"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

/**
 * Exhibit IV — the pinned examination sequence. On desktop with motion
 * allowed, the section pins for ~240vh of scroll and the three filed
 * certificate documents step through the stage: each arrives, holds, and
 * hands over to the next, with its caption and a progress bar tracking the
 * turn of the page. Everywhere else (mobile, reduced motion) it degrades
 * to a plain stack: all three documents, fully visible, no scroll tricks.
 *
 * Facts are the ones already filed on this page and /certifications:
 * issuers, dates and verification codes are copied from the documents
 * themselves, not invented for the sequence.
 */
type Doc = {
  src: string;
  w: number;
  h: number;
  alt: string;
  name: string;
  detail: string;
  rot: number;
};

const DOCS: Doc[] = [
  {
    src: "/images/cert-google-foundations.jpg",
    w: 1275,
    h: 1650,
    alt: "Google Foundations of Cybersecurity certificate issued to Raghav Mahajan, January 8, 2026",
    name: "Google Foundations of Cybersecurity",
    detail: "Issued Jan 8, 2026 · Verify code RMT26QI2LCT7, printed on the document",
    rot: 0,
  },
  {
    src: "/images/certs/security-plus-1.jpg",
    w: 1760,
    h: 1360,
    alt: "CompTIA Security+ certificate, SY0-701",
    name: "CompTIA Security+ · SY0-701",
    detail: "Certified Jun 15, 2026 · Expires Jun 15, 2029",
    rot: 0,
  },
  {
    src: "/images/certs/isc2-cc-1.jpg",
    w: 1760,
    h: 1360,
    alt: "ISC2 Certified in Cybersecurity certificate, number 4332427",
    name: "ISC2 Certified in Cybersecurity (CC)",
    detail: "Certification 4332427 · Cycle Jul 2026 to Jun 2029",
    rot: 0,
  },
];

/** Keyframe windows per document inside the pinned scroll (progress 0-1). */
function windows(i: number, total: number) {
  const start = i / total;
  const end = (i + 1) / total;
  const fade = 0.09;
  if (i === 0) {
    return {
      p: [0, end - fade, end + 0.03],
      o: [1, 1, 0],
      y: [0, 0, -38],
      s: [1, 1, 0.955],
    };
  }
  if (i === total - 1) {
    return {
      p: [start - 0.03, start + fade, 1],
      o: [0, 1, 1],
      y: [38, 0, 0],
      s: [0.955, 1, 1],
    };
  }
  return {
    p: [start - 0.03, start + fade, end - fade, end + 0.03],
    o: [0, 1, 1, 0],
    y: [38, 0, 0, -38],
    s: [0.955, 1, 1, 0.955],
  };
}

/**
 * Piecewise-linear keyframe evaluation, done by hand. The range-form
 * useTransform(progress, xs, ys) mis-rendered the FIRST document's
 * opacity in this framer-motion build (its MotionValue was correct, the
 * painted style was not — verified with MotionValue probes + CDP cascade
 * dumps). The function form recomputes the same keyframes directly and
 * paints what the values say.
 */
function track(p: number, xs: number[], ys: number[]) {
  if (p <= xs[0]) return ys[0];
  for (let i = 1; i < xs.length; i++) {
    if (p <= xs[i]) {
      const t = (p - xs[i - 1]) / (xs[i] - xs[i - 1]);
      return ys[i - 1] + (ys[i] - ys[i - 1]) * t;
    }
  }
  return ys[ys.length - 1];
}

function PinDoc({
  doc,
  index,
  total,
  progress,
}: {
  doc: Doc;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const w = windows(index, total);
  const opacity = useTransform(progress, (p) => track(p, w.p, w.o));
  const y = useTransform(progress, (p) => track(p, w.p, w.y));
  const scale = useTransform(progress, (p) => track(p, w.p, w.s));
  // Blur-masked crossfade (Emil Kowalski's seam technique): at the
  // handover moment the eye would otherwise read two documents swapping;
  // a 2.5px blur peak exactly at the crossover blends them into one
  // perceived transformation. Zero while a document holds the stage.
  const blurIn = index === 0 ? [0, ...w.p.slice(1)] : w.p;
  const blurOut =
    index === 0 ? [0, 0, 2.5] : index === total - 1 ? [2.5, 0, 0] : [2.5, 0, 0, 2.5];
  const blur = useTransform(progress, (p) => track(p, blurIn, blurOut));
  const filter = useTransform(blur, (v) => `blur(${v.toFixed(2)}px)`);
  return (
    <motion.figure
      className="cf-pin-doc"
      style={{ opacity, y, scale, rotate: doc.rot, filter }}
    >
      <Image src={doc.src} alt={doc.alt} width={doc.w} height={doc.h} sizes="(max-width: 720px) 100vw, 620px" />
    </motion.figure>
  );
}

function PinCap({
  doc,
  index,
  total,
  progress,
}: {
  doc: Doc;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const w = windows(index, total);
  const opacity = useTransform(progress, (p) => track(p, w.p, w.o));
  const y = useTransform(progress, (p) => track(p, w.p, w.y) / 2);
  return (
    <motion.div className="cf-pin-cap" style={{ opacity, y }}>
      <p className="cf-mono text-[11px] tracking-[0.18em]" style={{ color: "var(--cf-red)" }}>
        DOCUMENT {index + 1} OF {total}
      </p>
      <p className="cf-display" style={{ fontSize: "clamp(24px, 3.4vw, 36px)", lineHeight: 1.05, marginTop: 8 }}>
        {doc.name}
      </p>
      <p className="cf-caption" style={{ marginTop: 8 }}>
        {doc.detail}
      </p>
    </motion.div>
  );
}

function PinBar({
  index,
  total,
  progress,
}: {
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const scaleX = useTransform(progress, (p) =>
    track(p, [index / total, (index + 1) / total], [0, 1]),
  );
  return (
    <span className="cf-pin-bar">
      <motion.i style={{ scaleX }} />
    </span>
  );
}

export function PinnedDocs() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnhanced(mq.matches && !rm.matches);
    update();
    mq.addEventListener("change", update);
    rm.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      rm.removeEventListener("change", update);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  const head = (
    <div className="cf-sec-head">
      <h2 className="cf-h2">The documents, examined</h2>
    </div>
  );

  // One persistent wrap element in both modes, so the useScroll target
  // never unmounts when the enhanced mode flips on after mount.
  return (
    <section className={enhanced ? undefined : "pt-16"}>
      <div ref={wrapRef} style={enhanced ? { height: "240vh" } : undefined}>
        {enhanced ? (
          <div className="cf-pin-stage">
            {head}
            <div className="cf-pin-docs">
              {DOCS.map((d, i) => (
                <PinDoc key={d.src} doc={d} index={i} total={DOCS.length} progress={scrollYProgress} />
              ))}
            </div>
            <div className="cf-pin-caps">
              {DOCS.map((d, i) => (
                <PinCap key={d.src} doc={d} index={i} total={DOCS.length} progress={scrollYProgress} />
              ))}
            </div>
            <div className="cf-pin-bars">
              {DOCS.map((d, i) => (
                <PinBar key={d.src} index={i} total={DOCS.length} progress={scrollYProgress} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {head}
            <div className="grid gap-12">
              {DOCS.map((d) => (
                <figure key={d.src} className="cf-doc" style={{ maxWidth: 560 }}>
                  <Image src={d.src} alt={d.alt} width={d.w} height={d.h} sizes="(max-width: 720px) 100vw, 620px" />
                  <figcaption className="cf-caption" style={{ marginTop: 14 }}>
                    <b>{d.name}.</b> {d.detail}
                  </figcaption>
                </figure>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
