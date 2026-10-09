import type { Metadata } from "next";

import { EstimateWizard } from "@/components/estimate/EstimateWizard";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata, site } from "@/config/site";
import { getActiveCatalog } from "@/lib/estimator/catalog";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = pageMetadata(
  "/estimate",
  "Website cost estimate: instant price for your project",
  "How much does a website cost in Edmonton and Canada? Pick your project type, pages, features and hosting to see the typical market price and my price, instantly.",
);

// Prices change in the admin console; refresh the page's copy every few minutes.
export const revalidate = 300;

export default async function EstimatePage() {
  const catalog = isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY ? await getActiveCatalog() : [];

  return (
    <div className="min-h-screen pt-28 pb-24">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Website and web app development",
          serviceType: "Web development",
          provider: { "@id": `${site.url}/#business` },
          areaServed: "Canada",
          url: `${site.url}/estimate`,
          offers: { "@type": "AggregateOffer", priceCurrency: "CAD", lowPrice: "400", availability: "https://schema.org/InStock" },
        }}
      />
      <div className="max-w-6xl mx-auto px-6">
        <header className="max-w-2xl">
          <p className="font-mono text-[10px] tracking-[0.25em] text-[var(--gold)]">INSTANT ESTIMATE</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold text-[var(--text)] leading-tight">
            What will your project <span className="gradient-gold">cost?</span>
          </h1>
          <p className="mt-4 text-[var(--text-muted)] leading-relaxed">
            Six quick steps. See the typical market price next to mine as you go, then get a copy by email with access to your own client portal. Free, no obligation.
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
