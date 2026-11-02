/**
 * The career roadmap data, shared by CareerSection (on /experience) and
 * the /roadmap progression board (audit-fix pass). Data only — each
 * surface keeps its own presentation. States are printed as they stand:
 * certs earned are DONE with their real dates, work under way is
 * IN PROGRESS or CURRENT/NEXT, and everything else stays PLANNED, GOAL
 * or FUTURE, exactly as the roadmap has always labelled it.
 */

export type RoadmapStatus = "CURRENT" | "NEXT" | "PLANNED" | "GOAL" | "VISION";

export type CareerNode = {
  id: string;
  label: string;
  title: string;
  timeline: string;
  status: RoadmapStatus;
  color: string;
  badge: string | null;
  isMilestone?: boolean;
  desc: string;
  skills: string[];
  certs: string[];
  note: string;
};

export const NODES: CareerNode[] = [
  {
    id: "current",
    label: "NOW",
    title: "Screening Officer + Active Learner",
    timeline: "Apr 2023 – Present",
    status: "CURRENT",
    color: "var(--green)",
    badge: "YOU ARE HERE",
    desc: "Building the foundation in physical security operations while aggressively pursuing cybersecurity knowledge. Every shift at ADESA and Covenant Health is a lesson in incident response, access control, and documentation. The SOC mindset begins here.",
    skills: ["Incident Reporting", "Access Control", "SIEM Fundamentals", "Active Directory", "Linux Admin", "Python", "TCP/IP Networking"],
    certs: ["ISC2 CC ✓", "Google Cybersecurity ✓", "Security+ ✓"],
    note: "The guard booth teaches the same mindset as the SOC: monitor, detect, respond, document.",
  },
  {
    id: "soc1",
    label: "2026",
    title: "SOC Analyst, Tier 1",
    timeline: "Target: 2025–2026",
    status: "NEXT",
    color: "var(--gold)",
    badge: null,
    desc: "Entry point to the blue team. Alert triage, SIEM operations, ticket escalation, shift documentation. Learning the environment from the ground up and building the adversarial awareness that will eventually move me to the red side.",
    skills: ["Alert Triage", "SIEM Operations", "Ticket Escalation", "Log Correlation", "IR Documentation", "Shift Reporting"],
    certs: ["CompTIA Security+"],
    note: "Edmonton-first. Open to remote. Primary short-term target.",
  },
  {
    id: "soc2",
    label: "2027",
    title: "SOC Analyst T2 / Threat Hunter",
    timeline: "2027–2028",
    status: "PLANNED",
    color: "var(--blue)",
    badge: null,
    desc: "Deeper investigation, malware triage, threat hunting across the environment. Building the adversarial mindset that bridges blue to red, understanding how attackers think by watching them in action in the SIEM.",
    skills: ["Threat Hunting", "Malware Triage", "IR Lead", "SIEM Rule Authoring", "MITRE ATT&CK", "Threat Intelligence"],
    certs: ["CySA+", "CASP+"],
    note: "This stage builds the offensive intuition essential for penetration testing.",
  },
  {
    id: "pentest",
    label: "2028",
    title: "Penetration Tester / Red Team Analyst",
    timeline: "2028+",
    status: "GOAL",
    color: "var(--gold)",
    badge: "PRIMARY GOAL",
    isMilestone: true,
    desc: "The long-term target. Offensive security assessments: identifying and exploiting vulnerabilities before real attackers do. Web app testing, network pentesting, Active Directory attacks, professional report writing.",
    skills: ["Vulnerability Assessment", "Exploit Development", "Metasploit", "Burp Suite", "Custom Tooling", "Professional Report Writing", "Client Communication"],
    certs: ["OSCP (north star certification)", "CEH", "eJPT"],
    note: "OSCP is the milestone that unlocks this role. Everything I'm building (the lab, the certs, the scripting) feeds directly into this.",
  },
  {
    id: "senior",
    label: "Long-Term",
    title: "Senior Pentester / Red Team Lead",
    timeline: "Long-term vision",
    status: "VISION",
    color: "var(--gold-muted)",
    badge: null,
    desc: "Independent assessments, specialized domain expertise, and leading red team engagements. Web app, network, Active Directory, and cloud penetration testing at the highest level.",
    skills: ["Web App PenTest", "Network PenTest", "AD & Cloud PenTest", "Red Team Leadership", "Security Research"],
    certs: ["OSED", "OSEP", "CRTO", "CISSP"],
    note: "International ambitions: Dubai, Australia, or senior Canadian engagements.",
  },
];

