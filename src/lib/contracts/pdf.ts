/**
 * Renders a contract (the markup from template.ts) and its signature record to PDF. Pure, so
 * it's testable without a database.
 */
import PDFDocument from "pdfkit";

export type ContractPdfData = {
  number: string;
  body: string;
  bodySha256: string;
  provider: { name: string; signatureName: string; signedAt: string };
  client: { name: string; signatureName: string; title?: string | null; signedAt: string; ipHash?: string | null; userAgent?: string | null };
};

const INK = "#111111";
const MUTED = "#666666";
const ACCENT = "#b8860b";

const stamp = (iso: string) =>
  `${new Intl.DateTimeFormat("en-CA", { dateStyle: "long", timeStyle: "long", timeZone: "America/Edmonton" }).format(new Date(iso))}`;

/** **bold** spans to pdfkit's continued text runs. */
function richText(doc: PDFKit.PDFDocument, text: string, x: number, width: number, opts: { indent?: number } = {}) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  parts.forEach((part, i) => {
    const bold = part.startsWith("**") && part.endsWith("**");
    doc.font(bold ? "Helvetica-Bold" : "Helvetica").text(bold ? part.slice(2, -2) : part, i === 0 ? x : undefined, undefined, {
      width,
      continued: i < parts.length - 1,
      indent: i === 0 ? opts.indent : undefined,
      lineGap: 2,
    });
  });
}

export function renderContractPdf(data: ContractPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "LETTER", margins: { top: 60, bottom: 60, left: 64, right: 64 }, info: { Title: `${data.number} Services Agreement` }, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const left = doc.page.margins.left;
    const width = doc.page.width - left - doc.page.margins.right;

    doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(`Agreement ${data.number}`, left, 36, { width, align: "right" });
    doc.y = 60;

    for (const block of data.body.split("\n\n")) {
      if (block.startsWith("# ")) {
        doc.font("Helvetica-Bold").fontSize(18).fillColor(INK).text(block.slice(2), left, undefined, { width, align: "center" });
        doc.moveDown(1);
      } else if (block.startsWith("## ")) {
        if (doc.y > doc.page.height - 140) doc.addPage();
        doc.moveDown(0.6);
        doc.font("Helvetica-Bold").fontSize(11).fillColor(ACCENT).text(block.slice(3), left, undefined, { width });
        doc.moveDown(0.3);
      } else if (block.startsWith("- ")) {
        doc.fontSize(9.5).fillColor(INK);
        for (const line of block.split("\n")) {
          richText(doc, `•  ${line.replace(/^- /, "")}`, left + 12, width - 12);
          doc.moveDown(0.15);
        }
        doc.moveDown(0.4);
      } else {
        doc.fontSize(9.5).fillColor(INK);
        richText(doc, block, left, width);
        doc.moveDown(0.6);
      }
    }

    // Signature page
    doc.addPage();
    doc.font("Helvetica-Bold").fontSize(14).fillColor(INK).text("Signatures", left, 60, { width });
    doc.font("Helvetica").fontSize(9).fillColor(MUTED).text("Signed electronically through the raghv.dev client portal. By signing, each Party agrees to be bound by the Agreement above.", { width });
    doc.moveDown(1.5);

    const signatureBlock = (heading: string, lines: [string, string][]) => {
      doc.font("Helvetica-Bold").fontSize(10).fillColor(ACCENT).text(heading, left, undefined, { width });
      doc.moveDown(0.3);
      for (const [label, value] of lines) {
        doc.font("Helvetica").fontSize(9).fillColor(MUTED).text(`${label}: `, left, undefined, { continued: true, width });
        doc.fillColor(INK).text(value);
      }
      doc.moveDown(1.2);
    };
    signatureBlock("DEVELOPER", [
      ["Party", data.provider.name],
      ["Signed by", data.provider.signatureName],
      ["Signed", stamp(data.provider.signedAt)],
    ]);
    signatureBlock("CLIENT", [
      ["Party", data.client.name],
      ["Signed by", `${data.client.signatureName}${data.client.title ? `, ${data.client.title}` : ""}`],
      ["Signed", stamp(data.client.signedAt)],
      ...(data.client.ipHash ? ([["Network fingerprint", data.client.ipHash.slice(0, 16)]] as [string, string][]) : []),
      ...(data.client.userAgent ? ([["Device", data.client.userAgent.slice(0, 110)]] as [string, string][]) : []),
    ]);
    doc.font("Helvetica-Bold").fontSize(9).fillColor(INK).text("Document fingerprint (SHA-256 of the Agreement text)", left, undefined, { width });
    doc.font("Courier").fontSize(8).fillColor(MUTED).text(data.bodySha256, { width });
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(8).fillColor(MUTED).text("Any change to the Agreement text would produce a different fingerprint.", { width });

    // Page numbers
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(`Page ${i + 1} of ${range.count}`, left, doc.page.height - 40, { width, align: "center", lineBreak: false });
    }
    doc.end();
  });
}
