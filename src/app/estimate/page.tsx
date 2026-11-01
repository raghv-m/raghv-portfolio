import type { Metadata } from "next";

import { EstimateWizard } from "@/components/estimate/EstimateWizard";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata, site } from "@/config/site";
import { ServiceNotice } from "@/components/layout/ServiceNotice";
import { PageHead } from "@/components/casefile/PageHead";
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
  let catalog: Awaited<ReturnType<typeof getActiveCatalog>> = [];
  let unavailable = false;
  if (isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      catalog = await getActiveCatalog();
    } catch (error) {
      console.error("[estimate] price list failed to load", error);
      unavailable = true;
    }
  }

  return (
    <div className="cf-wrap pb-24">
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
      <PageHead
        kicker="Instant estimate"
        title="What will your project cost?"
        lede="Six quick steps. See the typical market price next to mine as you go, then get a copy by email with access to your own client portal. Free, no obligation."
      />
      <div className="mt-10">
        {unavailable ? (
          <ServiceNotice what="The estimator" />
        ) : catalog.length ? (
          <EstimateWizard catalog={catalog} />
        ) : (
          <p className="text-[var(--cf-muted)]">The estimator is being set up. Please use the contact page for now.</p>
        )}
      </div>
    </div>
  );
}
