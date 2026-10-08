import type { Metadata } from "next";

import { EstimateWizard } from "@/components/estimate/EstimateWizard";
import { getActiveCatalog } from "@/lib/estimator/catalog";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Project estimate",
  description: "Get an instant price range for your website or web app: pick a project type, pages, features and hosting.",
};

// Prices change in the admin console; refresh the page's copy every few minutes.
export const revalidate = 300;

export default async function EstimatePage() {
  const catalog = isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY ? await getActiveCatalog() : [];

  return (
    <div className="min-h-screen pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        <header className="max-w-2xl">
          <p className="font-mono text-[10px] tracking-[0.25em] text-[var(--gold)]">INSTANT ESTIMATE</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold text-[var(--text)] leading-tight">
            What will your project <span className="gradient-gold">cost?</span>
          </h1>
          <p className="mt-4 text-[var(--text-muted)] leading-relaxed">
            Six quick steps. You&apos;ll see a price range update as you go, and get a copy by email. No account, no
            obligation.
          </p>
        </header>
        <div className="mt-12">
          {catalog.length ? (
            <EstimateWizard catalog={catalog} />
          ) : (
            <p className="text-[var(--text-muted)]">The estimator is being set up. Please use the contact page for now.</p>
          )}
        </div>
      </div>
    </div>
  );
}
