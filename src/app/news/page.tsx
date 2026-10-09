import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata, site } from "@/config/site";
import type { NewsItem } from "@/lib/supabase/database.types";
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
  const digests =
    isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY
      ? ((await getSupabaseAdmin().from("news_digests").select("digest_date, items, linkedin_url").order("digest_date", { ascending: false }).limit(30)).data ?? [])
      : [];

  return (
    <div className="min-h-screen pt-28 pb-24">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Daily security news",
          url: `${site.url}/news`,
          author: { "@id": `${site.url}/#person` },
        }}
      />
      <div className="max-w-3xl mx-auto px-6">
        <p className="font-mono text-[10px] tracking-[0.25em] text-[var(--gold)]">DAILY BRIEFING</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-[var(--text)]">Top 3 in security, every day</h1>
        <p className="mt-4 text-[var(--text-muted)] leading-relaxed">
          The three stories worth knowing about, with a link to the original reporting. Also posted daily on{" "}
          <a href={site.sameAs[1]} target="_blank" rel="noopener noreferrer" className="text-[var(--gold)] hover:underline">my LinkedIn</a>.
        </p>

        <div className="mt-12 space-y-10">
          {digests.length === 0 && <p className="text-[var(--text-muted)]">The first briefing lands soon.</p>}
          {digests.map((d) => (
            <section key={d.digest_date} aria-labelledby={`d-${d.digest_date}`}>
              <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
                <h2 id={`d-${d.digest_date}`} className="font-mono text-[11px] tracking-wider text-[var(--text-muted)] uppercase">{day(d.digest_date)}</h2>
                {d.linkedin_url && <a href={d.linkedin_url} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] text-[var(--gold)] hover:underline">Discuss on LinkedIn ↗</a>}
              </div>
              <ol className="mt-4 space-y-5">
                {(d.items as NewsItem[]).map((item, i) => (
                  <li key={item.url} className="grid grid-cols-[2rem_1fr] gap-2">
                    <span className="font-display text-xl font-bold text-[var(--gold)]">{i + 1}</span>
                    <div>
                      <a href={item.url} target="_blank" rel="noopener noreferrer nofollow" className="text-[var(--text)] font-semibold hover:text-[var(--gold)]">{item.title}</a>
                      {item.summary && <p className="mt-1 text-sm text-[var(--text-muted)] leading-relaxed">{item.summary}</p>}
                      <p className="mt-1 font-mono text-[10px] text-[var(--text-muted)]">Source: {item.source}</p>
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
