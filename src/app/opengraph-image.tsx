import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

// Default share image for every page that doesn't set its own (LinkedIn, X, Slack, iMessage...).
// The brutalist poster card: paper ground, ink type, one red block rule.
export const alt = "Raghav Mahajan: web developer and cybersecurity analyst in Edmonton";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  // The shared mark (public/logo.svg) uses currentColor; the image renderer
  // needs a fixed colour, so it is stamped in ink here.
  const logo = await readFile(join(process.cwd(), "public", "logo.svg"), "utf8");
  const logoSrc = `data:image/svg+xml;base64,${Buffer.from(logo.replaceAll("currentColor", "#141414")).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          background: "#F4F1EC",
          borderTop: "14px solid #AD0117",
          color: "#141414",
          fontFamily: "sans-serif",
        }}
      >
        <img src={logoSrc} width={132} height={132} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>Raghav Mahajan</div>
          <div style={{ marginTop: 18, fontSize: 36, color: "#AD0117" }}>Websites & web apps · Cybersecurity</div>
          <div style={{ marginTop: 18, fontSize: 26, color: "#5A574E" }}>Fast, secure builds for small businesses in Edmonton and across Canada</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#5A574E", fontFamily: "monospace" }}>
          <span>Instant estimate: raghv.dev/estimate</span>
          <span>Security+ · ISC2 CC</span>
        </div>
      </div>
    ),
    size,
  );
}
