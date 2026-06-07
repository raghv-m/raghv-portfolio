"use client";

const ALERTS = [
  "[INFO] 10.0.0.1 → 10.0.0.24 | SSH AUTH | Port 22 | ALLOW",
  "[WARN] Suspicious login attempt detected from 192.168.1.105 | Threshold: 3/min",
  "[INFO] DNS query: api.threatintel.io | Resolved | 200ms",
  "[ALERT] Outbound traffic spike detected | 10.0.0.18 | 2.4MB/s",
  "[INFO] SIEM rule triggered: Multiple failed auth | Severity: LOW",
  "[INFO] Firewall rule updated | Policy: BLOCK_UNTRUSTED | Applied",
  "[WARN] Port scan detected | Source: 203.0.113.42 | Ports: 80,443,22,3389",
  "[INFO] SSL cert valid | raghv.dev | Expires: 2026-12-01",
  "[INFO] Log ingestion rate: 4,200 events/min | Status: NOMINAL",
  "[ALERT] Brute-force pattern | User: admin | Source: 10.0.5.200 | BLOCKED",
  "[INFO] Wazuh agent heartbeat | Host: kali-lab | OK",
  "[INFO] TryHackMe room completed | Advent of Cyber 2024 | Score: 980/1000",
  "[WARN] Unencrypted HTTP detected on internal segment | Remediation advised",
  "[INFO] System status: LEARNING | BUILDING | AVAILABLE FOR SOC ROLES",
];

const doubled = [...ALERTS, ...ALERTS];

export default function AlertFeed() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[rgba(0,212,255,0.15)] bg-[rgba(2,8,23,0.9)] backdrop-blur-sm py-1 overflow-hidden">
      <div className="ticker-wrap">
        <div className="ticker-content gap-12 text-[10px] font-mono text-[#475569]">
          {doubled.map((alert, i) => (
            <span key={i} className="inline-flex items-center gap-2 mr-12">
              <span
                className={
                  alert.startsWith("[ALERT]")
                    ? "text-[#ff3366]"
                    : alert.startsWith("[WARN]")
                    ? "text-[#ffd700]"
                    : "text-[#00d4ff]"
                }
              >
                {alert.split(" ")[0]}
              </span>
              <span className="text-[#475569]">{alert.slice(alert.indexOf(" ") + 1)}</span>
              <span className="text-[#1e293b] mx-4">|</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
