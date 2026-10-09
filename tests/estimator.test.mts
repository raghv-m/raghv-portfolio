// Run: npm run test:unit
import assert from "node:assert/strict";
import { test } from "node:test";

import { priceEstimate, type PricingItem } from "../src/lib/estimator/engine.ts";

const item = (over: Partial<PricingItem> & Pick<PricingItem, "section" | "slug">): PricingItem => ({
  label: over.slug,
  description: "",
  icon: null,
  price_cents: 0,
  monthly_cents: 0,
  included_pages: 0,
  per_page_cents: 0,
  sort_order: 0,
  ...over,
});

const catalog: PricingItem[] = [
  item({ section: "category", slug: "business-website", price_cents: 250000, included_pages: 5, per_page_cents: 20000 }),
  item({ section: "feature", slug: "blog-cms", price_cents: 60000 }),
  item({ section: "integration", slug: "stripe", price_cents: 70000 }),
  item({ section: "hosting", slug: "managed-basic", monthly_cents: 2500 }),
  item({ section: "addon", slug: "domain-setup", price_cents: 10000 }),
  item({ section: "addon", slug: "rush" }),
];

const base = { category: "business-website", pages: 5, features: [], integrations: [], hosting: null, addons: [] };

test("base category covers its included pages", () => {
  const result = priceEstimate(catalog, base)!;
  assert.equal(result.oneTimeCents, 250000);
  assert.equal(result.lines.length, 1);
  assert.equal(result.monthlyCents, 0);
});

test("extra pages are charged per page", () => {
  const result = priceEstimate(catalog, { ...base, pages: 8 })!;
  assert.equal(result.oneTimeCents, 250000 + 3 * 20000);
});

test("features, integrations, hosting and add-ons add up; hosting is monthly", () => {
  const result = priceEstimate(catalog, {
    ...base,
    features: ["blog-cms"],
    integrations: ["stripe"],
    hosting: "managed-basic",
    addons: ["domain-setup"],
  })!;
  assert.equal(result.oneTimeCents, 250000 + 60000 + 70000 + 10000);
  assert.equal(result.monthlyCents, 2500);
});

test("rush adds 25% of everything before it", () => {
  const result = priceEstimate(catalog, { ...base, features: ["blog-cms"], addons: ["rush"] })!;
  assert.equal(result.oneTimeCents, Math.round((250000 + 60000) * 1.25));
});

test("range is -10% / +20% rounded to $50", () => {
  const result = priceEstimate(catalog, base)!;
  assert.equal(result.oneTimeLowCents, 225000);
  assert.equal(result.oneTimeHighCents, 300000);
});

test("unknown slugs, wrong sections and duplicates are ignored", () => {
  const result = priceEstimate(catalog, {
    ...base,
    features: ["blog-cms", "blog-cms", "stripe", "made-up"],
    integrations: ["business-website"],
  })!;
  assert.equal(result.oneTimeCents, 250000 + 60000);
});

test("unknown category or a non-category returns null", () => {
  assert.equal(priceEstimate(catalog, { ...base, category: "nope" }), null);
  assert.equal(priceEstimate(catalog, { ...base, category: "stripe" }), null);
});

test("page count is clamped", () => {
  assert.equal(priceEstimate(catalog, { ...base, pages: -4 })!.oneTimeCents, 250000);
  assert.equal(priceEstimate(catalog, { ...base, pages: 10_000 })!.oneTimeCents, 250000 + 195 * 20000);
});

test("my price is the market range times the ratio, rounded to $50", () => {
  const half = priceEstimate(catalog, base, 0.5)!;
  assert.equal(half.myLowCents, 115000); // 2250 * 0.5 = 1125, rounds up to 1150 (nearest $50)
  assert.equal(half.myHighCents, 150000);
  const sixty = priceEstimate(catalog, base, 0.6)!;
  assert.equal(sixty.myLowCents, 135000);
  assert.equal(priceEstimate(catalog, base, 5)!.myHighCents, half.oneTimeHighCents, "ratio capped at 1");
});
