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

/**
 * FAQPage schema built from the exact Q&A array a page renders visibly, so
 * the structured data always describes content a visitor can read (audit-fix
 * pass). Callers pass their own array: the homepage passes faqData's FAQS,
 * /cybersecurity passes its lab Q&A.
 */
export function faqPageSchema(faqs: { q: string; a: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
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
            image: `${site.url}/images/subject-photo.jpg`,
            email: `mailto:${site.email}`,
            jobTitle: "Web Developer & SOC Analyst",
            address: { "@type": "PostalAddress", addressLocality: site.city, addressRegion: site.region, addressCountry: site.country },
            knowsAbout: ["Web development", "Next.js", "React", "Cybersecurity", "Security operations", "Incident response", "SIEM", "Wazuh", "Splunk", "Active Directory", "Linux", "IT support"],
            // Forensic-fix: the earned credentials, names only — no
            // verification URLs are published, so none are claimed here.
            // Dates live on /certifications, the source of truth.
            hasCredential: [
              { "@type": "EducationalOccupationalCredential", name: "CompTIA Security+ (SY0-701)" },
              { "@type": "EducationalOccupationalCredential", name: "ISC2 Certified in Cybersecurity (CC)" },
              { "@type": "EducationalOccupationalCredential", name: "Google Cybersecurity Professional Certificate" },
            ],
            sameAs: site.sameAs,
          },
          {
            "@type": "ProfessionalService",
            "@id": businessId,
            name: `${site.person} · Web Development`,
            url: site.url,
            founder: { "@id": personId },
            email: site.email,
            telephone: site.phone,
            priceRange: "$$",
            areaServed: [{ "@type": "City", name: "Edmonton" }, { "@type": "AdministrativeArea", name: "Alberta" }, { "@type": "Country", name: "Canada" }],
            address: { "@type": "PostalAddress", addressLocality: site.city, addressRegion: site.region, addressCountry: site.country },
            serviceType: ["Website design", "Web application development", "E-commerce", "Website security review"],
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Web development services",
              itemListElement: [
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Website design and build", url: `${site.url}/estimate` } },
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Web application development", url: `${site.url}/estimate` } },
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "E-commerce websites", url: `${site.url}/estimate` } },
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Website security review", url: `${site.url}/cybersecurity` } },
              ],
            },
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
