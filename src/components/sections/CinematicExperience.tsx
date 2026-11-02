"use client";

/**
 * CinematicExperience — the /experience page as one continuous scroll film.
 *
 * A pinned stage holds a single illustrated operator (same head, same
 * proportions in every scene) while the chapter text scrolls beside it.
 * Scroll progress scrubs the transformation: the outgoing scene's lines
 * undraw and fade as the incoming scene draws itself in — Chef, then Loss
 * Prevention, then Security Operations, then Cybersecurity.
 *
 * Built on framer-motion's useScroll/useTransform (the project's installed
 * motion library): no new dependency, native reverse scrolling, and a
 * static stacked layout when the visitor prefers reduced motion.
 */
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

/* ------------------------------------------------------------------ */
/* Chapter data — the real record, same facts as the resume.           */
/* ------------------------------------------------------------------ */

type Role = { title: string; org: string; period: string; duties: string[] };
type Chapter = {
  id: string;
  kicker: string;
  narrative: string;
  intro: string;
  carry: string;
  roles: Role[];
  footnote?: string;
};

const CHAPTERS: Chapter[] = [
  {
    id: "chef",
    kicker: "Chapter 01 / The Chef",
    narrative: "It started in a completely different environment.",
    intro:
      "Kitchens taught the base skills everything else stands on: process discipline, quality standards, and staying calm when the tickets pile up.",
    carry: "Carried forward: discipline, standards, stamina under pressure.",
    roles: [
      {
        title: "Kitchen Supervisor (promoted from Line Cook)",
        org: "Boston Pizza",
        period: "Sep 2022 – Dec 2023",
        duties: [
          "Trained new hires and ran stations at peak times.",
          "Held food safety standards when the line was slammed.",
        ],
      },
      {
        title: "Line Cook",
        org: "Earls Kitchen + Bar · St. Louis Bar & Grill",
        period: "Jan 2025 – Oct 2025",
        duties: ["High-volume line work at two restaurants at the same time. Reliable attendance."],
      },
      {
        title: "Assistant Kitchen Manager",
        org: "Leopold's Tavern",
        period: "Feb 2025 – Jul 2025",
        duties: ["Supervised 10+ staff, ran task lists, helped with inventory counts and ordering."],
      },
    ],
  },
  {
    id: "loss-prevention",
    kicker: "Chapter 02 / Loss Prevention",
    narrative: "Then I learned what it means to protect.",
    intro:
      "Retail loss prevention: live surveillance, judgment calls in the moment, and reports that hold up after the fact.",
    carry: "Carried forward: watchfulness, evidence, calm escalation.",
    roles: [
      {
        title: "Loss Prevention Supervisor",
        org: "Impact Security Group (Dollarama)",
        period: "Jan 2025 – Present",
        duties: [
          "Watch live camera feeds and work the floor to spot theft before it leaves the store.",
          "Write the reports that go to management and police.",
        ],
      },
    ],
  },
  {
    id: "security-operations",
    kicker: "Chapter 03 / Security Operations",
    narrative: "From protecting physical spaces to understanding security operations.",
    intro:
      "Screening, access control, CCTV and site supervision: the operational side of security, run to an audit standard.",
    carry: "Carried forward: access control thinking, incident documentation, systems.",
    roles: [
      {
        title: "Screening Officer / Access Control Specialist",
        org: "Impact Security — Covenant Health · ADESA Auction",
        period: "May 2023 – Present",
        duties: [
          "Monitor CCTV and screen 100+ people a day at a hospital and a vehicle auction.",
          "Control access points and keep the logs audit-ready.",
          "Escalate with the 5 W's and coordinate with law enforcement when it counts.",
        ],
      },
      {
        title: "Site Supervisor",
        org: "GardaWorld — Strathcona County Hall",
        period: "Sep 2026 – Present",
        duties: [
          "Run a municipal site on the night shift: supervise guards, sort out coverage.",
          "GTrack tickets, Active Directory accounts, Avigilon cameras, Polaris and dispatch apps.",
          "Handovers and incident reports that hold up to an audit.",
        ],
      },
    ],
  },
  {
    id: "cybersecurity",
    kicker: "Chapter 04 / Cybersecurity",
    narrative: "Now, taking that experience into the digital world.",
    intro:
      "This chapter is being written now, in the lab and in client work — not claimed as security employment. The same watchfulness, pointed at networks instead of doors.",
    carry: "The target: SOC Analyst, Tier 1 — the frame every chapter points at.",
    roles: [
      {
        title: "Security Operations Analyst — Home SOC Lab",
        org: "Self-directed lab, Edmonton",
        period: "2024 – Present",
        duties: [
          "Wazuh SIEM watching a 4-machine network: Windows domain, web server, Kali attack box.",
          "50+ practice attacks run, matched to MITRE ATT&CK, every one written up.",
          "Own detection rules, tuned until the false alarms dropped.",
        ],
      },
      {
        title: "IT Lab Administrator — Home Lab",
        org: "Self-directed lab",
        period: "2024 – Present",
        duties: ["Active Directory, group policy, DNS and DHCP built by hand. PowerShell for the repeat jobs."],
      },
      {
        title: "Freelance Web & Software Developer",
        org: "Self-employed",
        period: "2024 – Present",
        duties: ["Secure websites for small business clients: logins, access control and form checks done properly."],
      },
    ],
    footnote:
      "CompTIA Security+ (Jun 2026) · ISC2 CC (2026) · Google Cybersecurity Professional Certificate (2026). Studying now: Microsoft SC-200 and TryHackMe SOC Level 1, both in progress.",
  },
];

