import https from "https";

const HOST = process.env.TURSO_HOST;
const TOKEN = process.env.TURSO_AUTH_TOKEN;
if (!HOST || !TOKEN) {
  console.error("Error: TURSO_HOST and TURSO_AUTH_TOKEN env vars must be set.");
  console.error("Run: TURSO_HOST=<host> TURSO_AUTH_TOKEN=<token> node scripts/seed-posts.mjs");
  process.exit(1);
}
const now = new Date().toISOString();
const cuid = () => "c" + Math.random().toString(36).slice(2, 11) + Math.random().toString(36).slice(2, 6);

const posts = [
  {
    id: cuid(),
    title: "Building My Home SOC Lab: Wazuh SIEM from Scratch",
    slug: "wazuh-siem-home-lab",
    category: "Lab",
    excerpt: "How I built a fully functional SOC environment at home using Wazuh as the SIEM, with custom detection rules, dashboards, and alert pipelines.",
    tags: JSON.stringify(["wazuh", "siem", "homelab", "detection", "linux"]),
    readTime: 12,
    published: 1,
    featured: 1,
    content: `## Overview

This lab documents how I deployed Wazuh in my home lab to simulate a real SOC environment. The goal was to go beyond theory and actually build detection pipelines I could break and fix myself.

## Architecture

My home lab runs on a mini PC with 32GB RAM and a 2TB SSD, hosting multiple VMs through VMware Workstation:

- **DC-01**: Windows Server 2022 — Active Directory domain controller
- **WEB01**: Ubuntu 22.04 — Simulated web server with Apache
- **KALI01**: Kali Linux — Attacker machine for red team exercises
- **WAZUH01**: Ubuntu 22.04 — Wazuh Manager + Elasticsearch + Kibana

<Callout type="info">
Wazuh is an open-source SIEM that combines log analysis, intrusion detection, vulnerability detection, and compliance monitoring in one platform.
</Callout>

## Wazuh Installation

\`\`\`bash
# On the Wazuh manager node
curl -sO https://packages.wazuh.com/4.7/wazuh-install.sh
sudo bash wazuh-install.sh -a
\`\`\`

After installation, the web interface is accessible at \`https://wazuh-manager-ip\` with credentials printed at the end of the install script.

## Deploying Agents

I installed Wazuh agents on all lab machines. On Windows:

\`\`\`powershell
Invoke-WebRequest -Uri https://packages.wazuh.com/4.x/windows/wazuh-agent-4.7.0-1.msi -OutFile wazuh-agent.msi
msiexec /i wazuh-agent.msi WAZUH_MANAGER='192.168.1.100'
\`\`\`

## Custom Detection Rules

The real learning came from writing custom rules. Here's one I wrote to detect brute force against SSH:

\`\`\`xml
<rule id="100001" level="10" frequency="5" timeframe="60">
  <if_matched_sid>5716</if_matched_sid>
  <description>SSH brute force attack detected</description>
  <mitre>
    <id>T1110.001</id>
  </mitre>
</rule>
\`\`\`

<Callout type="tip">
Always test rules in a staging environment first. A misconfigured rule with level 15 can flood your alerts and drown out real threats.
</Callout>

## What I Learned

- Wazuh decoder pipeline and how to write custom decoders
- Alert tuning to reduce false positives from noisy Windows event logs
- How to map detections to MITRE ATT&CK techniques
- Building Kibana dashboards for executive-level reporting

## Next Steps

Currently integrating Suricata as a network IDS and feeding its alerts into Wazuh for correlated detections across host and network layers.`,
  },
  {
    id: cuid(),
    title: "Active Directory Attack & Detect: Kerberoasting Lab",
    slug: "kerberoasting-lab-walkthrough",
    category: "Lab",
    excerpt: "Setting up a Kerberoasting attack in my home lab and building Wazuh detection rules to catch it. Full red-blue exercise documented.",
    tags: JSON.stringify(["active-directory", "kerberoasting", "detection", "windows", "mitre"]),
    readTime: 10,
    published: 1,
    featured: 0,
    content: `## What is Kerberoasting?

Kerberoasting is a post-exploitation technique where an attacker with any valid domain account requests Kerberos service tickets for service accounts, then cracks them offline. It targets accounts with Service Principal Names (SPNs).

<Callout type="warning">
This lab was performed entirely in an isolated home lab environment. Never attempt this on networks you do not own.
</Callout>

## Lab Environment

- **Attacker**: Kali Linux with Impacket installed
- **Victim**: Windows Server 2022 AD with a vulnerable service account
- **Defender**: Wazuh SIEM monitoring Windows Security logs

## Setting Up the Vulnerable Account

\`\`\`powershell
New-ADUser -Name "svc-webapp" -SamAccountName "svc-webapp" -AccountPassword (ConvertTo-SecureString "Password123!" -AsPlainText -Force) -Enabled $true
setspn -a HTTP/webapp.lab.local svc-webapp
\`\`\`

## The Attack

From Kali, using Impacket:

\`\`\`bash
python3 GetUserSPNs.py lab.local/normaluser:Password1 -dc-ip 192.168.1.10 -request -outputfile hashes.txt
hashcat -m 13100 hashes.txt /usr/share/wordlists/rockyou.txt
\`\`\`

## Detection with Wazuh

Windows logs Event ID 4769 for every TGS request. RC4 encryption type (0x17) is the giveaway:

\`\`\`xml
<rule id="100010" level="12">
  <if_sid>60103</if_sid>
  <field name="win.system.eventID">^4769$</field>
  <field name="win.eventdata.ticketEncryptionType">^0x17$</field>
  <description>Kerberoasting: RC4 encrypted TGS ticket requested</description>
  <mitre>
    <id>T1558.003</id>
  </mitre>
</rule>
\`\`\`

<Callout type="info">
Enforcing AES-256 for all service accounts eliminates the crackable hash problem entirely. RC4 should be disabled org-wide.
</Callout>

## Key Takeaways

- Kerberoasting is silent from the network — detection must happen on the DC
- Maps to MITRE ATT&CK T1558.003
- Fix: enforce AES-only encryption + strong service account passwords (25+ chars)`,
  },
  {
    id: cuid(),
    title: "My SOC Analyst Study Roadmap: From Zero to Security+",
    slug: "soc-analyst-study-roadmap",
    category: "Career",
    excerpt: "The exact resources, labs, and certifications I used to go from no IT background to Security+ certified and actively hunting SOC analyst roles.",
    tags: JSON.stringify(["career", "soc", "security-plus", "tryhackme", "roadmap"]),
    readTime: 8,
    published: 1,
    featured: 1,
    content: `## Background

I didn't come from a traditional IT background. I worked as a security guard, then pivoted into software development, and now I'm building toward a career in cybersecurity — specifically as a SOC Tier 1 Analyst on the path to penetration testing.

This is the exact roadmap I followed and am still following.

## Phase 1: Foundations

**CompTIA Security+** was my first serious certification target. I used:

- **Professor Messer's free video series** — best free resource bar none
- **Jason Dion's Udemy practice exams** — 1000+ questions, brutal but necessary

<Callout type="tip">
Don't just memorize. Understand WHY each control exists. The SY0-701 exam tests application, not recall.
</Callout>

After passing Security+, I added the ISC2 CC — free certification, solid for resume padding.

## Phase 2: Hands-On Labs

Certifications without hands-on skills don't get you hired.

**TryHackMe SOC Level 1 Path** — structured SOC training covering Splunk, Wireshark, SIEM analysis, and threat hunting.

**Home Lab with Wazuh** — built a full AD environment and configured Wazuh as my SIEM. This single project taught me more than 50 hours of theory.

## Certifications Roadmap

| Cert | Status | Why |
|---|---|---|
| Security+ | Earned | Foundation, employer requirement |
| ISC2 CC | Earned | Free, global recognition |
| Google Cybersecurity | Earned | Practical Python + SIEM skills |
| TryHackMe SOC L1 | In Progress | Structured SOC skills |
| CompTIA CySA+ | Planned | Analyst-level credential |
| OSCP | Goal | Pentest credibility |

## What Actually Gets You Hired

1. **Home lab documentation** — show you've done the things, not just studied them
2. **Certifications** — Security+ is the minimum bar for most SOC roles
3. **GitHub activity** — detection rules, scripts, writeups
4. **LinkedIn presence** — recruiters actively hunt there

The biggest mistake I see: studying forever without building anything. Ship the lab. Document it. Post it publicly.`,
  },
];

function tursoQuery(stmts) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ requests: stmts });
    const req = https.request(
      { hostname: HOST, path: "/v2/pipeline", method: "POST", headers: { Authorization: "Bearer " + TOKEN, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => resolve(JSON.parse(d)));
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

const stmts = posts.map((p) => ({
  type: "execute",
  stmt: {
    sql: "INSERT OR IGNORE INTO Post (id, title, slug, excerpt, content, category, tags, published, featured, readTime, views, notifySubscribers, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)",
    args: [
      { type: "text", value: p.id },
      { type: "text", value: p.title },
      { type: "text", value: p.slug },
      { type: "text", value: p.excerpt },
      { type: "text", value: p.content },
      { type: "text", value: p.category },
      { type: "text", value: p.tags },
      { type: "integer", value: p.published },
      { type: "integer", value: p.featured },
      { type: "integer", value: p.readTime },
      { type: "text", value: now },
      { type: "text", value: now },
    ],
  },
}));

const result = await tursoQuery(stmts);
const ok = result.results?.filter((x) => x.type === "ok").length;
const errors = result.results?.filter((x) => x.type === "error");
console.log("Posts inserted:", ok, "/", posts.length);
if (errors?.length) console.log("Errors:", JSON.stringify(errors, null, 2));
