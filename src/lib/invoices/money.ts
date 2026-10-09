/** Cents → "$1,234.56 CAD". Integer cents everywhere; never floats for money. */
export function formatMoney(cents: number, currency: string): string {
  const amount = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency.toUpperCase(),
    currencyDisplay: "narrowSymbol",
  }).format(cents / 100);
  return `${amount} ${currency.toUpperCase()}`;
}

/** "2026-10-07T00:00:00Z" → "October 7, 2026" (fixed locale and zone so server and PDF agree). */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { dateStyle: "long", timeZone: "America/Edmonton" }).format(new Date(iso));
}

/** Dollars typed in a form ("1,250.5") → integer cents (125050). Null when it isn't a valid amount. */
export function parseDollarsToCents(input: string): number | null {
  const clean = input.replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null;
  const [whole, fraction = ""] = clean.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}
