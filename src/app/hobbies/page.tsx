import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";

import { PageHead } from "@/components/casefile/PageHead";
import { Reveal } from "@/components/casefile/Reveal";
import { Stamp } from "@/components/casefile/Stamp";

/**
 * Hobbies: the off-duty file. Two exhibits, both factual — the GitHub
 * hunting habit (no repo names invented, ever) and the photography, three
 * frames of which ran on the Edmonton Valley Zoo's website for a month.
 *
 * The zoo frames are wired to public/images/hobbies/zoo-1..3.jpg — the three
 * featured photographs, now filed. Below them, a second frame set:
 * gallery-1..6.jpg, more of his photographs (landscapes and last light).
 */
const ZOO_PHOTOS = [1, 2, 3].map((n) => {
  const rel = `/images/hobbies/zoo-${n}.jpg`;
  const filed = existsSync(path.join(process.cwd(), "public", rel));
  return { n, rel, filed, rotate: [-1.3, 0.8, -0.5][n - 1] };
});

const GALLERY_PHOTOS = [
  { n: 1, caption: "Cabin at last light", w: 1206, h: 2144, rotate: -0.8 },
  { n: 2, caption: "Overlook, golden hour", w: 1206, h: 2144, rotate: 1.1 },
  { n: 3, caption: "House in the snow, dusk", w: 1206, h: 2144, rotate: -0.5 },
  { n: 4, caption: "Peak above the treeline", w: 1168, h: 776, rotate: 0.9 },
  { n: 5, caption: "Clouds on fire", w: 1206, h: 2144, rotate: -1.2 },
  { n: 6, caption: "Mountain town, sunset", w: 1206, h: 2144, rotate: 0.6 },
];

export default function HobbiesPage() {
  return (
    <div className="pb-24">
      <div className="cf-wrap">
        <PageHead
          kicker="Off the clock"
          title={
            <>
              The <span className="cf-u-red">Off-Duty</span> File
            </>
          }
          lede="What he does when nobody is paying him: digs through other people's strange code, and walks around with a camera."
        >
          <div style={{ marginTop: 26 }}>
            <Stamp tone="ink" r={-3.8} s={1.03} o={0.9} bw={2.6} delay={250}>
              Off duty
            </Stamp>
          </div>
        </PageHead>

        {/* ── Exhibit 1: strange software ─────────────────────────────── */}
        <section className="pt-16">
          <Reveal>
            <div className="cf-sec-head">
              <p className="cf-kicker">Hobby 01</p>
              <h2 className="cf-h2 mt-2">Finding strange software</h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-[7fr_5fr] gap-12 items-start">
            <Reveal delay={0.05}>
              <p className="cf-body">
                He hunts GitHub the way other people scroll social media. The good stuff is never the polished
                frameworks: it is the vibe-coded experiments somebody shipped at 3 AM, the projects where a
                developer took a closed app apart to see how it actually works, the weird builds that should
                not exist and do anyway.
              </p>
              <p className="cf-body mt-4">
                Half of it is entertainment. The other half is homework in disguise — reading how a stranger
                structured a strange idea teaches more than another tutorial, and the reverse-engineering
                write-ups are a blue team education hiding in plain sight.
              </p>
              <p className="mt-7">
                <a
                  href="https://github.com/HomeLab-Raghav"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cf-ulink"
                >
                  His own corner of it: github.com/HomeLab-Raghav →
                </a>
              </p>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="cf-margin-note">
                Note: no list of favourite repos is filed here, because the list changes weekly. The habit is
                the hobby.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── Exhibit 2: photography ──────────────────────────────────── */}
        <section className="pt-20">
          <Reveal>
            <div className="cf-sec-head relative">
              <p className="cf-kicker">Hobby 02</p>
              <h2 className="cf-h2 mt-2">Photography</h2>
              <p className="cf-note mt-3" style={{ maxWidth: 620 }}>
                He shoots around Edmonton with the same patience he brings to a log file: wait, watch, take the
                frame when it is actually there.
              </p>
              <span className="absolute -top-5 right-2 sm:right-8">
                <Stamp tone="red" r={2.4} s={1.02} o={0.93} bw={2.8} delay={300} className="text-[11px]">
                  Featured — Edmonton Valley Zoo
                </Stamp>
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="cf-body" style={{ maxWidth: 680 }}>
              Three of his photographs, taken at the Edmonton Valley Zoo, were featured on the zoo&apos;s website
              for a month. The frames are filed below.
            </p>
          </Reveal>
          <div className="cf-zoo-grid mt-10">
            {ZOO_PHOTOS.map((photo, i) => (
              <Reveal key={photo.n} delay={0.05 + i * 0.09}>
                <figure className="cf-doc" style={{ rotate: `${photo.rotate}deg` }}>
                  {photo.filed ? (
                    <Image
                      src={photo.rel}
                      alt={`Photograph by Raghav Mahajan, taken at the Edmonton Valley Zoo (featured frame ${photo.n})`}
                      width={1206}
                      height={1809}
                    />
                  ) : (
                    <div className="cf-pending-frame">
                      <span className="cf-pending-tag">Exhibit frame {photo.n} of 3</span>
                      <p className="cf-caption">Photograph — Edmonton Valley Zoo (file pending)</p>
                    </div>
                  )}
                  <figcaption className="cf-caption" style={{ marginTop: 14 }}>
                    <b>Frame {photo.n}.</b> Edmonton Valley Zoo — featured on the zoo&apos;s website for a month.
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Exhibit 2b: more frames ─────────────────────────────────── */}
        <section className="pt-20">
          <Reveal>
            <div className="cf-sec-head">
              <p className="cf-kicker">Hobby 02 — continued</p>
              <h2 className="cf-h2 mt-2">More frames — field photographs</h2>
              <p className="cf-note mt-3" style={{ maxWidth: 620 }}>
                The rest of the roll: last light, snow, and high country, shot on the same walks.
              </p>
            </div>
          </Reveal>
          <div className="cf-gallery mt-10">
            {GALLERY_PHOTOS.map((photo, i) => (
              <Reveal key={photo.n} delay={0.05 + (i % 3) * 0.09} className="cf-gallery-item">
                <figure className="cf-doc" style={{ rotate: `${photo.rotate}deg` }}>
                  <Image
                    src={`/images/hobbies/gallery-${photo.n}.jpg`}
                    alt={`Photograph by Raghav Mahajan: ${photo.caption.toLowerCase()}`}
                    width={photo.w}
                    height={photo.h}
                  />
                  <figcaption className="cf-caption cf-mono" style={{ marginTop: 12, fontSize: 12 }}>
                    <b>Field frame {photo.n}.</b> {photo.caption}.
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>

        <Reveal className="mt-16">
          <p className="cf-note">
            Back to the working file: <Link href="/experience" className="cf-ulink">experience</Link> or the{" "}
            <Link href="/portfolio" className="cf-ulink">portfolio</Link>.
          </p>
        </Reveal>
      </div>
    </div>
  );
}
