/**
 * Live detection ticker: the mono strip directly under the home hero.
 *
 * Every line is a fact already published on this site, most of them from
 * the LAB-001 investigation itself (the capture printed as Exhibit B on
 * this page and written up at /investigations/lab-001-ssh-brute-force):
 * rules 5710 (level 5) and 5712 (level 10), the flagged source IP and
 * sshd decoder from the capture, and the investigation's own result
 * line. The lab lines come from /cybersecurity: 50+ documented attack
 * simulations, detections mapped to MITRE ATT&CK, and the four-node
 * Wazuh lab from the hero's boot readout. Nothing is invented and no
 * outcome is claimed past what those pages state (detected, logged,
 * alerted — never "blocked": no source on the site claims a block).
 *
 * Motion is pure CSS (see the rv-ticker block in globals.css): a
 * duplicated track loops translateX, pauses on hover, and stops dead
 * under prefers-reduced-motion, where the strip reads as a static line.
 * Server-rendered with no client JS of its own, so it is fully present
 * with JavaScript disabled.
 */
const ITEMS = [
  "LAB-001 · SSH BRUTE FORCE DETECTED",
  "WAZUH RULE 5712 · LEVEL 10 · SSH BRUTE FORCE ATTACK DETECTED",
  "WAZUH RULE 5710 · LEVEL 5 · LOGIN ATTEMPT, NON-EXISTENT USER 'ADMIN'",
  "SRC IP 192.168.56.102 · FLAGGED · DECODER: SSHD",
  "DETECTION WORKED AS CONFIGURED · LEVEL 5 LOGGED, LEVEL 10 ALERTED",
  "FULL WRITE-UP PUBLISHED · INVESTIGATIONS / LAB-001",
  "50+ DOCUMENTED ATTACK SIMULATIONS · EVERY RUN WRITTEN UP",
  "DETECTIONS MAPPED TO MITRE ATT&CK",
  "4-NODE WAZUH SOC LAB · ONLINE",
];

function Chunk({ hidden }: { hidden?: boolean }) {
  return (
    <div className="rv-ticker-chunk" aria-hidden={hidden || undefined}>
      {ITEMS.map((item) => (
        <span key={item} className="rv-ticker-item">
          {item}
          <span className="rv-ticker-sep" aria-hidden="true">
            {"//"}
          </span>
        </span>
      ))}
    </div>
  );
}

export function DetectionTicker() {
  return (
    <div className="rv-ticker" aria-label="Latest lab detection highlights">
      <span className="sr-only">{ITEMS.join(". ")}</span>
      <div className="rv-ticker-live" aria-hidden="true">
        <span className="rv-ticker-dot" />
        LIVE
      </div>
      <div className="rv-ticker-viewport" aria-hidden="true">
        <div className="rv-ticker-track">
          <Chunk />
          <Chunk hidden />
        </div>
      </div>
    </div>
  );
}
