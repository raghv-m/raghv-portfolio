const https = require("https");

const HOST = process.env.TURSO_HOST;
const TOKEN = process.env.TURSO_AUTH_TOKEN;
if (!HOST || !TOKEN) {
  console.error("Error: TURSO_HOST and TURSO_AUTH_TOKEN env vars must be set.");
  console.error("Run: TURSO_HOST=<host> TURSO_AUTH_TOKEN=<token> node scripts/seed.cjs");
  process.exit(1);
}
const now = new Date().toISOString();

const posts = [
  {
    id: "cwazuh001lab1",
    title: "Building My Home SOC Lab: Wazuh SIEM from Scratch",
    slug: "wazuh-siem-home-lab",
    category: "Lab",
    excerpt: "How I built a fully functional SOC environment at home using Wazuh as the SIEM, with custom detection rules, dashboards, and alert pipelines.",
    tags: '["wazuh","siem","homelab","detection","linux"]',
    readTime: 12,
    published: 1,
    featured: 1,
    content: [
      "## Overview",
      "",
      "This lab documents how I deployed Wazuh in my home lab to simulate a real SOC environment. The goal: build detection pipelines I could break and fix myself.",
      "",
      "## Architecture",
      "",
      "My home lab runs on a mini PC with 32GB RAM hosting multiple VMs via VMware Workstation:",
      "",
      "- **DC-01**: Windows Server 2022 — Active Directory domain controller",
      "- **WEB01**: Ubuntu 22.04 — Simulated web server",
      "- **KALI01**: Kali Linux — Attacker machine",
      "- **WAZUH01**: Ubuntu 22.04 — Wazuh Manager + Kibana",
      "",
      "<Callout type=\"info\">",
      "Wazuh is an open-source SIEM combining log analysis, intrusion detection, vulnerability detection, and compliance monitoring in one platform.",
      "</Callout>",
      "",
      "## Wazuh Installation",
      "",
      "```bash",
      "curl -sO https://packages.wazuh.com/4.7/wazuh-install.sh",
      "sudo bash wazuh-install.sh -a",
      "```",
      "",
      "## Deploying Agents",
      "",
      "On Windows endpoints:",
      "",
      "```powershell",
      "Invoke-WebRequest -Uri https://packages.wazuh.com/4.x/windows/wazuh-agent-4.7.0-1.msi -OutFile wazuh-agent.msi",
      "msiexec /i wazuh-agent.msi WAZUH_MANAGER='192.168.1.100'",
      "```",
      "",
      "## Custom Detection Rule: SSH Brute Force",
      "",
      "```xml",
      "<rule id=\"100001\" level=\"10\" frequency=\"5\" timeframe=\"60\">",
      "  <if_matched_sid>5716</if_matched_sid>",
      "  <description>SSH brute force attack detected</description>",
      "  <mitre><id>T1110.001</id></mitre>",
      "</rule>",
      "```",
      "",
      "<Callout type=\"tip\">",
      "Always test rules in a staging environment first. A misconfigured level 15 rule will flood your alert queue and drown real threats.",
      "</Callout>",
      "",
      "## Key Takeaways",
      "",
      "- Wazuh decoder pipeline and writing custom decoders",
      "- Alert tuning to reduce Windows event log noise",
      "- Mapping detections to MITRE ATT&CK",
      "- Building Kibana dashboards for SOC reporting",
      "",
      "## Next Steps",
      "",
      "Currently integrating Suricata as a network IDS and feeding its alerts into Wazuh for correlated host + network detections.",
    ].join("\n"),
  },
  {
    id: "ckerb002lab22",
    title: "Kerberoasting: Attack, Detect, and Defend",
    slug: "kerberoasting-lab-walkthrough",
    category: "Lab",
    excerpt: "Full red-blue exercise: executing Kerberoasting in my AD home lab and building Wazuh detection rules to catch it in real time.",
    tags: '["active-directory","kerberoasting","detection","windows","mitre"]',
    readTime: 10,
    published: 1,
    featured: 0,
    content: [
      "## What is Kerberoasting?",
      "",
      "Kerberoasting is a post-exploitation technique where an attacker with any valid domain account requests Kerberos service tickets and cracks them offline. It targets accounts with Service Principal Names (SPNs).",
      "",
      "<Callout type=\"warning\">",
      "This lab was performed in a fully isolated home environment. Never attempt this on networks you do not own.",
      "</Callout>",
      "",
      "## Lab Environment",
      "",
      "- **Attacker**: Kali Linux + Impacket",
      "- **Victim**: Windows Server 2022 AD with a weak service account",
      "- **Defender**: Wazuh SIEM monitoring DC event logs",
      "",
      "## Setup: Creating a Vulnerable Service Account",
      "",
      "```powershell",
      "New-ADUser -Name 'svc-webapp' -AccountPassword (ConvertTo-SecureString 'Password123!' -AsPlainText -Force) -Enabled $true",
      "setspn -a HTTP/webapp.lab.local svc-webapp",
      "```",
      "",
      "## The Attack",
      "",
      "```bash",
      "python3 GetUserSPNs.py lab.local/user:Pass -dc-ip 192.168.1.10 -request -outputfile hashes.txt",
      "hashcat -m 13100 hashes.txt /usr/share/wordlists/rockyou.txt",
      "```",
      "",
      "## Detection with Wazuh",
      "",
      "Event ID 4769 with RC4 encryption type 0x17 is the giveaway:",
      "",
      "```xml",
      "<rule id=\"100010\" level=\"12\">",
      "  <field name=\"win.system.eventID\">^4769$</field>",
      "  <field name=\"win.eventdata.ticketEncryptionType\">^0x17$</field>",
      "  <description>Kerberoasting: RC4 ticket requested</description>",
      "  <mitre><id>T1558.003</id></mitre>",
      "</rule>",
      "```",
      "",
      "<Callout type=\"info\">",
      "Enforcing AES-256 for all service accounts eliminates crackable hashes entirely. RC4 should be disabled org-wide.",
      "</Callout>",
      "",
      "## Key Takeaways",
      "",
      "- Detection must happen on the DC via Windows event logs",
      "- Kerberoasting is invisible to network-level monitoring",
      "- Fix: disable RC4, use 25+ char service account passwords, audit SPNs",
      "- MITRE ATT&CK: T1558.003",
    ].join("\n"),
  },
  {
    id: "csoc003career3",
    title: "SOC Analyst Study Roadmap: From Zero to Security+",
    slug: "soc-analyst-study-roadmap",
    category: "Career",
    excerpt: "The exact resources, labs, and certifications I used to go from no IT background to Security+ certified and hunting SOC analyst roles.",
    tags: '["career","soc","security-plus","tryhackme","roadmap"]',
    readTime: 8,
    published: 1,
    featured: 1,
    content: [
      "## Background",
      "",
      "I didn't come from a traditional IT background. I worked as a security guard, then pivoted into software development, and now I'm building toward cybersecurity — specifically SOC Tier 1 on the path to penetration testing.",
      "",
      "This is the exact roadmap I followed.",
      "",
      "## Phase 1: Security+",
      "",
      "Resources I used:",
      "",
      "- **Professor Messer's free video series** — best free resource available",
      "- **Jason Dion's Udemy practice exams** — 1000+ questions, brutal but necessary",
      "- **CompTIA CertMaster Practice** — for weak area drilling",
      "",
      "<Callout type=\"tip\">",
      "Don't just memorize. Understand WHY each control exists. SY0-701 tests application, not recall.",
      "</Callout>",
      "",
      "## Phase 2: Hands-On Labs",
      "",
      "Certifications without hands-on skills don't get you hired.",
      "",
      "**TryHackMe SOC Level 1** covers Splunk, Wireshark, SIEM analysis, and threat hunting in a structured path.",
      "",
      "**Home Lab with Wazuh** — I built a full AD environment and configured Wazuh as my SIEM. This single project taught me more than 50 hours of studying theory.",
      "",
      "## Certifications Timeline",
      "",
      "| Cert | Status |",
      "|---|---|",
      "| Security+ SY0-701 | Earned |",
      "| ISC2 CC | Earned |",
      "| Google Cybersecurity | Earned |",
      "| TryHackMe SOC L1 | In Progress |",
      "| CompTIA CySA+ | Planned |",
      "| OSCP | Goal |",
      "",
      "## What Actually Gets You Hired",
      "",
      "1. **Home lab documentation** — show you've done the work, not just studied it",
      "2. **Security+** — minimum bar for most SOC roles",
      "3. **GitHub activity** — detection rules, scripts, writeups",
      "4. **Active LinkedIn** — recruiters hunt there daily",
      "",
      "The biggest mistake I see: studying forever without building anything. Ship the lab. Document it. Post it publicly.",
    ].join("\n"),
  },
];

