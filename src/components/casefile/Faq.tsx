"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE_OUT } from "@/components/casefile/motion";

/*
 * U2(c) (upscale pass): the homepage FAQ. A square accordion on the same
 * height-animation pattern as the experience page. Every answer is built
 * only from the site's real terms (see raghv-portfolio-business-logic.md):
 * 45% of market on the build, 40-40-20 payments, no GST (small supplier),
 * invoices net 14, two revision rounds, 30-day warranty, hosting prices.
 */

const FAQS: { q: string; a: string }[] = [
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

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div
      style={{
        border: "2.5px solid var(--cf-ink)",
        background: "var(--cf-paper-2)",
        boxShadow: "8px 8px 0 var(--cf-shadow)",
      }}
    >
      {FAQS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} style={i > 0 ? { borderTop: "2px solid var(--cf-faint)" } : undefined}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 text-left px-5 sm:px-6 py-4"
              style={{ minHeight: 44, cursor: "pointer", background: "transparent", border: 0 }}
            >
              <span
                className="cf-display"
                style={{ fontSize: 17, letterSpacing: "0.02em", color: isOpen ? "var(--cf-red)" : "var(--cf-ink)" }}
              >
                {item.q}
              </span>
              <span className="cf-mono" aria-hidden="true" style={{ color: "var(--cf-red)", fontSize: 20, lineHeight: 1 }}>
                {isOpen ? "−" : "+"}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                  className="overflow-hidden"
                >
                  <p
                    className="px-5 sm:px-6 pb-5"
                    style={{ fontSize: 15.5, lineHeight: 1.65, color: "var(--cf-ink-soft)", maxWidth: "68ch" }}
                  >
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
