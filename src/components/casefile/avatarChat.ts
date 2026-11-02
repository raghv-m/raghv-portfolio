import { FAQS } from "./faqData";

/*
 * The avatar companion's brain (avatar-upgrade pass): a built-in
 * knowledge base that runs entirely in the visitor's browser. No
 * network calls, no model, no cost, and nothing typed into the panel
 * ever leaves the page.
 *
 * Every answer is sourced from the site itself so it cannot drift:
 * business and pricing answers reuse FAQS from faqData.ts verbatim
 * (the same array the homepage accordion and FAQPage schema use), and
 * the career answers transcribe the certifications page data,
 * careerData.ts, the cybersecurity page's lab facts, and public/llms.txt.
 * Nothing here invents a price, a date, an employer, or a credential:
 * SC-200 and TryHackMe SOC L1 are always described as in progress,
 * never as held.
 */

export type ChatAction = { label: string; href: string };

export type ChatEntry = {
  id: string;
  /** Lowercase substrings scored against the visitor's question. */
  keys: string[];
  answer: string;
  actions?: ChatAction[];
};

export type ChatReply = { text: string; actions?: ChatAction[] };

const ESTIMATE: ChatAction = { label: "Run the estimator", href: "/estimate" };
const CONTACT: ChatAction = { label: "Contact page", href: "/contact" };

/** FAQ answers come straight from faqData — same text the site prints. */
function faqEntry(index: number, keys: string[], actions?: ChatAction[]): ChatEntry {
  return { id: `faq-${index}`, keys, answer: FAQS[index].a, actions };
}

