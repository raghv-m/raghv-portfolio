/**
 * Invoice PDF (pdfkit, built-in Helvetica so no font files to bundle). Pure: data in, bytes out,
 * no database. Relative imports only, so tests/invoice-pdf.test.mts can run it directly.
 */
import PDFDocument from "pdfkit";

import { formatDate, formatMoney } from "./money.ts";

export type InvoicePdfData = {
  invoiceNumber: string;
  issuedAt: string;
  dueDate: string;
  currency: string;
  status: string;
  amountDue: number;
  amountPaid: number;
  notes: string | null;
  client: { name: string; email: string };
  from: {
    businessName: string;
    tagline: string;
    addressLines: readonly string[];
    email: string;
    website: string;
    gstNumber: string | null;
    paymentInstructions: string;
    legalName?: string;
    phone?: string;
  };
  /** Legal lines printed at the foot of the invoice (payment terms, interest, tax status, law). */
  legalLines?: string[];
  lineItems: { description: string; quantity: number; unitAmount: number; amount: number }[];
};

const ACCENT = "#b8860b";
const INK = "#111111";
const MUTED = "#666666";
const RULE = "#dddddd";

export function renderInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      info: { Title: `Invoice ${data.invoiceNumber}`, Author: data.from.businessName },
    });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const left = 50;
    const right = doc.page.width - 50;
    const width = right - left;
    const money = (cents: number) => formatMoney(cents, data.currency);

    // Header: from (left), INVOICE + meta (right)
    doc.font("Helvetica-Bold").fontSize(16).fillColor(INK).text(data.from.businessName, left, 50);
    if (data.from.legalName && data.from.legalName !== data.from.businessName) {
      doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(data.from.legalName);
    }
    doc.font("Helvetica").fontSize(9).fillColor(MUTED).text(data.from.tagline);
    for (const line of data.from.addressLines) doc.text(line);
    if (data.from.phone) doc.text(data.from.phone);
    doc.text(data.from.email).text(data.from.website);
    if (data.from.gstNumber) doc.text(`GST/HST: ${data.from.gstNumber}`);

    doc.font("Helvetica-Bold").fontSize(22).fillColor(ACCENT).text("INVOICE", left, 50, { width, align: "right" });
    doc.font("Helvetica").fontSize(9).fillColor(INK);
    const meta: [string, string][] = [
      ["Invoice #", data.invoiceNumber],
      ["Issued", formatDate(data.issuedAt)],
      ["Due", formatDate(data.dueDate)],
    ];
    let metaY = 82;
    for (const [label, value] of meta) {
      doc.fillColor(MUTED).text(label, right - 200, metaY, { width: 80 });
      doc.fillColor(INK).text(value, right - 120, metaY, { width: 120, align: "right" });
      metaY += 14;
    }
    if (data.status === "paid" || data.status === "cancelled") {
      doc.font("Helvetica-Bold").fontSize(12).fillColor(data.status === "paid" ? "#2e7d32" : "#c62828")
        .text(data.status.toUpperCase(), right - 200, metaY + 4, { width: 200, align: "right" });
    }

    // Bill to
    let y = 170;
    doc.font("Helvetica-Bold").fontSize(9).fillColor(MUTED).text("BILL TO", left, y);
    doc.font("Helvetica").fontSize(11).fillColor(INK).text(data.client.name, left, y + 14);
    doc.fontSize(9).fillColor(MUTED).text(data.client.email);

    // Line items table
    y = 240;
    const cols = { desc: left, qty: left + width * 0.58, unit: left + width * 0.68, amount: left + width * 0.84 };
    const header = (atY: number) => {
      doc.font("Helvetica-Bold").fontSize(9).fillColor(MUTED);
      doc.text("DESCRIPTION", cols.desc, atY);
      doc.text("QTY", cols.qty, atY, { width: width * 0.08, align: "right" });
      doc.text("UNIT", cols.unit, atY, { width: width * 0.15, align: "right" });
      doc.text("AMOUNT", cols.amount, atY, { width: width * 0.16, align: "right" });
      doc.moveTo(left, atY + 14).lineTo(right, atY + 14).strokeColor(RULE).stroke();
    };
    header(y);
    y += 22;
    doc.font("Helvetica").fontSize(10).fillColor(INK);
    for (const item of data.lineItems) {
      const descHeight = doc.heightOfString(item.description, { width: width * 0.55 });
      if (y + descHeight > doc.page.height - 160) {
        doc.addPage();
        y = 50;
        header(y);
        y += 22;
        doc.font("Helvetica").fontSize(10).fillColor(INK);
      }
      doc.text(item.description, cols.desc, y, { width: width * 0.55 });
      doc.text(String(item.quantity), cols.qty, y, { width: width * 0.08, align: "right" });
      doc.text(money(item.unitAmount), cols.unit, y, { width: width * 0.15, align: "right" });
      doc.text(money(item.amount), cols.amount, y, { width: width * 0.16, align: "right" });
      y += Math.max(descHeight, 12) + 8;
    }

    // Totals
    doc.moveTo(left + width * 0.55, y).lineTo(right, y).strokeColor(RULE).stroke();
    y += 10;
    const totalRow = (label: string, cents: number, bold = false) => {
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(bold ? 12 : 10).fillColor(INK);
      doc.text(label, left + width * 0.55, y, { width: width * 0.25 });
      doc.text(money(cents), cols.amount - width * 0.04, y, { width: width * 0.2, align: "right" });
      y += bold ? 20 : 16;
    };
    totalRow("Subtotal", data.amountDue);
    if (data.amountPaid > 0) totalRow("Paid", -data.amountPaid);
    totalRow("Balance due", Math.max(data.amountDue - data.amountPaid, 0), true);

    // Notes + payment instructions
    y += 16;
    if (data.notes) {
      doc.font("Helvetica-Bold").fontSize(9).fillColor(MUTED).text("NOTES", left, y);
      doc.font("Helvetica").fontSize(10).fillColor(INK).text(data.notes, left, y + 13, { width });
      y = doc.y + 14;
    }
    doc.font("Helvetica-Bold").fontSize(9).fillColor(INK).text("HOW TO PAY", left, y);
    doc.font("Helvetica").fontSize(9).fillColor(MUTED).text(data.from.paymentInstructions, left, doc.y + 2, { width });

    if (data.legalLines?.length) {
      // Keep the legal block together at the bottom of the last page.
      const block = data.legalLines.join("\n");
      const height = doc.heightOfString(block, { width }) + data.legalLines.length * 2 + 24;
      if (doc.y + height > doc.page.height - 50) doc.addPage();
      const top = Math.max(doc.y + 20, doc.page.height - 50 - height);
      doc.moveTo(left, top).lineTo(right, top).strokeColor(RULE).stroke();
      doc.font("Helvetica").fontSize(7.5).fillColor(MUTED);
      let legalY = top + 10;
      for (const line of data.legalLines) {
        doc.text(line, left, legalY, { width });
        legalY = doc.y + 2;
      }
    }

    doc.end();
  });
}
