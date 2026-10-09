/**
 * Project estimate maths. Pure (no database, no framework) so the same code prices the live
 * preview in the browser and the authoritative copy the server saves, and so it's unit-tested
 * (tests/estimator.test.mts). The server always re-prices from its own catalogue; a price sent
 * by the browser is never trusted.
 */

export type Section = "category" | "feature" | "integration" | "hosting" | "addon";

export type PricingItem = {
  section: Section;
  slug: string;
  label: string;
  description: string;
  icon: string | null;
  price_cents: number;
  monthly_cents: number;
  included_pages: number;
  per_page_cents: number;
  sort_order: number;
};

export type EstimateSelection = {
  category: string;
  pages: number;
  features: string[];
  integrations: string[];
  hosting: string | null;
  addons: string[];
};

export type EstimateLine = { label: string; detail?: string; oneTimeCents: number; monthlyCents: number };

export type EstimateResult = {
  lines: EstimateLine[];
  /** Market estimate (what an agency/team would typically quote). */
  oneTimeCents: number;
  /** A range, because it's an estimate: -10% / +20%, rounded to $50. */
  oneTimeLowCents: number;
  oneTimeHighCents: number;
  monthlyCents: number;
  /** Raghav's own price: the market range times the configured ratio, rounded to $50. */
  myLowCents: number;
  myHighCents: number;
};

/** Slug of the add-on that scales the build instead of adding a flat amount. */
export const RUSH_SLUG = "rush";
export const RUSH_MULTIPLIER = 0.25;
export const MAX_PAGES = 200;

const roundTo = (cents: number, step: number) => Math.round(cents / step) * step;

export function priceEstimate(catalog: PricingItem[], selection: EstimateSelection, myPriceRatio = 0.5): EstimateResult | null {
  const bySlug = new Map(catalog.map((item) => [item.slug, item]));
  const category = bySlug.get(selection.category);
  if (!category || category.section !== "category") return null;

  const pages = Math.min(Math.max(Math.trunc(selection.pages) || 1, 1), MAX_PAGES);
  const lines: EstimateLine[] = [
    {
      label: category.label,
      detail: category.included_pages > 0 ? `includes ${category.included_pages} page${category.included_pages === 1 ? "" : "s"}` : undefined,
      oneTimeCents: category.price_cents,
      monthlyCents: category.monthly_cents,
    },
  ];

  const extraPages = Math.max(pages - category.included_pages, 0);
  if (extraPages > 0 && category.per_page_cents > 0) {
    lines.push({
      label: `${extraPages} extra page${extraPages === 1 ? "" : "s"}`,
      detail: `${pages} pages total`,
      oneTimeCents: extraPages * category.per_page_cents,
      monthlyCents: 0,
    });
  }

  // Each chosen item counted once, and only from its own section (no slipping a category in as a feature).
  const pick = (slugs: string[], section: Section) =>
    [...new Set(slugs)].map((slug) => bySlug.get(slug)).filter((item): item is PricingItem => item?.section === section);

  for (const item of [...pick(selection.features, "feature"), ...pick(selection.integrations, "integration")]) {
    lines.push({ label: item.label, oneTimeCents: item.price_cents, monthlyCents: item.monthly_cents });
  }

  const hosting = selection.hosting ? pick([selection.hosting], "hosting")[0] : undefined;
  if (hosting) lines.push({ label: hosting.label, oneTimeCents: hosting.price_cents, monthlyCents: hosting.monthly_cents });

  const addons = pick(selection.addons, "addon");
  for (const item of addons.filter((a) => a.slug !== RUSH_SLUG)) {
    lines.push({ label: item.label, oneTimeCents: item.price_cents, monthlyCents: item.monthly_cents });
  }
  const rush = addons.find((a) => a.slug === RUSH_SLUG);
  if (rush) {
    const buildSoFar = lines.reduce((sum, line) => sum + line.oneTimeCents, 0);
    lines.push({ label: rush.label, detail: `+${RUSH_MULTIPLIER * 100}%`, oneTimeCents: Math.round(buildSoFar * RUSH_MULTIPLIER), monthlyCents: 0 });
  }

  const oneTimeCents = lines.reduce((sum, line) => sum + line.oneTimeCents, 0);
  const monthlyCents = lines.reduce((sum, line) => sum + line.monthlyCents, 0);
  const oneTimeLowCents = roundTo(oneTimeCents * 0.9, 5000);
  const oneTimeHighCents = roundTo(oneTimeCents * 1.2, 5000);
  const ratio = Math.min(Math.max(myPriceRatio, 0), 1);
  return {
    lines,
    oneTimeCents,
    oneTimeLowCents,
    oneTimeHighCents,
    monthlyCents,
    myLowCents: roundTo(oneTimeLowCents * ratio, 5000),
    myHighCents: roundTo(oneTimeHighCents * ratio, 5000),
  };
}

/** "$1,250" (whole dollars; estimates don't need cents). */
export function formatDollars(cents: number): string {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 }).format(cents / 100);
}
