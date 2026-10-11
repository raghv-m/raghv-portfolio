/**
 * Renders a contract (the markup from template.ts) and its signature record to PDF. Pure, so
 * it's testable without a database.
 *
 * Layout: branded header and footer on every page, a summary card on page 1, the agreement
 * text, then a signature page. Network and device details of the signature are deliberately
 * not printed: they stay in the database record (client_ip_hash, client_user_agent).
 */
import PDFDocument from "pdfkit";

export type ContractPdfData = {
  number: string;
  body: string;
  bodySha256: string;
  provider: { name: string; signatureName: string; signedAt: string };
  client: { name: string; signatureName: string; title?: string | null; signedAt: string; ipHash?: string | null; userAgent?: string | null };
  /** Key terms for the summary card on page 1. Optional so older records still render. */
  summary?: {
    projectTitle: string;
    effectiveDate?: string;
    targetLaunch?: string;
    fee: string;
    schedule: string[];
    monthly?: string | null;
  };
};

const INK = "#1a1a1a";
const BODY = "#2b2b2b";
const MUTED = "#6b6b6b";
const FAINT = "#9a9a9a";
const GOLD = "#9a7410"; // the light-background logo colour
const GOLD_SOFT = "#f7f2e4";
const RULE = "#e6e0d2";
const GREEN = "#1f7a4d";

const PAGE = { top: 104, bottom: 76, side: 64 };

// e.g. "October 12, 2026 at 1:05 p.m. MDT". dateStyle can't be combined with timeZoneName, so two formats.
const stamp = (iso: string) => {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat("en-CA", { dateStyle: "long", timeZone: "America/Edmonton" }).format(d);
  const time = new Intl.DateTimeFormat("en-CA", { hour: "numeric", minute: "2-digit", timeZone: "America/Edmonton", timeZoneName: "short" }).format(d);
  return `${date} at ${time}`;
};

