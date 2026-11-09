import Link from "next/link";

import { PageHead } from "@/components/casefile/PageHead";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { site } from "@/config/site";
import { Reveal } from "@/components/casefile/Reveal";

/**
 * LAB-001 — SSH Brute Force Detection (forensic-fix pass).
 *
 * The first investigation file: the homepage Exhibit B capture, written
 * up in the standard investigation structure. EVERY factual statement on
 * this page traces to the capture itself (the alert lines the homepage
 * publishes) or to the verified lab facts: Wazuh in Docker, a four-node
 * home lab, DC-01, and the subject's own statement that every alert came
 * from an attack he ran himself, with a written report for every run.
 * Nothing else is claimed: no containment steps, no commands, no times
 * beyond the ones the capture itself prints, no outcomes beyond the
 * alerts firing. The response detail stays where it lives — in the
 * unpublished per-run incident report.
 */

const FILE_ROWS: { label: string; body: string }[] = [
  { label: "Investigation ID", body: "LAB-001" },
  { label: "Title", body: "SSH Brute Force Detection" },
  {
    label: "Environment",
    body: "Wazuh in Docker, in a four-node home lab. The alerts fired on DC-01, the Windows Server 2022 domain controller, from its sshd authentication log. A PAM authentication failure from WEB01 appears in the same capture.",
  },
  { label: "Objective", body: "Detect repeated authentication failures." },
  {
    label: "Attack simulation",
    body: "A controlled attack the subject ran himself, against his own lab. Every alert in the capture came from an attack he ran himself.",
  },
];

const TIMELINE: string[] = [
  "A login attempt against the non-existent user \u201cadmin\u201d reaches DC-01 from 192.168.56.102 and fires rule 5710 (level 5).",
  "The same source, the same invalid user: rule 5712 (level 10) fires \u2014 SSH brute force attack detected.",
  "In the same capture, WEB01 logs a PAM authentication failure (rule 5503, level 5).",
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="cf-mono cf-fs-data tracking-[0.2em] uppercase" style={{ color: "var(--cf-red)" }}>
      {children}
    </p>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="cf-panel" style={{ border: "2px solid var(--cf-ink)", background: "var(--cf-paper-2)" }}>
      <div className="h-[3px] w-full" style={{ background: "var(--cf-ink)" }} />
      <div className="p-6">{children}</div>
    </div>
  );
}

function SectionHead({ kicker, title }: { kicker: string; title: string }) {
  return (
    <Reveal>
      <div className="cf-sec-head">
        <p className="cf-kicker" style={{ marginBottom: 8 }}>{kicker}</p>
        <h2 className="cf-h2">{title}</h2>
      </div>
    </Reveal>
  );
}

