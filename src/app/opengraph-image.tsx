import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

// Default share image for every page that doesn't set its own (LinkedIn, X, Slack, iMessage...).
// Paper card with the case-file logo, so it stands out in dark and light feeds alike.
export const alt = "Raghav Mahajan: web developer and cybersecurity analyst in Edmonton";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  // The shared mark (public/logo.svg) uses currentColor; the image renderer
  // needs a fixed colour, so it is stamped in ink here.
  const logo = await readFile(join(process.cwd(), "public", "logo.svg"), "utf8");
  const logoSrc = `data:image/svg+xml;base64,${Buffer.from(logo.replaceAll("currentColor", "#ffffff")).toString("base64")}`;

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
          background: "#000000",
          borderTop: "10px solid #2C3480",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <img src={logoSrc} width={132} height={132} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>Raghav Mahajan</div>
          <div style={{ marginTop: 18, fontSize: 36, color: "#8B94E0" }}>Websites & web apps · Cybersecurity</div>
          <div style={{ marginTop: 18, fontSize: 26, color: "#555555" }}>Fast, secure builds for small businesses in Edmonton and across Canada</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#6b6b6b", fontFamily: "monospace" }}>
          <span>Instant estimate: raghv.dev/estimate</span>
          <span>Security+ · ISC2 CC</span>
        </div>
      </div>
    ),
    size,
  );
}
