// Run: npm run test:unit
import assert from "node:assert/strict";
import { test } from "node:test";

import { formatMoney, parseDollarsToCents } from "../src/lib/invoices/money.ts";
import { renderInvoicePdf, type InvoicePdfData } from "../src/lib/invoices/pdf.ts";

const base: InvoicePdfData = {
  invoiceNumber: "INV-2026-0001",
  issuedAt: "2026-10-07T18:00:00Z",
  dueDate: "2026-10-21T06:59:59Z",
  currency: "cad",
  status: "sent",
  amountDue: 102500,
  amountPaid: 0,
  notes: "Thanks for the work together.",
  client: { name: "Acme Ltd", email: "billing@acme.test" },
  from: {
    businessName: "Raghav Mahajan",
    tagline: "Software & Security",
    addressLines: ["Edmonton, Alberta", "Canada"],
    email: "me@example.test",
    website: "raghv.dev",
    gstNumber: null,
    paymentInstructions: "Pay by e-Transfer.",
  },
  lineItems: [
    { description: "Website build", quantity: 2, unitAmount: 50000, amount: 100000 },
    { description: "Hosting (1 month)", quantity: 1, unitAmount: 2500, amount: 2500 },
  ],
};

test("dollars typed in a form become integer cents", () => {
  assert.equal(parseDollarsToCents("1,250.5"), 125050);
  assert.equal(parseDollarsToCents("$40"), 4000);
  assert.equal(parseDollarsToCents("0.07"), 7);
  assert.equal(parseDollarsToCents("12.345"), null);
  assert.equal(parseDollarsToCents("-5"), null);
  assert.equal(parseDollarsToCents("abc"), null);
});

test("money is formatted with currency code", () => {
  assert.equal(formatMoney(102500, "cad"), "$1,025.00 CAD");
});

test("renders a valid PDF", async () => {
  const pdf = await renderInvoicePdf(base);
  assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
  assert.ok(pdf.length > 1500);
  assert.ok(pdf.subarray(-6).toString().includes("%%EOF"));
});

test("long invoices flow onto extra pages", async () => {
  const many = Array.from({ length: 60 }, (_, i) => ({
    description: `Task ${i + 1}: a longer description that wraps onto a second line in the table`,
    quantity: 1,
    unitAmount: 1000,
    amount: 1000,
  }));
  const pdf = await renderInvoicePdf({ ...base, lineItems: many, amountDue: 60000 });
  const pages = pdf.toString("latin1").match(/\/Type \/Page\b/g)?.length ?? 0;
  assert.ok(pages >= 2, `expected multiple pages, got ${pages}`);
});
