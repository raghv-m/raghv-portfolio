import { ImageResponse } from "next/og";

// Default share image for every page that doesn't set its own (LinkedIn, X, Slack, iMessage...).
export const alt = "Raghav Mahajan: web developer and cybersecurity analyst in Edmonton";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "radial-gradient(circle at 85% 15%, rgba(212,160,23,0.18), transparent 45%), #0a0a0a",
          color: "#f5f5f5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, border: "2px solid #d4a017", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 16, height: 16, background: "#d4a017", borderRadius: 3, transform: "rotate(45deg)" }} />
          </div>
          <div style={{ fontSize: 28, color: "#d4a017", letterSpacing: 2, fontFamily: "monospace" }}>raghv.dev</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>Raghav Mahajan</div>
          <div style={{ marginTop: 18, fontSize: 36, color: "#d4a017" }}>Websites & web apps · Cybersecurity</div>
          <div style={{ marginTop: 18, fontSize: 26, color: "#9a9a9a" }}>Fast, secure builds for businesses in Edmonton and across Canada</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#777", fontFamily: "monospace" }}>
          <span>Instant estimate: raghv.dev/estimate</span>
          <span>Security+ · ISC2 CC</span>
        </div>
      </div>
    ),
    size,
  );
}
