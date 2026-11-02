import { PageHead } from "@/components/casefile/PageHead";
import { Reveal } from "@/components/casefile/Reveal";
import { Stamp } from "@/components/casefile/Stamp";
import { CareerSection } from "@/components/sections/CareerSection";
import { CinematicExperience } from "@/components/sections/CinematicExperience";

const STATS = [
  { value: "3+", label: "Years in Security" },
  { value: "9", label: "Roles Held" },
  { value: "100+", label: "Incidents Documented" },
  { value: "2026", label: "SOC Target" },
];

export default function ExperiencePage() {
  return (
    <div className="pb-24">
      <div className="cf-wrap">
        <PageHead
          kicker="Experience, work history"
          title={
            <>
              Operator <span className="cf-u-red">History</span>
            </>
          }
          lede="One operator, four chapters, told as a film: scroll and watch the chef become the officer become the analyst. Every role, duty and date on this page is the real record."
        />

        {/* Stats: a mono ruled strip, with a stamp sitting on its top rule */}
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
            100+ incidents documented — incident reports filed across his physical security roles since 2023.
          </p>
        </Reveal>

        {/* The film: chef, loss prevention, security operations, cybersecurity */}
        <CinematicExperience />

        {/* Career roadmap (merged in from the old /career page, round 2) */}
        <CareerSection />
      </div>
    </div>
  );
}
