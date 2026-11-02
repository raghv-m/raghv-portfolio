import { PageHead } from "@/components/casefile/PageHead";
import { Reveal } from "@/components/casefile/Reveal";
import { Stamp } from "@/components/casefile/Stamp";
import { ExperienceStory } from "@/components/sections/ExperienceStory";

const STATS = [
  { value: "11", label: "Roles on Record" },
  { value: "2022", label: "Building Since" },
  { value: "50+", label: "Attack Simulations Documented" },
  { value: "100+", label: "People Screened a Day, Covenant Health" },
];

export default function ExperiencePage() {
  return (
    <div className="pb-24">
      <div className="cf-wrap">
        <PageHead
          kicker="Experience, the full record"
          title={
            <>
              Every job. <span className="cf-u-red">One record.</span>
            </>
          }
          lede="Eleven roles in six chapters, in the order the work actually happened, overlaps included. Duties, dates and proof, with nothing dressed up: the software, the kitchens, the security years, the lab, and where it is all pointed."
        />

        {/* Honest numbers only: each one is backed by the record below */}
        <Reveal delay={0.08} className="relative mt-12">
          <Stamp
            tone="red"
            r={-4.1}
            s={1.01}
            o={0.9}
            bw={2.6}
            delay={350}
            className="absolute -top-4 right-4 sm:right-10 z-10 cf-fs-label"
          >
            On file
          </Stamp>
          <div
            className="grid grid-cols-2 sm:grid-cols-4"
            style={{ border: "2px solid var(--cf-ink)", background: "var(--cf-paper-2)" }}
          >
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className="px-5 py-4"
                style={{
                  borderLeft: i > 0 ? "1px solid var(--cf-faint)" : undefined,
                }}
              >
                <p className="cf-display text-2xl" style={{ color: "var(--cf-ink)" }}>{s.value}</p>
                <p className="cf-mono cf-fs-data text-[var(--cf-muted)] tracking-wider mt-1 uppercase">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="cf-mono cf-fs-data text-[var(--cf-muted)] mt-3">
            Every number on this page comes from the record below it. No skill percentages, no padded counts.
          </p>
        </Reveal>

        {/* The documentary: six chapters, one continuous record */}
        <ExperienceStory />
      </div>
    </div>
  );
}