export const SKILLS = [
  { name: "Network Security", evidence: "Built the lab network: subnets, DHCP, DNS, NAT, firewall rules." },
  { name: "LAN Setup & Networking (Home Lab)", evidence: "The 4-node lab network, built from zero." },
  { name: "SIEM & Log Analysis", evidence: "Wazuh home lab, own detection rules, 50+ documented attack runs." },
  { name: "Incident Response", evidence: "A written report for every lab run; incident reports filed in security jobs." },
  { name: "Linux Administration", evidence: "Ubuntu servers run for client sites: firewall, SSL, patching." },
  { name: "Active Directory", evidence: "Home lab domain controller (users, GPO); account work at his security site." },
  { name: "Python & Scripting", evidence: "Security log parser and automation scripts on GitHub." },
  { name: "Threat Detection", evidence: "Lab detections mapped to MITRE ATT&CK (see the Cybersecurity heatmap)." },
  { name: "Web Application Security", evidence: "Client sites shipped with CSRF/XSS protections and input validation." },
  { name: "Offensive Security", evidence: "Kali attack platform in the lab; TryHackMe SOC L1 in progress (65%)." },
];

export type CertStatus = "DONE" | "IN_PROGRESS" | "PLANNED" | "GOAL" | "FUTURE";

export type CertEntry = {
  name: string;
  abbr: string;
  status: CertStatus;
  star?: boolean;
  /** When the state was reached, where the record gives one. */
  when?: string;
};

/** The cert stack as /experience's timeline prints it. */
export const CERTS: CertEntry[] = [
  { name: "Google Cybersecurity", abbr: "GCC", status: "DONE" },
  { name: "ISC2 CC", abbr: "CC", status: "DONE" },
  { name: "Security+", abbr: "SEC+", status: "DONE" },
  { name: "CySA+", abbr: "CySA+", status: "PLANNED" },
  { name: "eJPT", abbr: "eJPT", status: "PLANNED" },
  { name: "OSCP", abbr: "OSCP", status: "GOAL", star: true },
  { name: "OSED", abbr: "OSED", status: "FUTURE" },
  { name: "OSEP", abbr: "OSEP", status: "FUTURE" },
];

/**
 * The full certification track for the /roadmap board: the CERTS above
 * with their true dates, plus the two tracks actually in progress —
 * TryHackMe SOC L1 (65% per the About narrative) and Microsoft SC-200.
 */
export const ROADMAP_CERTS: CertEntry[] = [
  { name: "Google Cybersecurity", abbr: "GCC", status: "DONE" },
  { name: "ISC2 CC", abbr: "CC", status: "DONE", when: "2026" },
  { name: "Security+", abbr: "SEC+", status: "DONE", when: "Jun 2026" },
  { name: "TryHackMe SOC L1", abbr: "THM L1", status: "IN_PROGRESS" },
  { name: "Microsoft SC-200", abbr: "SC-200", status: "IN_PROGRESS" },
  { name: "CySA+", abbr: "CySA+", status: "PLANNED" },
  { name: "eJPT", abbr: "eJPT", status: "PLANNED" },
  { name: "OSCP", abbr: "OSCP", status: "GOAL", star: true },
  { name: "OSED", abbr: "OSED", status: "FUTURE" },
  { name: "OSEP", abbr: "OSEP", status: "FUTURE" },
];
