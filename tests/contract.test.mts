// Run: npm run test:unit
import assert from "node:assert/strict";
import { test } from "node:test";

import { buildContractBody, DEFAULT_EXCLUSIONS, SCHEDULE_PRESETS, scheduleAmounts, type ContractVariables } from "../src/lib/contracts/template.ts";

const vars: ContractVariables = {
  provider: { name: "Raghav Mahajan", legalName: "Raghav Mahajan (sole proprietor)", address: "Edmonton, Alberta, Canada", email: "me@example.test", website: "raghv.dev" },
  client: { legalName: "Acme Widgets Ltd.", operatingName: "Acme", businessType: "Corporation", address: "1 Main St, Edmonton, AB T5J 0A1, Canada", signerName: "Jane Doe", signerTitle: "Director", email: "jane@acme.test" },
  effectiveDate: "2026-10-09",
  projectTitle: "Business website",
  scope: ["Business website (5 pages)", "Contact form", "SEO setup"],
  clientGoals: "More bookings",
  exclusions: DEFAULT_EXCLUSIONS,
  targetLaunch: "2026-11-30",
  feeCents: 123457,
  currency: "cad",
  schedule: SCHEDULE_PRESETS["40-40-20"],
  paymentMethods: ["Interac e-Transfer"],
  paymentTermsDays: 14,
  lateInterestMonthlyPct: 1.5,
  lateInterestAnnualPct: 19.56,
  gstRegistered: false,
  monthly: { cents: 2500, description: "Managed hosting" },
  revisionRounds: 2,
  warrantyDays: 30,
  jurisdiction: "Alberta",
};

test("payment schedule adds up to the fee exactly", () => {
  const parts = scheduleAmounts(123457, SCHEDULE_PRESETS["40-40-20"]);
  assert.equal(parts.reduce((s, p) => s + p.cents, 0), 123457);
  assert.deepEqual(parts.map((p) => p.pct), [40, 40, 20]);
});

test("contract names both parties, the fee, schedule and payment method", () => {
  const body = buildContractBody(vars);
  for (const expected of [
    "Acme Widgets Ltd., operating as Acme",
    "Jane Doe, Director",
    "Raghav Mahajan (sole proprietor)",
    "$1,234.57 CAD",
    "Deposit, on signing: 40%",
    "Interac e-Transfer",
    "Business website (5 pages)",
    "$25.00 CAD per month",
    "Province of Alberta",
    "Electronic Transactions Act (Alberta)",
    "19.56% per year",
    "small supplier not registered for GST/HST",
  ]) {
    assert.ok(body.includes(expected), `missing: ${expected}`);
  }
});

test("all 20 sections are present, in order", () => {
  const headings = buildContractBody(vars).split("\n").filter((l) => l.startsWith("## "));
  assert.equal(headings.length, 20);
  assert.ok(headings[0].startsWith("## 1. "));
  assert.ok(headings[19].startsWith("## 20. "));
});

test("GST registration changes the tax clause", () => {
  const body = buildContractBody({ ...vars, gstRegistered: true, gstNumber: "123456789RT0001" });
  assert.ok(body.includes("123456789RT0001"));
  assert.ok(!body.includes("small supplier"));
});

test("no monthly clause when there are no ongoing services", () => {
  assert.ok(!buildContractBody({ ...vars, monthly: null }).includes("billed monthly in advance"));
});

test("signed contract renders to a multi-page PDF with a signature page", async () => {
  const { renderContractPdf } = await import("../src/lib/contracts/pdf.ts");
  const pdf = await renderContractPdf({
    number: "CON-2026-0001",
    body: buildContractBody(vars),
    bodySha256: "a".repeat(64),
    provider: { name: "Raghav Mahajan (sole proprietor)", signatureName: "Raghav Mahajan", signedAt: "2026-10-09T18:00:00Z" },
    client: { name: "Acme Widgets Ltd.", signatureName: "Jane Doe", title: "Director", signedAt: "2026-10-10T18:00:00Z", ipHash: "f".repeat(64), userAgent: "Mozilla/5.0" },
  });
  assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
  const pages = pdf.toString("latin1").match(/\/Type \/Page\b/g)?.length ?? 0;
  assert.ok(pages >= 4, `expected several pages, got ${pages}`);
});
