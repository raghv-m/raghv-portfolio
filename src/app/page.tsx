import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/casefile/Reveal";
import { staggerDelay } from "@/components/casefile/stagger";
import { Stamp } from "@/components/casefile/Stamp";
import { TypeLog } from "@/components/casefile/TypeLog";
import { Magnetic } from "@/components/casefile/Magnetic";
import { ParallaxLayer } from "@/components/casefile/ParallaxLayer";
import { ExhibitZoom } from "@/components/casefile/ExhibitZoom";
import { PinnedDocs } from "@/components/casefile/PinnedDocs";
import { SpotWrap } from "@/components/casefile/SpotWrap";
import { BlockRule } from "@/components/casefile/Ornaments";
import { HudHero } from "@/components/casefile/HudHero";
import { CountUp } from "@/components/casefile/CountUp";

const LOG_LINES = [
  <>** Alert 1791978824.294411: - syslog,sshd,authentication_failed,</>,
  <>2026 Oct 14 02:13:44 DC-01-&gt;/var/log/auth.log</>,
  <>Rule: 5710 (level 5) -&gt; &apos;Attempt to login using a non-existent user&apos;</>,
  <>Src IP: 192.168.56.102&nbsp;&nbsp;User: (invalid user) admin&nbsp;&nbsp;Decoder: sshd</>,
  <> </>,
  <>** Alert 1791978831.294455: - syslog,sshd,authentication_failed,</>,
  <>2026 Oct 14 02:13:51 DC-01-&gt;/var/log/auth.log</>,
  <>
    Rule: <span className="alert">5712</span> (level 10) -&gt; &apos;SSH brute force attack detected&apos;
  </>,
  <>Src IP: 192.168.56.102&nbsp;&nbsp;User: (invalid user) admin&nbsp;&nbsp;Decoder: sshd</>,
  <>** Alert 1791978903.294512: - syslog,pam,authentication_failed,</>,
  <>2026 Oct 14 02:15:03 WEB01-&gt;/var/log/auth.log</>,
  <>Rule: 5503 (level 5) -&gt; &apos;PAM: User login failed.&apos;</>,
  <>
    Src IP: <span className="cf-redact">10.143.0.67</span>&nbsp;&nbsp;User: rmahajan&nbsp;&nbsp;Decoder: pam_unix
  </>,
  <>** Alert 1791978960.294601: - ossec,</>,
];

type Cred = {
  name: string;
  iss: string;
  code: string;
  stamp?: string;
  tone?: "green" | "gold";
  live?: boolean;
  r: number;
  s: number;
  o: number;
  bw: number;
  /** Rows with a filed document carry its thumbnail instead of a stamp. */
  doc?: { src: string; w: number; h: number; alt: string };
};

const CREDS: Cred[] = [
  {
    name: "CompTIA Security+", iss: "CompTIA · expires Jun 2029", code: "SY0-701", r: 1.8, s: 1, o: 0.88, bw: 2,
    doc: { src: "/images/certs/security-plus-1.jpg", w: 1760, h: 1360, alt: "CompTIA Security+ certificate, SY0-701" },
  },
  {
    name: "ISC2 Certified in Cybersecurity", iss: "ISC2 · CC", code: "CC", r: -1.3, s: 1.07, o: 0.95, bw: 3,
    doc: { src: "/images/certs/isc2-cc-1.jpg", w: 1760, h: 1360, alt: "ISC2 Certified in Cybersecurity certificate, number 4332427" },
  },
  {
    name: "Google Cybersecurity", iss: "Google · three course certificates", code: "2026", r: 2.6, s: 0.97, o: 0.84, bw: 2,
    doc: { src: "/images/certs/google-foundations-1.jpg", w: 1430, h: 1105, alt: "Google Foundations of Cybersecurity certificate" },
  },
  {
    name: "Intermediate First Aid", iss: "APEX · CSA Z1210-17 · expires Oct 2029", code: "10748425", r: -2.1, s: 1.02, o: 0.9, bw: 2.4,
    doc: { src: "/images/certs/first-aid-1.jpg", w: 1105, h: 1430, alt: "Intermediate First Aid certificate, certificate number 10748425" },
  },
  { name: "Microsoft SC-200", iss: "Microsoft · Security Operations Analyst", code: "SC-200", stamp: "In progress", tone: "gold", live: true, r: -3.2, s: 0.94, o: 0.9, bw: 2.5 },
];