/* ------------------------------------------------------------------ */
/* The operator — one head, drawn once, worn by every scene.           */
/* ------------------------------------------------------------------ */

const INK = "var(--cf-ink)";
const RED = "var(--cf-red)";

function CharacterHead({ draw }: { draw?: MotionValue<number> }) {
  const headOutline = draw ? (
    <motion.path
      d="M600,84 C648,84 664,124 662,168 C660,208 646,246 600,250 C554,246 540,208 538,168 C536,124 552,84 600,84 Z"
      fill="none"
      stroke={INK}
      strokeWidth={3}
      style={{ pathLength: draw }}
    />
  ) : (
    <path
      d="M600,84 C648,84 664,124 662,168 C660,208 646,246 600,250 C554,246 540,208 538,168 C536,124 552,84 600,84 Z"
      fill="none"
      stroke={INK}
      strokeWidth={3}
    />
  );
  return (
    <g>
      {/* neck */}
      <path d="M578,228 L578,274 C590,284 610,284 622,274 L622,228" fill="none" stroke={INK} strokeWidth={3} />
      {headOutline}
      {/* curly hair cap */}
      <path
        d="M536,160 C528,94 560,62 600,60 C640,62 672,94 664,160 C656,128 646,118 639,133 C633,110 617,104 609,120 C601,100 585,100 578,118 C566,102 550,112 549,131 C541,119 537,136 536,160 Z"
        fill="none"
        stroke={INK}
        strokeWidth={3}
      />
      <path d="M566,96 C574,86 590,84 596,94" fill="none" stroke={INK} strokeWidth={2.4} />
      <path d="M612,92 C622,84 636,88 640,100" fill="none" stroke={INK} strokeWidth={2.4} />
      {/* ears */}
      <path d="M538,172 C528,176 528,196 540,200" fill="none" stroke={INK} strokeWidth={2.6} />
      <path d="M662,172 C672,176 672,196 660,200" fill="none" stroke={INK} strokeWidth={2.6} />
      {/* brows + eyes */}
      <path d="M562,158 C570,153 584,153 592,157" fill="none" stroke={INK} strokeWidth={2.6} />
      <path d="M608,157 C616,153 630,153 638,158" fill="none" stroke={INK} strokeWidth={2.6} />
      <circle cx={577} cy={176} r={3} fill={INK} />
      <circle cx={623} cy={176} r={3} fill={INK} />
      {/* glasses */}
      <rect x={554} y={160} width={42} height={32} rx={7} fill="none" stroke={INK} strokeWidth={3} />
      <rect x={604} y={160} width={42} height={32} rx={7} fill="none" stroke={INK} strokeWidth={3} />
      <path d="M596,170 C599,166 601,166 604,170" fill="none" stroke={INK} strokeWidth={3} />
      <path d="M554,168 L539,163" stroke={INK} strokeWidth={3} />
      <path d="M646,168 L661,163" stroke={INK} strokeWidth={3} />
      {/* nose + mouth */}
      <path d="M601,182 L596,202 C596,207 602,209 607,206" fill="none" stroke={INK} strokeWidth={2.6} />
      <path d="M585,222 C593,227 607,227 615,222" fill="none" stroke={INK} strokeWidth={2.6} />
      {/* beard along the jaw */}
      <path
        d="M547,192 C551,230 571,255 600,257 C629,255 649,230 653,192 C646,222 629,238 600,239 C571,238 554,222 547,192 Z"
        fill="none"
        stroke={INK}
        strokeWidth={2.8}
      />
      <path d="M572,240 C580,247 592,249 600,249" fill="none" stroke={INK} strokeWidth={2} />
      <path d="M604,249 C614,248 624,245 630,238" fill="none" stroke={INK} strokeWidth={2} />
    </g>
  );
}

