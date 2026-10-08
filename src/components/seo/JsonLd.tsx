import { site } from "@/config/site";

/** Renders schema.org JSON-LD. `<` is escaped so content can't close the script tag. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Serialised JSON with < escaped, so it can never close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** Site-wide graph: the person, the business they run, and the website. */
export function SiteJsonLd() {
  const personId = `${site.url}/#person`;
  const businessId = `${site.url}/#business`;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Person",
            "@id": personId,
            name: site.person,
            url: site.url,
            email: `mailto:${site.email}`,
            jobTitle: "Web Developer & Cybersecurity Analyst",
            address: { "@type": "PostalAddress", addressLocality: site.city, addressRegion: site.region, addressCountry: site.country },
            knowsAbout: ["Web development", "Next.js", "React", "Cybersecurity", "Security operations", "Incident response", "SIEM"],
            sameAs: site.sameAs,
          },
          {
            "@type": "ProfessionalService",
            "@id": businessId,
            name: `${site.person} · Web Development`,
            url: site.url,
            founder: { "@id": personId },
            email: site.email,
            priceRange: "$$",
            areaServed: [{ "@type": "City", name: "Edmonton" }, { "@type": "AdministrativeArea", name: "Alberta" }, { "@type": "Country", name: "Canada" }],
            address: { "@type": "PostalAddress", addressLocality: site.city, addressRegion: site.region, addressCountry: site.country },
            serviceType: ["Website design", "Web application development", "E-commerce", "Website security review"],
            potentialAction: { "@type": "QuoteAction", target: `${site.url}/estimate`, name: "Get an instant estimate" },
          },
          {
            "@type": "WebSite",
            "@id": `${site.url}/#website`,
            url: site.url,
            name: site.name,
            publisher: { "@id": personId },
            inLanguage: "en-CA",
          },
        ],
      }}
    />
  );
}