const CONTENTS = [
  { no: "01", href: "/about", title: "About", desc: "Kitchen, guard booth, code, SOC: the non-traditional path, in first person" },
  { no: "02", href: "/experience", title: "Experience", desc: "Security operations, freelance development, and the career roadmap from here" },
  { no: "03", href: "/portfolio", title: "Portfolio", desc: "Client sites and lab builds, presented as case entries" },
  { no: "04", href: "/cybersecurity", title: "Cybersecurity", desc: "Detection, incident response, SIEM work mapped to MITRE ATT&CK, and the home lab" },
  { no: "05", href: "/certifications", title: "Certifications", desc: "The full credential list, earned and in progress" },
  { no: "06", href: "/blog", title: "Blog: field notes", desc: "Writeups from the lab and the study desk" },
  { no: "07", href: "/newsletter", title: "Newsletter: Blue Team Brief", desc: "The week's real attacks in plain English, every edition archived" },
  { no: "08", href: "/news", title: "Daily security news", desc: "The top 3 stories worth your time, every day" },
  { no: "09", href: "/hobbies", title: "Hobbies", desc: "Strange GitHub repositories and a camera: the off-duty side" },
  { no: "10", href: "/estimate", title: "Get an estimate", desc: "Six steps, a real price range, straight into his pipeline" },
  { no: "11", href: "/contact", title: "Contact", desc: "Roles, projects, collaborations" },
];

