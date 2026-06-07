"use client";

const ALERTS = [
  "[INFO] Wazuh agent heartbeat · DC-01 · homecorp.local · OK",
  "[WARN] Failed SSH auth attempt · 192.168.56.102 · Rule 5710 · Level 5",
  "[INFO] Nmap scan completed · WEB01 · 23 open ports detected · Logged",
  "[ALERT] Hydra brute-force detected · admin@192.168.56.101 · BLOCKED",
  "[INFO] SPL query executed · index=security · 4,892 events returned",
  "[INFO] ISC2 CC · PASSED · 2024 · Credential active",
  "[INFO] CompTIA Security+ SY0-701 · Exam prep · Target: June/July 2026",
  "[WARN] Gobuster scan detected · /api/admin · 403 returned · Alert fired",
  "[INFO] Wireshark PCAP capture · eth0 · 12,441 packets · Saved",
  "[INFO] System status · LEARNING · BUILDING · AVAILABLE FOR SOC ROLES",
  "[INFO] GPO applied · homecorp.local · Password policy · min 12 chars",
  "[ALERT] Nikto scan from KALI01 · WEB01 · Wazuh alert · Severity: High",
];

const doubled = [...ALERTS, ...ALERTS];

export default function AlertTicker() {
  return (
    <div className="alert-feed">
      <div className="inline-flex ticker-content gap-0">
        {doubled.map((alert, i) => {
          const type = alert.startsWith("[ALERT]") ? "alert"
            : alert.startsWith("[WARN]") ? "warn"
            : "info";
          return (
            <span key={i} className="inline-flex items-center mr-10 text-[10px]" style={{ fontFamily: "var(--font-jetbrains), monospace" }}>
              <span className={
                type === "alert" ? "text-[var(--red)]"
                : type === "warn" ? "text-yellow-400"
                : "text-[var(--gold-muted)]"
              }>
                {alert.split("]")[0]}]
              </span>
              <span className="text-[#444] ml-1">{alert.slice(alert.indexOf("]") + 1)}</span>
              <span className="text-[#222] mx-6">·</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