function insert(post) {
  return new Promise((resolve, reject) => {
    const payload = {
      requests: [{
        type: "execute",
        stmt: {
          sql: "INSERT OR IGNORE INTO Post (id,title,slug,excerpt,content,category,tags,published,featured,readTime,views,notifySubscribers,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,0,0,?,?)",
          args: [
            { type: "text", value: post.id },
            { type: "text", value: post.title },
            { type: "text", value: post.slug },
            { type: "text", value: post.excerpt },
            { type: "text", value: post.content },
            { type: "text", value: post.category },
            { type: "text", value: post.tags },
            { type: "text", value: String(post.published) },
            { type: "text", value: String(post.featured) },
            { type: "text", value: String(post.readTime) },
            { type: "text", value: now },
            { type: "text", value: now },
          ],
        },
      }],
    };
    const body = JSON.stringify(payload);
    const req = https.request(
      { hostname: HOST, path: "/v2/pipeline", method: "POST", headers: { Authorization: "Bearer " + TOKEN, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          try {
            const r = JSON.parse(d);
            if (r.results && r.results[0] && r.results[0].type === "ok") {
              console.log("OK:", post.title);
            } else {
              console.log("ERR:", post.title, JSON.stringify(r).slice(0, 200));
            }
            resolve();
          } catch (e) { console.log("PARSE ERR:", d.slice(0, 200)); resolve(); }
        });
      }
    );
    req.on("error", (e) => { console.error("REQ ERR:", e.message); resolve(); });
    req.write(body);
    req.end();
  });
}

(async () => {
  for (const p of posts) await insert(p);
  console.log("Done.");
})();