export default function HomePage() {
  return (
    <div className="cf-wrap">
      {/* ── Hero: the HUD readout panel ────────────────────────────── */}
      <div className="pt-10">
        <HudHero />
      </div>

      {/* ── Lead art: the newsletter cover at full width ───────────── */}
      <Reveal className="mt-14">
        <ParallaxLayer range={26}>
          <div className="cf-exhibit">
            <div className="cf-exhibit-frame cf-zoom-frame">
              <ExhibitZoom>
                <Image
                  src="/images/newsletter/edition-04.webp"
                  alt="Blue Team Brief newsletter cover, Edition 4"
                  width={1200}
                  height={675}
                  sizes="(max-width: 1240px) 100vw, 1176px"
                />
              </ExhibitZoom>
            </div>
          </div>
        </ParallaxLayer>
        <p className="cf-caption" style={{ marginTop: 16 }}>
          <b>Blue Team Brief.</b> His plain-English cybersecurity newsletter. Written, designed, and
          shipped by the subject. <CountUp to={284} /> subscribers and counting.
        </p>
      </Reveal>

      <BlockRule className="mt-14" />

      {/* ── Exhibit II: the captured log ──────────────────────────── */}
      <Reveal className="mt-12">
        <ParallaxLayer range={30}>
          <TypeLog head="Homelab — live capture" headRight="Wazuh 4.9 · Docker SOC" lines={LOG_LINES} />
        </ParallaxLayer>
      </Reveal>

      {/* ── What he does ──────────────────────────────────────────── */}
      <section className="pt-16">
        <Reveal variant="wipe">
          <div className="cf-sec-head">
            <h2 className="cf-h2">What Raghav actually does</h2>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-12">
          <Reveal delay={0.05}>
            <h3 className="cf-kicker" style={{ color: "var(--cf-ink)" }}>Web builds</h3>
            <p className="cf-body mt-3">
              Full sites for small business clients: design, build, hosting, the lot. His estimator quotes a project in
              about a minute, at 45% of typical market rates, and every quote lands in his own CRM. No agency, no
              handoffs, you talk to the person writing the code.
            </p>
          </Reveal>
          <Reveal delay={0.14}>
            <h3 className="cf-kicker" style={{ color: "var(--cf-ink)" }}>Security operations</h3>
            <p className="cf-body mt-3">
              Corporate security site supervisor work, plus a home lab that runs real attacks against real tooling:
              Wazuh, Splunk, Hydra brute force, lateral movement tests, then a written incident report for every run.
              Triage, documentation, and follow-through are the job, not the side quest.
            </p>
            <p className="cf-margin-note mt-5">
              Note: the log above is not a tutorial screenshot.
              <br />
              Every alert in it came from an attack he ran himself.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Exhibit III: the price machine ─────────────────────────── */}
      <section className="pt-16">
        <Reveal variant="wipe">
          <div className="cf-sec-head">
            <h2 className="cf-h2">The price machine</h2>
          </div>
          <ParallaxLayer range={28}>
          <div className="cf-machine grid lg:grid-cols-[7fr_5fr] gap-10 items-center p-8 sm:p-11">
            <div>
              <Reveal>
                <p className="cf-display" style={{ fontSize: "clamp(40px, 5.5vw, 62px)", lineHeight: 1.02 }}>
                  <span className="cf-strike">
                    <CountUp to={4000} prefix="$" />
                  </span>
                  <br />
                  <CountUp to={1800} prefix="$" />
                </p>
              </Reveal>
              <p className="cf-mono mt-4 text-[12.5px]" style={{ color: "var(--cf-muted)" }}>
                Typical market quote vs. his price, same scope.
              </p>
            </div>
            <div>
              <p className="cf-body">
                Six questions. A real range, on screen, in about a minute. His price is 45% of market on the build,
                and the quote goes straight into his pipeline, so a human answers fast.
              </p>
              <div className="mt-6">
                <Magnetic strength={18}>
                  <Link href="/estimate" className="cf-btn">
                    Run the estimator
                  </Link>
                </Magnetic>
              </div>
            </div>
          </div>
          </ParallaxLayer>
        </Reveal>
      </section>

      {/* ── Credentials + the actual document ─────────────────────── */}
      <section className="pt-16">
        <Reveal variant="wipe">
          <div className="cf-sec-head">
            <h2 className="cf-h2">Credentials, verified</h2>
          </div>
        </Reveal>
        <SpotWrap className="grid lg:grid-cols-[1fr_350px] gap-12 items-start">
          <div>
            <div className="cf-cred">
              {CREDS.map((c, i) => (
                <Reveal key={c.name} delay={staggerDelay(i)} variant="left">
                  <div className="cf-cred-row">
                  <div>
                    <div className="cf-cred-name">{c.name}</div>
                    <div className="cf-cred-iss">{c.iss}</div>
                  </div>
                  <span className="cf-cred-code">{c.code}</span>
                  {c.doc ? (
                    <Image
                      src={c.doc.src}
                      alt={c.doc.alt}
                      width={c.doc.w}
                      height={c.doc.h}
                      sizes="64px"
                      className="cf-cred-thumb"
                    />
                  ) : (
                    <Stamp tone={c.tone} r={c.r} s={c.s} o={c.o} bw={c.bw} delay={i * 130} live={c.live}>
                      {c.stamp}
                    </Stamp>
                  )}
                  </div>
                </Reveal>
              ))}
            </div>
            <p className="mt-6">
              <Link href="/certifications" className="cf-ulink">
                Open the full credential list →
              </Link>
            </p>
          </div>
          <Reveal delay={0.1} className="lg:self-stretch">
            <figure className="cf-doc lg:sticky lg:top-24">
              <Image
                src="/images/cert-google-foundations.jpg"
                alt="Google Foundations of Cybersecurity certificate issued to Raghav Mahajan, January 8, 2026"
                width={1275}
                height={1650}
                sizes="(max-width: 1024px) 100vw, 350px"
              />
              <figcaption className="cf-caption" style={{ marginTop: 14 }}>
                <b>The document itself.</b> The actual certificate, not a badge icon. Google, Foundations of
                Cybersecurity, issued Jan 8, 2026. Verify code RMT26QI2LCT7, printed on the document itself.
              </figcaption>
            </figure>
          </Reveal>
        </SpotWrap>
      </section>

      {/* ── Exhibit IV: the pinned document examination ────────────── */}
      <PinnedDocs />

      {/* ── Contents of this file ─────────────────────────────────── */}
      <section className="pt-16 pb-20">
        <Reveal variant="wipe">
          <div className="cf-sec-head">
            <h2 className="cf-h2">Contents</h2>
          </div>
        </Reveal>
        <nav aria-label="Site contents">
          {CONTENTS.map((row, i) => (
            <Reveal key={row.no} delay={staggerDelay(i, 0.05, 0.4)} variant="left">
              <Link href={row.href} className="cf-idx-row">
                <span className="cf-idx-no">{row.no}</span>
                <span>
                  <span className="cf-idx-title">{row.title}</span>
                  <span className="cf-idx-desc">{row.desc}</span>
                </span>
                <span className="cf-idx-arrow">→</span>
              </Link>
            </Reveal>
          ))}
        </nav>
      </section>
    </div>
  );
}
