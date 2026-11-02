"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE_OUT } from "@/components/casefile/motion";
import { FAQS } from "@/components/casefile/faqData";

/*
 * U2(c) (upscale pass): the homepage FAQ. A square accordion on the same
 * height-animation pattern as the experience page. The Q&A data lives in
 * faqData.ts, shared with the FAQPage JSON-LD on the homepage, so the
 * visible answers and the schema are always the same text.
 */

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