const day = (iso?: string) =>
  iso ? new Intl.DateTimeFormat("en-CA", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`)) : "To be agreed";

/** The RM lockup from public/logo-light.svg, drawn as vectors (no file read at runtime). */
function drawLogo(doc: PDFKit.PDFDocument, x: number, y: number, height: number) {
  const s = height / 120;
  doc.save();
  doc.translate(x, y).scale(s);
  doc.lineJoin("round");
  doc.polygon([60, 10], [103.3, 35], [103.3, 85], [60, 110], [16.7, 85], [16.7, 35]).lineWidth(1.5).strokeColor(GOLD).stroke();
  doc.polygon([60, 18], [96.4, 39], [96.4, 81], [60, 102], [23.6, 81], [23.6, 39]).lineWidth(0.5).strokeOpacity(0.5).stroke();
  doc.strokeOpacity(1);
  doc.save();
  doc.translate(60, 60).scale(0.556).translate(-340, -130);
  doc.lineCap("square").lineWidth(5);
  doc.path("M286 165V95H306A17.5 17.5 0 0 1 306 130H286M306 130L320 165").stroke(GOLD);
  doc.path("M336 165V95L364 136L392 95V165").stroke(GOLD);
  doc.restore();
  doc.circle(60, 110, 2).fill(GOLD);
  doc.font("Helvetica-Bold").fontSize(24).fillColor(INK).text("RAGHV.DEV", 128, 50, { characterSpacing: 3, lineBreak: false });
  doc.restore();
}

/** **bold** spans to pdfkit's continued text runs. */
function richText(doc: PDFKit.PDFDocument, text: string, x: number, width: number, opts: { indent?: number; size?: number; color?: string } = {}) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  doc.fontSize(opts.size ?? 9.8);
  parts.forEach((part, i) => {
    const bold = part.startsWith("**") && part.endsWith("**");
    doc
      .font(bold ? "Helvetica-Bold" : "Helvetica")
      .fillColor(bold ? INK : opts.color ?? BODY)
      .text(bold ? part.slice(2, -2) : part, i === 0 ? x : undefined, undefined, {
        width,
        continued: i < parts.length - 1,
        indent: i === 0 ? opts.indent : undefined,
        lineGap: 3,
      });
  });
}

/** Starts a new page if fewer than `needed` points are left, so headings never sit alone at the bottom. */
function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  if (doc.y + needed > doc.page.height - PAGE.bottom) doc.addPage();
}

function summaryCard(doc: PDFKit.PDFDocument, data: ContractPdfData, left: number, width: number) {
  const s = data.summary!;
  const rows: [string, string][] = [
    ["Developer", data.provider.name],
    ["Client", data.client.name],
    ["Project", s.projectTitle],
    ["Effective date", day(s.effectiveDate)],
    ["Target launch", day(s.targetLaunch)],
    ["Total fee", s.fee + (s.monthly ? `  ·  then ${s.monthly}` : "")],
    ["Payments", s.schedule.join("\n")],
  ];
  const pad = 18;
  const labelW = 104;
  const valueW = width - pad * 2 - labelW;
  doc.font("Helvetica").fontSize(9.5);
  const heights = rows.map(([, v]) => Math.max(doc.heightOfString(v, { width: valueW, lineGap: 2 }), 12) + 9);
  const h = pad * 2 + 16 + heights.reduce((a, b) => a + b, 0);
  const top = doc.y;
  doc.roundedRect(left, top, width, h, 8).fill(GOLD_SOFT);
  doc.rect(left, top, 3, h).fill(GOLD);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(GOLD).text("KEY TERMS", left + pad, top + pad, { characterSpacing: 1.5 });
  let y = top + pad + 18;
  rows.forEach(([label, value], i) => {
    doc.font("Helvetica").fontSize(8.5).fillColor(MUTED).text(label, left + pad, y + 1, { width: labelW });
    doc.font(label === "Total fee" ? "Helvetica-Bold" : "Helvetica").fontSize(9.5).fillColor(INK).text(value, left + pad + labelW, y, { width: valueW, lineGap: 2 });
    y += heights[i];
  });
  doc.y = top + h + 22;
}

function signatureCard(doc: PDFKit.PDFDocument, x: number, y: number, w: number, role: string, party: string, signature: string, signedBy: string, when: string) {
  const h = 168;
  doc.roundedRect(x, y, w, h, 8).lineWidth(0.75).strokeColor(RULE).stroke();
  doc.font("Helvetica-Bold").fontSize(8).fillColor(GOLD).text(role, x + 16, y + 16, { characterSpacing: 1.5, width: w - 32 });
  doc.font("Helvetica-Bold").fontSize(10).fillColor(INK).text(party, x + 16, y + 32, { width: w - 32, height: 26, ellipsis: true });
  // The typed signature, set like a signature on a line.
  doc.font("Times-Italic").fontSize(22).fillColor("#3a2d06").text(signature, x + 16, y + 70, { width: w - 32, lineBreak: false, ellipsis: true });
  doc.moveTo(x + 16, y + 100).lineTo(x + w - 16, y + 100).lineWidth(0.75).strokeColor(INK).stroke();
  doc.font("Helvetica").fontSize(8.5).fillColor(MUTED).text(signedBy, x + 16, y + 108, { width: w - 32 });
  doc.font("Helvetica").fontSize(8.5).fillColor(MUTED).text(when, x + 16, y + 124, { width: w - 32 });
  doc.circle(x + 20, y + 148, 3).fill(GREEN);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(GREEN).text("SIGNED ELECTRONICALLY", x + 28, y + 144.5, { characterSpacing: 1, lineBreak: false });
}

export function renderContractPdf(data: ContractPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: PAGE.top, bottom: PAGE.bottom, left: PAGE.side, right: PAGE.side },
      info: { Title: `Services Agreement ${data.number}`, Author: data.provider.name, Subject: data.summary?.projectTitle ?? "Services Agreement" },
      bufferPages: true,
    });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const left = PAGE.side;
    const width = doc.page.width - PAGE.side * 2;
    const blocks = data.body.split("\n\n");
    const title = blocks[0]?.startsWith("# ") ? blocks.shift()!.slice(2) : "Services Agreement";

    // ── Cover ──
    doc.font("Helvetica-Bold").fontSize(8).fillColor(GOLD).text(`AGREEMENT ${data.number}`, left, PAGE.top, { characterSpacing: 1.5 });
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").fontSize(22).fillColor(INK).text(title, left, undefined, { width, lineGap: 2 });
    if (data.summary?.projectTitle) {
      doc.moveDown(0.25);
      doc.font("Helvetica").fontSize(12).fillColor(MUTED).text(data.summary.projectTitle, { width });
    }
    doc.moveDown(1.2);
    if (data.summary) summaryCard(doc, data, left, width);

    // ── Agreement text ──
    for (const block of blocks) {
      if (block.startsWith("## ")) {
        ensureSpace(doc, 70);
        doc.moveDown(0.5);
        const heading = block.slice(3);
        const m = heading.match(/^(\d+)\.\s+(.*)$/);
        const top = doc.y;
        if (m) {
          doc.font("Helvetica-Bold").fontSize(10.5).fillColor(GOLD).text(m[1].padStart(2, "0"), left, top, { width: 24, lineBreak: false });
          doc.font("Helvetica-Bold").fontSize(11.5).fillColor(INK).text(m[2], left + 26, top - 0.5, { width: width - 26 });
        } else {
          doc.font("Helvetica-Bold").fontSize(11.5).fillColor(INK).text(heading, left, top, { width });
        }
        doc.moveTo(left, doc.y + 3).lineTo(left + width, doc.y + 3).lineWidth(0.5).strokeColor(RULE).stroke();
        doc.y += 9;
      } else if (block.startsWith("- ")) {
        for (const line of block.split("\n")) {
          ensureSpace(doc, 20);
          const y = doc.y;
          doc.rect(left + 4, y + 4.5, 3, 3).fill(GOLD);
          richText(doc, line.replace(/^- /, ""), left + 16, width - 16);
          doc.moveDown(0.25);
        }
        doc.moveDown(0.35);
      } else {
        ensureSpace(doc, 30);
        richText(doc, block, left, width);
        doc.moveDown(0.65);
      }
    }

    // ── Signatures ──
    doc.addPage();
    doc.font("Helvetica-Bold").fontSize(8).fillColor(GOLD).text("EXECUTION", left, PAGE.top, { characterSpacing: 1.5 });
    doc.moveDown(0.4);
    doc.font("Helvetica-Bold").fontSize(20).fillColor(INK).text("Signatures", left, undefined, { width });
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(9.8).fillColor(BODY).text(
      "Both Parties signed this Agreement electronically through the raghv.dev client portal. By signing, each Party agrees to be bound by the Agreement above.",
      { width, lineGap: 3 },
    );
    doc.moveDown(1.4);
    const gap = 16;
    const cardW = (width - gap) / 2;
    const cardY = doc.y;
    signatureCard(doc, left, cardY, cardW, "DEVELOPER", data.provider.name, data.provider.signatureName, `Signed by ${data.provider.signatureName}`, stamp(data.provider.signedAt));
    signatureCard(
      doc, left + cardW + gap, cardY, cardW, "CLIENT", data.client.name, data.client.signatureName,
      `Signed by ${data.client.signatureName}${data.client.title ? `, ${data.client.title}` : ""}`, stamp(data.client.signedAt),
    );
    doc.y = cardY + 168 + 28;

    // Verification: enough to prove the text wasn't changed, nothing personal.
    const vTop = doc.y;
    const vH = 92;
    doc.roundedRect(left, vTop, width, vH, 8).fill("#f6f6f4");
    doc.font("Helvetica-Bold").fontSize(8).fillColor(MUTED).text("VERIFICATION", left + 16, vTop + 14, { characterSpacing: 1.5 });
    doc.font("Helvetica").fontSize(8.5).fillColor(BODY).text("Document fingerprint (SHA-256 of the Agreement text):", left + 16, vTop + 30, { width: width - 32 });
    doc.font("Courier").fontSize(8).fillColor(INK).text(data.bodySha256, left + 16, vTop + 44, { width: width - 32 });
    doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(
      "Any change to the Agreement text produces a different fingerprint. The full signature record is kept by the Developer and is available to either Party on request.",
      left + 16, vTop + 60, { width: width - 32, lineGap: 1.5 },
    );

    // ── Header and footer on every page ──
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      // Writing outside the margins makes pdfkit add a page; lift the margins while decorating.
      const saved = { ...doc.page.margins };
      doc.page.margins = { top: 0, bottom: 0, left: 0, right: 0 };
      const pw = doc.page.width;
      const ph = doc.page.height;

      drawLogo(doc, left - 4, 34, 40);
      doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(`Services Agreement  ·  ${data.number}`, left, 50, { width, align: "right", lineBreak: false });
      doc.moveTo(left, 84).lineTo(pw - PAGE.side, 84).lineWidth(0.75).strokeColor(GOLD).stroke();

      doc.moveTo(left, ph - 50).lineTo(pw - PAGE.side, ph - 50).lineWidth(0.5).strokeColor(RULE).stroke();
      doc.font("Helvetica").fontSize(7.5).fillColor(FAINT);
      doc.text("raghv.dev", left, ph - 40, { width: width / 3, lineBreak: false });
      doc.text(`Page ${i + 1} of ${range.count}`, left + width / 3, ph - 40, { width: width / 3, align: "center", lineBreak: false });
      doc.text("Signed electronically", left + (2 * width) / 3, ph - 40, { width: width / 3, align: "right", lineBreak: false });

      doc.page.margins = saved;
    }
    doc.end();
  });
}