export const CHAT_ENTRIES: ChatEntry[] = [
  {
    id: "who",
    keys: ["who is raghav", "who is he", "who", "about raghav", "about him", "background", "raghav mahajan", "developer"],
    answer:
      "Raghav Mahajan is a web developer and SOC analyst in Edmonton, Alberta, Canada. He builds secure websites and web apps for small businesses, works in security operations, runs a four-node home lab, and publishes the Blue Team Brief cybersecurity newsletter.",
    actions: [
      { label: "About him", href: "/about" },
      { label: "Experience", href: "/experience" },
    ],
  },
  {
    id: "soc",
    keys: ["soc", "job", "jobs", "hire", "hiring", "available", "availability", "open to work", "role", "roles", "analyst", "relocat", "remote", "employ"],
    answer:
      "Yes. He is open to SOC analyst roles in Edmonton and elsewhere in Canada, including remote work and relocation. The experience page has the roles so far, and the roadmap shows the path he is on.",
    actions: [
      { label: "Experience", href: "/experience" },
      { label: "Roadmap", href: "/roadmap" },
    ],
  },
  {
    id: "inprogress",
    keys: ["sc-200", "sc200", "tryhackme", "thm", "studying", "in progress", "learning", "training path"],
    answer:
      "Two things are in progress. Microsoft SC-200 (Security Operations Analyst) is the certification he is studying for. TryHackMe SOC Level 1 is a hands-on training path, at 65%; it is training, not a certification. Neither one is a held credential yet.",
    actions: [
      { label: "Certifications", href: "/certifications" },
      { label: "Roadmap", href: "/roadmap" },
    ],
  },
  {
    id: "certs",
    keys: ["cert", "qualification", "qualified", "security+", "security plus", "isc2", "google", "first aid", "licence", "license", "credential"],
    answer:
      "Held now: CompTIA Security+ (SY0-701, Jun 2026), ISC2 Certified in Cybersecurity (CC, 2026), the Google Cybersecurity program courses (Jan 2026), Intermediate First Aid (Oct 2026, valid to Oct 2029), and an Alberta Security Guard License (2023). In progress, not held yet: Microsoft SC-200, and TryHackMe SOC Level 1 training at 65%.",
    actions: [{ label: "Certifications", href: "/certifications" }],
  },
  {
    id: "lab001",
    keys: ["lab-001", "lab 001", "lab001", "investigation", "ssh", "brute", "proof", "evidence", "write-up", "writeup", "case study"],
    answer:
      "LAB-001 is a full investigation of an SSH brute-force detection in his home lab, captured on Oct 14, 2026. Wazuh rules 5710 and 5712 fired on the same source, and the page walks through the telemetry, the detection, and the response.",
    actions: [
      { label: "Read LAB-001", href: "/investigations/lab-001-ssh-brute-force" },
      { label: "Cybersecurity", href: "/cybersecurity" },
    ],
  },
  {
    id: "splunk",
    keys: ["splunk"],
    answer:
      "Splunk is lab-only for him: SPL fundamentals through TryHackMe SOC Level 1 training. It is part of the practice setup, not a production system he has run.",
    actions: [{ label: "Cybersecurity", href: "/cybersecurity" }],
  },
  {
    id: "lab",
    keys: ["lab", "wazuh", "siem", "nodes", "node", "simulation", "simulations", "attack", "attacks", "practice", "homelab", "docker", "kali"],
    answer:
      "The home lab has four nodes: DC-01, a Windows Server 2022 domain controller; WEB01, the web server; KALI01, the attack platform; and WAZUH01, running Wazuh in Docker as the SIEM. He has run more than 50 documented practice attack simulations in it, with a written report for every run.",
    actions: [
      { label: "Cybersecurity", href: "/cybersecurity" },
      { label: "Read LAB-001", href: "/investigations/lab-001-ssh-brute-force" },
    ],
  },
  {
    id: "skills",
    keys: ["skill", "skills", "tools", "toolstack", "stack", "python", "linux", "active directory", "network security", "wireshark", "nmap"],
    answer:
      "The core set: SIEM and log analysis with Wazuh, incident response, Active Directory, Linux administration, network security, and Python scripting. On the experience and cybersecurity pages, every skill is printed with the evidence behind it instead of a percentage.",
    actions: [
      { label: "Experience", href: "/experience" },
      { label: "Cybersecurity", href: "/cybersecurity" },
    ],
  },
  faqEntry(0, ["cost", "price", "pricing", "much", "quote", "estimate", "charge"], [ESTIMATE]),
  faqEntry(1, ["pay", "payment", "deposit", "gst", "invoice", "billing"], [ESTIMATE]),
  faqEntry(2, ["long", "timeline", "deadline", "fast", "soon", "schedule", "take"], [ESTIMATE]),
  faqEntry(3, ["start", "begin", "need from me", "get started", "process", "questionnaire"], [ESTIMATE, CONTACT]),
  faqEntry(4, ["revision", "revisions", "warranty", "changes", "defects"], [ESTIMATE]),
  faqEntry(5, ["host", "hosting", "hosted", "care plan", "maintenance", "server"], [ESTIMATE]),
  faqEntry(6, ["agency", "cheap", "below", "cheaper", "discount", "why so", "overhead"], [ESTIMATE]),
  {
    id: "portfolio",
    keys: ["portfolio", "projects", "project", "samples", "his work", "built", "websites he", "clients", "vic", "cameleers"],
    answer:
      "The portfolio page has his websites, web apps, and security projects. The featured build is Vic Cameleers, a live site for a removals company in Melbourne, Australia.",
    actions: [{ label: "Portfolio", href: "/portfolio" }],
  },
  {
    id: "newsletter",
    keys: ["newsletter", "blue team", "brief", "blog", "subscribe", "writing", "articles", "news"],
    answer:
      "Blue Team Brief is his cybersecurity newsletter: the week's real attacks in plain English, and what to hunt for. It has 284 subscribers. The archive is on the newsletter page, and his longer write-ups are on the blog.",
    actions: [
      { label: "Newsletter", href: "/newsletter" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    id: "contact",
    keys: ["contact", "email", "reach", "touch", "phone", "talk", "message him"],
    answer: "His email is hello@raghv.dev. The contact page has the form and the rest of the details.",
    actions: [CONTACT],
  },
  {
    id: "location",
    keys: ["where", "located", "location", "based", "city", "edmonton"],
    answer:
      "He is based in Edmonton, Alberta, Canada. For SOC roles he is open to remote work and relocation across Canada.",
    actions: [CONTACT],
  },
];

export const CHAT_GREETING =
  "I am the guide for this site. Ask me about his SOC work, the home lab, his certifications, or what a website costs. Everything I say comes from the pages here.";

export const CHAT_FALLBACK: ChatReply = {
  text: "That one is not covered by what is on this site, and I only answer from the site. Try one of the questions below, or reach him through the contact page.",
  actions: [CONTACT],
};

/** Quick-question chips: each one asks a fixed knowledge-base entry. */
export const CHAT_CHIPS: { label: string; entryId: string }[] = [
  { label: "Open to SOC roles?", entryId: "soc" },
  { label: "His certifications", entryId: "certs" },
  { label: "Show me lab proof", entryId: "lab001" },
  { label: "Website cost?", entryId: "faq-0" },
  { label: "How do payments work?", entryId: "faq-1" },
  { label: "Contact him", entryId: "contact" },
];

function replyFor(entry: ChatEntry): ChatReply {
  return { text: entry.answer, actions: entry.actions };
}

export function answerById(entryId: string): ChatReply {
  const entry = CHAT_ENTRIES.find((e) => e.id === entryId);
  return entry ? replyFor(entry) : CHAT_FALLBACK;
}

/**
 * Keyword scoring: every key found in the question adds its length, so
 * long, specific keys ("investigation", "security+") outweigh short,
 * generic ones ("who", "lab"). Best score wins; ties keep the earlier
 * entry, so the list order above is the priority order.
 */
export function answerQuestion(raw: string): ChatReply {
  const text = raw.toLowerCase();
  let best: ChatEntry | null = null;
  let bestScore = 0;
  for (const entry of CHAT_ENTRIES) {
    let score = 0;
    for (const key of entry.keys) {
      if (text.includes(key)) score += Math.max(2, key.length);
    }
    if (score > bestScore) {
      best = entry;
      bestScore = score;
    }
  }
  return best ? replyFor(best) : CHAT_FALLBACK;
}
