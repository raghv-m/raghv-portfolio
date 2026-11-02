/*
 * The homepage FAQ's single source of truth. Faq.tsx renders this array as
 * the visible accordion; src/app/page.tsx derives the FAQPage JSON-LD from
 * the same array (audit-fix pass), so the schema can never drift from what
 * a visitor actually reads. Every answer is built only from the site's
 * real terms (see raghv-portfolio-business-logic.md): 45% of market on
 * the build, 40-40-20 payments, no GST (small supplier), invoices net 14,
 * two revision rounds, 30-day warranty, hosting prices.
 */
export const FAQS: { q: string; a: string }[] = [
  {
    q: "What does a website cost?",
    a: "His price is 45% of the typical market quote for the same scope. Run the estimator and you get a real range in about a minute; the exact figure is then fixed in the agreement before any money moves.",
  },
  {
    q: "How do payments work?",
    a: "40-40-20: forty per cent when you sign, forty when the design is approved, twenty at launch. Invoices are net 14. There is no GST on top: he is a small supplier, so it is not charged.",
  },
  {
    q: "How long does a build take?",
    a: "The launch date is agreed and written into the agreement before you sign. The estimator asks when you need it (as soon as possible, within a month, two to three months, or flexible) and the schedule is built from your answer.",
  },
  {
    q: "What do you need from me to start?",
    a: "After the estimate, a short questionnaire sets the goals, the must-haves, and the details for the agreement. That is enough to start; content and logins can follow while the build is under way.",
  },
  {
    q: "How many revisions are included?",
    a: "Two rounds of revisions are in the standard agreement. Every build also carries a 30-day warranty for defects after launch.",
  },
  {
    q: "Who hosts the site afterwards?",
    a: "Your call. Self-hosting costs nothing extra. Managed hosting is $25 a month, or $99 a month with the care plan, and monthly services can be cancelled on 30 days' notice.",
  },
  {
    q: "Why is the price below an agency's?",
    a: "One person scopes, builds, and launches the site: no account managers, no handoffs, no agency overhead. The build price is set at 45% of market, and the quote is fixed at signing.",
  },
];
