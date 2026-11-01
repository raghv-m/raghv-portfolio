import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata, site } from "@/config/site";
import type { NewsItem } from "@/lib/supabase/database.types";
import { ServiceNotice } from "@/components/layout/ServiceNotice";
import { PageHead } from "@/components/casefile/PageHead";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = pageMetadata(
  "/news",
  "Daily security news: top 3 stories",
  "The three cybersecurity stories worth your time each day, picked by Raghav Mahajan, with links to the original reporting.",
);

// New digests revalidate this page on arrival; otherwise refresh hourly.
export const revalidate = 3600;

const day = (iso: string) => new Intl.DateTimeFormat("en-CA", { dateStyle: "full", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));

export default async function NewsPage() {
  let digests: { digest_date: string; items: unknown; linkedin_url: string | null }[] = [];
  let unavailable = false;
  if (isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { data, error } = await getSupabaseAdmin()
      .from("news_digests")
      .select("digest_date, items, linkedin_url")
      .order("digest_date", { ascending: false })
      .limit(30)
      .then((r) => r, (error: unknown) => ({ data: null, error }));
    if (error) {
      console.error("[news] digests failed to load", error);
      unavailable = true;
    }
    digests = data ?? [];
  }

  return (
    <div className="cf-wrap pb-24">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Daily security news",
          url: `${site.url}/news`,
          author: { "@id": `${site.url}/#person` },
        }}
      />
      <div className="max-w-3xl mx-auto">
        <PageHead
          kicker="Daily briefing"
          title="Top 3 in security, every day"
          lede={
            <>
              The three stories worth knowing about, with a link to the original reporting. Also posted daily on{" "}
              <a href={site.sameAs[1]} target="_blank" rel="noopener noreferrer" className="cf-ulink">
                my LinkedIn
              </a>
              .
            </>
          }
        />

        <div className="mt-12 space-y-10">
          {unavailable && <ServiceNotice what="The news briefing" />}
          {!unavailable && digests.length === 0 && <p className="cf-body">The first briefing lands soon.</p>}
          {digests.map((d) => (
            <section key={d.digest_date} aria-labelledby={`d-${d.digest_date}`}>
              <div className="cf-sec-head" style={{ marginBottom: "18px" }}>
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h2 id={`d-${d.digest_date}`} className="cf-h2" style={{ fontSize: "22px" }}>
                    {day(d.digest_date)}
                  </h2>
                  {d.linkedin_url && (
                    <a href={d.linkedin_url} target="_blank" rel="noopener noreferrer" className="cf-ulink cf-mono" style={{ fontSize: "11px" }}>
                      Discuss on LinkedIn ↗
                    </a>
                  )}
                </div>
              </div>
              <ol className="mt-4 space-y-5">
                {(d.items as NewsItem[]).map((item, i) => (
                  <li key={item.url} className="grid grid-cols-[2rem_1fr] gap-2">
                    <span className="cf-mono" style={{ fontSize: "19px", fontWeight: 700, color: "var(--cf-red)", lineHeight: 1.3 }}>
                      {i + 1}
                    </span>
                    <div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="font-semibold hover:text-[var(--cf-red)]"
                        style={{ color: "var(--cf-ink)", fontSize: "16.5px" }}
                      >
                        {item.title}
                      </a>
                      {item.summary && (
                        <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--cf-muted)" }}>
                          {item.summary}
                        </p>
                      )}
                      <p className="cf-mono mt-1" style={{ fontSize: "10.5px", color: "var(--cf-muted)", letterSpacing: "0.04em" }}>
                        Source: {item.source}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