/* Torso shell shared by all outfits; hero outline scrubs with `draw`. */
function Torso({ draw }: { draw?: MotionValue<number> }) {
  const d = "M500,566 L512,362 C516,300 552,266 600,266 C648,266 684,300 688,362 L700,566";
  return draw ? (
    <motion.path d={d} fill="none" stroke={INK} strokeWidth={3} style={{ pathLength: draw }} />
  ) : (
    <path d={d} fill="none" stroke={INK} strokeWidth={3} />
  );
}

function Ground() {
  return <path d="M40,566 L880,566" stroke={INK} strokeWidth={2.4} />;
}

/* ------------------------------------------------------------------ */
/* Scene art — environments and outfits around the shared operator.    */
/* ------------------------------------------------------------------ */

const ENV = { stroke: INK, strokeWidth: 2.2, fill: "none" as const, strokeOpacity: 0.5 };

function Steam({ calm, x, delay }: { calm: boolean; x: number; delay: number }) {
  const d = `M${x},408 C${x - 8},384 ${x + 10},372 ${x},348 C${x - 8},328 ${x + 6},318 ${x},300`;
  if (calm) return <path d={d} {...ENV} strokeOpacity={0.65} />;
  return (
    <motion.path
      d={d}
      {...ENV}
      strokeOpacity={0.65}
      animate={{ y: [0, -12, 0], opacity: [0.35, 0.9, 0.35] }}
      transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

function SceneChef({ draw, calm }: { draw?: MotionValue<number>; calm: boolean }) {
  return (
    <g>
      {/* environment: the kitchen */}
      <g>
        <path d="M60,120 L860,120" {...ENV} strokeOpacity={0.35} />
        {draw ? (
          <motion.path d="M70,150 L430,150" fill="none" stroke={INK} strokeWidth={2.6} style={{ pathLength: draw }} />
        ) : (
          <path d="M70,150 L430,150" fill="none" stroke={INK} strokeWidth={2.6} />
        )}
        <path d="M130,150 L130,176" {...ENV} />
        <circle cx={130} cy={212} r={36} {...ENV} />
        <path d="M225,150 L225,172" {...ENV} />
        <circle cx={225} cy={200} r={28} {...ENV} />
        <path d="M330,150 L330,180" {...ENV} />
        <circle cx={330} cy={218} r={38} {...ENV} />
        <path d="M410,150 L410,192 M402,192 C402,204 418,204 418,192" {...ENV} />
        <path d="M700,168 L880,168" {...ENV} />
        <rect x={716} y={126} width={26} height={42} {...ENV} />
        <rect x={758} y={134} width={20} height={34} {...ENV} />
        <path d="M812,168 C812,146 852,146 852,168" {...ENV} />
        <path d="M60,472 L430,472" {...ENV} />
        <path d="M84,472 L84,566 M300,472 L300,566" {...ENV} />
        <rect x={176} y={418} width={96} height={54} {...ENV} />
        <path d="M168,418 L280,418 M272,436 L292,436 M176,436 L156,436" {...ENV} />
        <Steam calm={calm} x={206} delay={0} />
        <Steam calm={calm} x={242} delay={1.2} />
      </g>
      <Torso draw={draw} />
      <CharacterHead draw={draw} />
      {/* outfit: chef jacket + apron */}
      <g fill="none" stroke={INK} strokeWidth={2.8}>
        <path d="M570,272 L600,338 L630,272" />
        <path d="M576,300 L556,398 M624,300 L644,398" strokeWidth={2.2} />
        <path d="M538,398 L662,398 L670,566 L530,566 Z" />
        <path d="M538,398 L662,398" strokeWidth={3.4} />
        <path d="M680,318 C712,338 728,366 734,398" />
        <path d="M734,398 C744,393 753,400 750,411" strokeWidth={2.4} />
      </g>
      {[356, 392, 428].map((y) => (
        <g key={y} fill={INK}>
          <circle cx={577} cy={y} r={3.2} />
          <circle cx={623} cy={y} r={3.2} />
        </g>
      ))}
      {/* the pan, and its flame */}
      <path d="M748,404 L786,392" stroke={INK} strokeWidth={3.4} />
      <ellipse cx={814} cy={388} rx={34} ry={10} fill="none" stroke={INK} strokeWidth={3} />
      {calm ? (
        <path d="M798,372 C792,354 804,348 800,330 C814,344 818,356 814,372 Z" fill="none" stroke={RED} strokeWidth={2.6} />
      ) : (
        <motion.path
          d="M798,372 C792,354 804,348 800,330 C814,344 818,356 814,372 Z"
          fill="none"
          stroke={RED}
          strokeWidth={2.6}
          style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
          animate={{ scaleY: [1, 1.18, 0.94, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </g>
  );
}

function UniformBase() {
  return (
    <g fill="none" stroke={INK} strokeWidth={2.8}>
      <path d="M568,268 L600,302 L632,268" />
      <path d="M568,268 L555,293 L585,297 M632,268 L645,293 L615,297" strokeWidth={2.2} />
      <path d="M600,302 L600,518" strokeWidth={2.2} />
      <rect x={536} y={362} width={46} height={38} strokeWidth={2.2} />
      <path d="M536,377 L582,377" strokeWidth={2.2} />
      <rect x={618} y={362} width={46} height={38} strokeWidth={2.2} />
      <path d="M618,377 L664,377" strokeWidth={2.2} />
      <path d="M506,518 L694,518" strokeWidth={3} />
      <rect x={588} y={510} width={24} height={17} strokeWidth={2.2} />
    </g>
  );
}

function Radio({ calm }: { calm: boolean }) {
  return (
    <g fill="none" stroke={INK} strokeWidth={2.6}>
      <path d="M518,290 L503,236" />
      <rect x={511} y={288} width={23} height={37} rx={4} />
      <path d="M534,324 C515,350 545,368 531,400" strokeWidth={2.2} />
      {calm ? (
        <circle cx={523} cy={299} r={3.4} fill={RED} stroke="none" />
      ) : (
        <motion.circle
          cx={523}
          cy={299}
          r={3.4}
          fill={RED}
          stroke="none"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
      )}
    </g>
  );
}

function SceneLossPrevention({ draw, calm }: { draw?: MotionValue<number>; calm: boolean }) {
  return (
    <g>
      {/* environment: the store */}
      <g>
        {[250, 330, 410].map((y) => (
          <path key={y} d={`M60,${y} L400,${y}`} {...ENV} />
        ))}
        <path d="M60,196 L60,566 M400,196 L400,566" {...ENV} strokeOpacity={0.35} />
        <rect x={84} y={212} width={46} height={38} {...ENV} />
        <rect x={142} y={220} width={34} height={30} {...ENV} />
        <rect x={298} y={204} width={54} height={46} {...ENV} />
        <rect x={94} y={294} width={40} height={36} {...ENV} />
        <rect x={328} y={290} width={48} height={40} {...ENV} />
        <rect x={78} y={374} width={52} height={36} {...ENV} />
        <rect x={248} y={380} width={42} height={30} {...ENV} />
        {/* CCTV camera and its cone */}
        {draw ? (
          <motion.path
            d="M742,96 L814,84 L818,113 L746,125 Z"
            fill="none"
            stroke={INK}
            strokeWidth={2.6}
            style={{ pathLength: draw }}
          />
        ) : (
          <path d="M742,96 L814,84 L818,113 L746,125 Z" fill="none" stroke={INK} strokeWidth={2.6} />
        )}
        <path d="M779,84 L779,62 L738,62 M818,92 L886,70 M818,110 L886,140" {...ENV} />
        {calm ? (
          <circle cx={772} cy={100} r={4} fill={RED} />
        ) : (
          <motion.circle
            cx={772}
            cy={100}
            r={4}
            fill={RED}
            animate={{ opacity: [1, 0.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
        {/* the monitor he watches */}
        <rect x={722} y={392} width={158} height={112} {...ENV} />
        <rect x={734} y={404} width={134} height={78} {...ENV} strokeOpacity={0.75} />
        <path d="M758,482 L758,424 L790,424 L790,482 M826,434 L826,482 M812,482 L840,482" {...ENV} strokeOpacity={0.75} />
        <circle cx={848} cy={424} r={6} {...ENV} strokeOpacity={0.75} />
        <path d="M848,430 L848,452 M848,452 L838,482 M848,452 L858,482" {...ENV} strokeOpacity={0.75} />
        <path d="M801,504 L801,530 M770,530 L832,530" {...ENV} />
      </g>
      <Torso draw={draw} />
      <CharacterHead draw={draw} />
      <UniformBase />
      <Radio calm={calm} />
    </g>
  );
}

function SceneSecurityOps({ draw, calm }: { draw?: MotionValue<number>; calm: boolean }) {
  return (
    <g>
      {/* environment: the operations floor */}
      <g>
        <path d="M60,90 L880,90" {...ENV} strokeOpacity={0.35} />
        {draw ? (
          <motion.path
            d="M64,120 L440,120 L440,356 L64,356 Z"
            fill="none"
            stroke={INK}
            strokeWidth={2.6}
            style={{ pathLength: draw }}
          />
        ) : (
          <path d="M64,120 L440,120 L440,356 L64,356 Z" fill="none" stroke={INK} strokeWidth={2.6} />
        )}
        <path d="M252,120 L252,356 M64,238 L440,238" {...ENV} />
        <path d="M82,206 L122,172 L162,186 L202,148 L230,160" fill="none" stroke={RED} strokeWidth={2.4} />
        <path d="M298,214 L298,152 L356,152 L356,214 M314,214 L314,178 L340,178 L340,214" {...ENV} strokeOpacity={0.75} />
        <rect x={88} y={286} width={26} height={44} {...ENV} strokeOpacity={0.75} />
        <rect x={128} y={270} width={26} height={60} {...ENV} strokeOpacity={0.75} />
        <rect x={168} y={296} width={26} height={34} {...ENV} strokeOpacity={0.75} />
        <path d="M282,318 L420,318 M296,296 L330,296 L346,282 L392,282 L406,296 L420,296" {...ENV} strokeOpacity={0.75} />
        {calm ? null : (
          <motion.rect
            x={70}
            y={126}
            width={168}
            height={3}
            fill={RED}
            opacity={0.55}
            animate={{ y: [0, 100, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        {/* access-controlled door */}
        <rect x={738} y={150} width={140} height={416} {...ENV} />
        <path d="M738,196 L878,196 M862,340 L862,380" {...ENV} />
        <rect x={704} y={322} width={24} height={46} {...ENV} strokeOpacity={0.8} />
        <circle cx={716} cy={310} r={4.5} fill={RED} />
        {[334, 346, 358].map((y) => (
          <circle key={y} cx={716} cy={y} r={1.8} fill={INK} opacity={0.7} />
        ))}
      </g>
      <Torso draw={draw} />
      <CharacterHead draw={draw} />
      <UniformBase />
      <Radio calm={calm} />
      {/* earpiece + lanyard with ID */}
      <g fill="none" stroke={INK} strokeWidth={2.4}>
        <path d="M652,166 C665,171 665,197 654,204" />
        <path d="M654,204 C661,242 641,262 645,300" strokeWidth={2} />
        <path d="M584,286 L600,352 M616,286 L600,352" strokeWidth={2.2} />
        <rect x={585} y={352} width={30} height={42} />
        <rect x={591} y={358} width={18} height={15} strokeWidth={1.8} />
        <path d="M591,382 L609,382 M591,388 L604,388" strokeWidth={1.8} />
      </g>
    </g>
  );
}

function SceneCyber({ draw, calm }: { draw?: MotionValue<number>; calm: boolean }) {
  return (
    <g>
      {/* environment: the SOC desk */}
      <g>
        {/* network diagram */}
        <path d="M700,84 L770,60 M770,60 L838,88 M700,84 L760,120 M838,88 L760,120 M770,60 L760,120" {...ENV} />
        <circle cx={700} cy={84} r={7} {...ENV} strokeOpacity={0.8} />
        <circle cx={770} cy={60} r={7} {...ENV} strokeOpacity={0.8} />
        <circle cx={838} cy={88} r={7} {...ENV} strokeOpacity={0.8} />
        {calm ? (
          <circle cx={760} cy={120} r={6} fill="none" stroke={RED} strokeWidth={2.2} />
        ) : (
          <motion.circle
            cx={760}
            cy={120}
            r={6}
            fill="none"
            stroke={RED}
            strokeWidth={2.2}
            animate={{ opacity: [1, 0.25, 1] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          />
        )}
        {/* left monitor: terminal */}
        <rect x={84} y={176} width={208} height={138} {...ENV} />
        <path d="M188,314 L188,340 M148,340 L228,340" {...ENV} />
        <text x={104} y={208} fontFamily="JetBrains Mono, monospace" fontSize={19} fill={RED}>
          {">_"}
        </text>
        {[228, 250, 272, 294].map((y, i) => (
          <path key={y} d={`M104,${y} L${236 - i * 22},${y}`} {...ENV} strokeOpacity={0.75} />
        ))}
        {/* right monitor: the dashboard */}
        {draw ? (
          <motion.path
            d="M692,166 L888,166 L888,298 L692,298 Z"
            fill="none"
            stroke={INK}
            strokeWidth={2.6}
            style={{ pathLength: draw }}
          />
        ) : (
          <path d="M692,166 L888,166 L888,298 L692,298 Z" fill="none" stroke={INK} strokeWidth={2.6} />
        )}
        <path d="M712,272 L712,192 M712,272 L872,272" {...ENV} />
        <path d="M722,258 L756,224 L784,242 L818,198 L850,214 L868,190" fill="none" stroke={RED} strokeWidth={2.6} />
        <path d="M790,298 L790,330 M748,330 L832,330" {...ENV} />
        {/* desk + laptop + keyboard */}
        <path d="M360,478 L892,478 M400,478 L400,566 M856,478 L856,566" {...ENV} />
        <path d="M398,478 L398,436 L486,436 L486,478 M398,478 L486,478 L498,494 L388,494 Z" {...ENV} strokeOpacity={0.8} />
        <rect x={520} y={496} width={170} height={24} rx={3} {...ENV} strokeOpacity={0.85} />
        <path d="M536,508 L674,508" {...ENV} strokeOpacity={0.6} />
      </g>
      <Torso draw={draw} />
      <CharacterHead draw={draw} />
      {/* outfit: shirt + headset */}
      <g fill="none" stroke={INK} strokeWidth={2.8}>
        <path d="M576,268 L600,298 L624,268" />
        <path d="M600,298 L600,520" strokeWidth={2} />
        <rect x={540} y={352} width={40} height={32} strokeWidth={2} />
      </g>
      {[336, 372, 408, 444, 480].map((y) => (
        <circle key={y} cx={600} cy={y} r={2.6} fill={INK} />
      ))}
      <g fill="none" stroke={INK}>
        <path d="M536,152 C540,68 660,68 664,152" strokeWidth={5} />
        <rect x={522} y={162} width={21} height={40} rx={9} strokeWidth={2.8} />
        <rect x={657} y={162} width={21} height={40} rx={9} strokeWidth={2.8} />
        <path d="M666,198 C658,218 641,228 623,230" strokeWidth={2.6} />
        <circle cx={618} cy={230} r={4.5} fill={INK} stroke="none" />
      </g>
    </g>
  );
}

function SceneArt({ index, draw, calm }: { index: number; draw?: MotionValue<number>; calm: boolean }) {
  return (
    <g>
      <Ground />
      {index === 0 && <SceneChef draw={draw} calm={calm} />}
      {index === 1 && <SceneLossPrevention draw={draw} calm={calm} />}
      {index === 2 && <SceneSecurityOps draw={draw} calm={calm} />}
      {index === 3 && <SceneCyber draw={draw} calm={calm} />}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Stage — the pinned screen the film plays on.                        */
/* ------------------------------------------------------------------ */

const CAPTIONS = [
  "Scene 01 — The Line · Edmonton kitchens",
  "Scene 02 — The Floor · Retail loss prevention",
  "Scene 03 — The Post · Screening & site supervision",
  "Scene 04 — The Desk · Home SOC lab",
];

function sceneWindow(index: number) {
  const start = index * 0.25;
  const end = start + 0.25;
  return { start, end };
}

function SceneLayer({
  progress,
  index,
  calm,
}: {
  progress: MotionValue<number>;
  index: number;
  calm: boolean;
}) {
  const { start, end } = sceneWindow(index);
  const opacity = useTransform(
    progress,
    index === 0
      ? [0, end - 0.05, end + 0.03]
      : index === 3
        ? [start - 0.05, start + 0.04, 1]
        : [start - 0.05, start + 0.04, end - 0.04, end + 0.04],
    index === 0 ? [1, 1, 0] : index === 3 ? [0, 1, 1] : [0, 1, 1, 0],
  );
  const y = useTransform(progress, [start - 0.05, start + 0.05, end + 0.05], [18, 0, -18]);
  const draw = useTransform(
    progress,
    index === 0 ? [0, 0.1] : [start - 0.02, start + 0.12],
    index === 0 ? [0.35, 1] : [0, 1],
  );
  return (
    <motion.div className="absolute inset-0" style={{ opacity, y }} aria-hidden={index !== 0}>
      <svg viewBox="0 0 920 640" className="h-full w-full" role="img" aria-label={CAPTIONS[index]}>
        <SceneArt index={index} draw={draw} calm={calm} />
      </svg>
    </motion.div>
  );
}

function StageCaption({ progress, index }: { progress: MotionValue<number>; index: number }) {
  const { start, end } = sceneWindow(index);
  const opacity = useTransform(
    progress,
    index === 0
      ? [0, end - 0.05, end + 0.03]
      : index === 3
        ? [start - 0.05, start + 0.04, 1]
        : [start - 0.05, start + 0.04, end - 0.04, end + 0.04],
    index === 0 ? [1, 1, 0] : index === 3 ? [0, 1, 1] : [0, 1, 1, 0],
  );
  return (
    <motion.p
      className="cf-mono cf-fs-data col-start-1 row-start-1"
      style={{ opacity, color: "var(--cf-ink)" }}
    >
      {CAPTIONS[index]}
    </motion.p>
  );
}

function Stage({
  progress,
  height,
}: {
  progress: MotionValue<number>;
  height: string;
}) {
  const spine = useSpring(progress, { stiffness: 55, damping: 20, mass: 0.4 });
  return (
    <div
      className="cf-panel relative flex flex-col overflow-hidden"
      style={{ border: "2px solid var(--cf-ink)", background: "var(--cf-paper-2)", height }}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: "2px solid var(--cf-ink)" }}
      >
        <p className="cf-mono cf-fs-data tracking-[0.2em]" style={{ color: "var(--cf-ink)" }}>
          VISUAL RECORD / OPERATOR HISTORY
        </p>
        <p className="cf-mono cf-fs-data flex items-center gap-2" style={{ color: "var(--cf-red)" }}>
          <span
            className="inline-block h-2 w-2"
            style={{ background: "var(--cf-red)", borderRadius: "50%" }}
          />
          SCROLL TO PLAY
        </p>
      </div>

      <div className="relative flex-1">
        {[0, 1, 2, 3].map((i) => (
          <SceneLayer key={i} progress={progress} index={i} calm={false} />
        ))}
        {/* scroll spine */}
        <motion.div
          className="absolute left-0 top-0 w-[3px] origin-top"
          style={{ scaleY: spine, height: "100%", background: "var(--cf-red)" }}
        />
      </div>

      <div
        className="grid px-4 py-2.5"
        style={{ borderTop: "2px solid var(--cf-ink)" }}
      >
        {[0, 1, 2, 3].map((i) => (
          <StageCaption key={i} progress={progress} index={i} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter text — shared by the film layout and the static layout.     */
/* ------------------------------------------------------------------ */

function ChapterText({ chapter }: { chapter: Chapter }) {
  return (
    <div>
      <p className="cf-mono cf-fs-data tracking-[0.25em]" style={{ color: "var(--cf-red)" }}>
        {chapter.kicker}
      </p>
      <h2
        className="cf-display mt-4 text-3xl leading-tight sm:text-4xl"
        style={{ color: "var(--cf-ink)", maxWidth: "22ch" }}
      >
        {chapter.narrative}
      </h2>
      <p className="mt-5 text-[15px] leading-relaxed" style={{ color: "var(--cf-ink-soft)", maxWidth: "58ch" }}>
        {chapter.intro}
      </p>

      <div className="mt-9 space-y-8">
        {chapter.roles.map((role) => (
          <div key={role.title}>
            <h3 className="text-base font-semibold leading-snug" style={{ color: "var(--cf-ink)" }}>
              {role.title}
            </h3>
            <p className="cf-mono cf-fs-data mt-1" style={{ color: "var(--cf-muted)" }}>
              {role.org} · {role.period}
            </p>
            <ul className="mt-3 space-y-2">
              {role.duties.map((d) => (
                <li
                  key={d}
                  className="flex items-start gap-3 text-sm leading-relaxed"
                  style={{ color: "var(--cf-ink-soft)" }}
                >
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0" style={{ background: "var(--cf-red)" }} />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p
        className="cf-mono cf-fs-data mt-9 pl-4"
        style={{ color: "var(--cf-ink)", borderLeft: "3px solid var(--cf-red)", lineHeight: 1.7 }}
      >
        {chapter.carry}
      </p>
      {chapter.footnote && (
        <p className="mt-5 text-[13px] leading-relaxed" style={{ color: "var(--cf-muted)", maxWidth: "58ch" }}>
          {chapter.footnote}
        </p>
      )}
    </div>
  );
}

function NextFrame() {
  return (
    <div
      className="cf-panel mt-4 p-6"
      style={{ border: "3px dashed var(--cf-ink)", background: "transparent" }}
    >
      <div className="h-[4px] w-full" style={{ background: "var(--cf-red)" }} />
      <p className="cf-mono cf-fs-data mt-4 tracking-[0.2em]" style={{ color: "var(--cf-red)" }}>
        NEXT FRAME — NOT YET SHOT
      </p>
      <h3 className="cf-display mt-2 text-xl" style={{ color: "var(--cf-ink)" }}>
        SOC Analyst, Tier 1
      </h3>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--cf-ink-soft)", maxWidth: "62ch" }}>
        The role every chapter on this page is aimed at. The lab, the certs, and the incident
        mindset that started in a kitchen and a guard booth, pointed at a SOC desk in Edmonton
        or remote.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The experience itself.                                              */
/* ------------------------------------------------------------------ */

export function CinematicExperience() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  if (reduce) {
    /* Reduced motion: no pin, no scrub — each scene sits beside its chapter. */
    return (
      <div className="mt-16 space-y-20">
        {CHAPTERS.map((chapter, i) => (
          <section key={chapter.id} className="grid items-start gap-8 lg:grid-cols-2">
            <ChapterText chapter={chapter} />
            <div
              className="cf-panel overflow-hidden"
              style={{ border: "2px solid var(--cf-ink)", background: "var(--cf-paper-2)" }}
            >
              <svg viewBox="0 0 920 640" className="block w-full" role="img" aria-label={CAPTIONS[i]}>
                <SceneArt index={i} calm />
              </svg>
              <p
                className="cf-mono cf-fs-data px-4 py-2.5"
                style={{ color: "var(--cf-red)", borderTop: "2px solid var(--cf-ink)" }}
              >
                {CAPTIONS[i]}
              </p>
            </div>
          </section>
        ))}
        <NextFrame />
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative mt-16 lg:grid lg:grid-cols-[minmax(0,1fr)_540px] lg:gap-14">
      {/* Mobile stage: pinned above the chapters while they scroll under it. */}
      <div
        className="sticky top-[68px] z-20 mb-12 lg:hidden"
        style={{ background: "var(--cf-paper)" }}
      >
        <Stage progress={scrollYProgress} height="300px" />
      </div>

      <div>
        {CHAPTERS.map((chapter) => (
          <section
            key={chapter.id}
            className="flex flex-col justify-center py-16 lg:min-h-[108vh] lg:py-10"
          >
            <ChapterText chapter={chapter} />
          </section>
        ))}
        <div className="pb-20 lg:pb-[16vh]">
          <NextFrame />
        </div>
      </div>

      {/* Desktop stage: pinned beside the chapters for the whole film. */}
      <div className="relative hidden lg:block">
        <div className="sticky top-24">
          <Stage progress={scrollYProgress} height="min(76vh, 700px)" />
        </div>
      </div>
    </div>
  );
}