export default function Lab001Page() {
  return (
    <div className="pb-24">
      {/* TechArticle schema for the investigation. datePublished is the
          capture date the page itself prints (Oct 14, 2026); the page
          exposes no separate publication date. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: "LAB-001 — SSH Brute Force Detection",
          description:
            "One detection from the home lab, filed as an investigation: the captured telemetry, what the two rules mean, the order of events the capture shows, and the limits of a single lab capture.",
          url: `${site.url}/investigations/lab-001-ssh-brute-force`,
          mainEntityOfPage: `${site.url}/investigations/lab-001-ssh-brute-force`,
          datePublished: "2026-10-14",
          author: { "@id": `${site.url}/#person`, name: site.person },
          publisher: { "@id": `${site.url}/#person` },
          about: ["SSH brute force detection", "Wazuh", "SIEM", "Home SOC lab"],
        }}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "LAB-001 — SSH Brute Force Detection", path: "/investigations/lab-001-ssh-brute-force" },
        ])}
      />
      <div className="cf-wrap">
        <PageHead
          kicker="Investigation — home lab"
          title={
            <>
              LAB-001 — SSH Brute Force <span className="cf-u-red">Detection</span>
            </>
          }
          lede="One detection from the home lab, filed as an investigation: the captured telemetry, what the two rules mean, the order of events the capture shows, and the limits of a single lab capture."
        />

        {/* ── The file: case data ─────────────────────────────────── */}
        <section className="mt-12">
          <SectionHead kicker="Case data" title="The file" />
          <Reveal delay={0.05}>
            <Panel>
              <div className="space-y-5">
                {FILE_ROWS.map((row) => (
                  <div key={row.label}>
                    <FieldLabel>{row.label}</FieldLabel>
                    <p className="text-[var(--cf-ink-soft)] text-[15px] leading-relaxed mt-1.5" style={{ maxWidth: "68ch" }}>
                      {row.body}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          </Reveal>
        </section>

        {/* ── Telemetry: the capture, transcribed ─────────────────── */}
        <section className="mt-14">
          <SectionHead kicker="Telemetry" title="The capture" />
          <Reveal delay={0.05}>
            {/* The same terminal frame the homepage capture uses
                (cf-term), rendered static: this is a transcription of
                the published capture, not a feed. */}
            <div className="cf-term">
              <div className="cf-term-bar">
                <span className="cf-term-btns" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="cf-term-title">wazuh — docker-soc — alerts.log</span>
                <span className="cf-term-rec" aria-hidden="true">
                  <i />
                  Rec
                </span>
              </div>
              <div className="cf-term-status">
                <span>Telemetry</span>
                <span>Captured — lab attack, Oct 14, 2026</span>
              </div>
              <div className="cf-term-body">
                <div className="cf-log-line">** Alert 1791978824.294411: - syslog,sshd,authentication_failed,</div>
                <div className="cf-log-line">2026 Oct 14 02:13:44 DC-01-&gt;/var/log/auth.log</div>
                <div className="cf-log-line">Rule: 5710 (level 5) -&gt; &apos;Attempt to login using a non-existent user&apos;</div>
                <div className="cf-log-line">Src IP: 192.168.56.102&nbsp;&nbsp;User: (invalid user) admin&nbsp;&nbsp;Decoder: sshd</div>
                <div className="cf-log-line">&nbsp;</div>
                <div className="cf-log-line">** Alert 1791978831.294455: - syslog,sshd,authentication_failed,</div>
                <div className="cf-log-line">2026 Oct 14 02:13:51 DC-01-&gt;/var/log/auth.log</div>
                <div className="cf-log-line">
                  Rule: <span className="alert">5712</span> (level 10) -&gt; &apos;SSH brute force attack detected&apos;
                </div>
                <div className="cf-log-line">Src IP: 192.168.56.102&nbsp;&nbsp;User: (invalid user) admin&nbsp;&nbsp;Decoder: sshd</div>
                <div className="cf-log-line">&nbsp;</div>
                <div className="cf-log-line">** Alert 1791978903.294512: - syslog,pam,authentication_failed,</div>
                <div className="cf-log-line">2026 Oct 14 02:15:03 WEB01-&gt;/var/log/auth.log</div>
                <div className="cf-log-line">Rule: 5503 (level 5) -&gt; &apos;PAM: User login failed.&apos;</div>
                <div className="cf-log-line">
                  Src IP: <span className="cf-redact">10.143.0.67</span>&nbsp;&nbsp;User: rmahajan&nbsp;&nbsp;Decoder: pam_unix
                </div>
              </div>
            </div>
            <p className="cf-mono cf-fs-data text-[var(--cf-muted)] mt-3">
              Transcribed from the homepage Exhibit B capture, exactly as published there.
            </p>
          </Reveal>
        </section>

        {/* ── Detection: what the rules mean ──────────────────────── */}
        <section className="mt-14">
          <SectionHead kicker="Detection" title="What the rules mean" />
          <Reveal delay={0.05}>
            <Panel>
              <div className="space-y-5">
                <div>
                  <FieldLabel>Rule 5710 — level 5</FieldLabel>
                  <p className="text-[var(--cf-ink-soft)] text-[15px] leading-relaxed mt-1.5" style={{ maxWidth: "68ch" }}>
                    Fires when a login is attempted with a user that does not exist. In this capture the
                    attempt was against the user &ldquo;admin&rdquo; on DC-01, from 192.168.56.102, decoded by sshd.
                  </p>
                </div>
                <div>
                  <FieldLabel>Rule 5712 — level 10</FieldLabel>
                  <p className="text-[var(--cf-ink-soft)] text-[15px] leading-relaxed mt-1.5" style={{ maxWidth: "68ch" }}>
                    The brute-force alert. It fired from the same source IP and the same invalid user as the
                    5710 alert: repeated authentication failures, until the pattern itself is the event.
                  </p>
                </div>
              </div>
            </Panel>
          </Reveal>
        </section>

        {/* ── Investigation: the order the capture shows ──────────── */}
        <section className="mt-14">
          <SectionHead kicker="Investigation" title="The order of events" />
          <Reveal delay={0.05}>
            <Panel>
              <p className="text-[var(--cf-ink-soft)] text-[15px] leading-relaxed" style={{ maxWidth: "68ch" }}>
                The sequence below is the order the capture shows. Nothing has been added to it.
              </p>
              <div className="space-y-4 mt-5">
                {TIMELINE.map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span
                      className="cf-mono cf-fs-label font-bold shrink-0 flex items-center justify-center"
                      style={{
                        width: 30, height: 30,
                        border: "2px solid var(--cf-ink)",
                        color: "var(--cf-red)",
                        background: "var(--cf-paper)",
                      }}
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <p className="text-[var(--cf-ink-soft)] text-[15px] leading-relaxed pt-1" style={{ maxWidth: "64ch" }}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          </Reveal>
        </section>

        {/* ── Response: only what can be stated ───────────────────── */}
        <section className="mt-14">
          <SectionHead kicker="Response" title="What can be stated" />
          <Reveal delay={0.05}>
            <Panel>
              <p className="text-[var(--cf-ink-soft)] text-[15px] leading-relaxed" style={{ maxWidth: "68ch" }}>
                The attack was self-run, inside the lab, against his own machines, and the detection fired at
                level 10. A full incident report exists for this run — he writes one for every run — but the
                report is not published. It is available on request.
              </p>
            </Panel>
          </Reveal>
        </section>

        {/* ── Result & limitations ────────────────────────────────── */}
        <section className="mt-14">
          <SectionHead kicker="Result & limitations" title="What this proves, and what it does not" />
          <Reveal delay={0.05}>
            <Panel>
              <div className="space-y-5">
                <div>
                  <FieldLabel>Result</FieldLabel>
                  <p className="text-[var(--cf-ink-soft)] text-[15px] leading-relaxed mt-1.5" style={{ maxWidth: "68ch" }}>
                    Detection worked as configured: the non-existent-user attempt was logged at level 5, and
                    the brute-force pattern alerted at level 10.
                  </p>
                </div>
                <div>
                  <FieldLabel>Limitations</FieldLabel>
                  <p className="text-[var(--cf-ink-soft)] text-[15px] leading-relaxed mt-1.5" style={{ maxWidth: "68ch" }}>
                    This is a single lab capture. No production environment was involved, and the response
                    detail lives in the unpublished per-run incident report — so this page shows the detection
                    and the capture, and nothing past them.
                  </p>
                </div>
              </div>
            </Panel>
          </Reveal>
        </section>

        {/* ── Cross-references ────────────────────────────────────── */}
        <Reveal className="mt-12">
          <p className="cf-note">
            Filed under: <Link href="/cybersecurity" className="cf-ulink">Cybersecurity</Link> — the lab this
            ran in is documented there, and the capture itself sits on the{" "}
            <Link href="/" className="cf-ulink">homepage</Link> as Exhibit B.
          </p>
        </Reveal>
      </div>
    </div>
  );
}
