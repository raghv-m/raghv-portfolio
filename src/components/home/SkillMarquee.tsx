"use client";

const SKILLS = [
  "Wazuh SIEM", "Splunk SPL", "MITRE ATT&CK", "Active Directory",
  "Kali Linux", "Wireshark PCAP", "Python Automation", "Nmap",
  "Incident Response", "Burp Suite", "PowerShell", "ELK Stack",
  "GPO & LDAP", "TCP/IP · DNS", "UFW Firewall", "Threat Detection",
  "Log Analysis", "ISO 27001", "NIST CSF", "Docker", "Git",
];

const doubled = [...SKILLS, ...SKILLS];

export default function SkillMarquee() {
  return (
    <div className="relative overflow-hidden py-4 border-y border-[#1a1a1a]" style={{ mask: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)" }}>
      <div className="marquee-track gap-0">
        {doubled.map((skill, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 mx-5 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap hover:text-[var(--gold)] transition-colors"
          >
            <span
              className="w-1 h-1 rounded-full"
              style={{ background: i % 3 === 0 ? "var(--gold)" : i % 3 === 1 ? "var(--blue)" : "var(--green)" }}
            />
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
