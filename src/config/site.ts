import type { Metadata } from "next";

/** One place for the facts search engines and social cards use. */
export const site = {
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://raghv.dev").replace(/\/$/, ""),
  name: "raghv.dev",
  person: "Raghav Mahajan",
  title: "Raghav Mahajan: Web Developer & Cybersecurity Analyst in Edmonton",
  description:
    "Raghav Mahajan builds fast, secure websites and web apps for businesses in Edmonton and across Canada, and works in cybersecurity (SOC, blue team, homelab). Get an instant project estimate.",
  city: "Edmonton",
  region: "AB",
  country: "CA",
  email: "raaghvv0508@gmail.com",
  /** Public business phone (in structured data for local search). The street address is NOT public. */
  phone: "+1-825-343-1168",
  sameAs: ["https://github.com/HomeLab-Raghav", "https://linkedin.com/in/raghav-mahajan-17611b24b"],
  keywords: [
    "web developer Edmonton",
    "freelance web developer Alberta",
    "website design Edmonton",
    "small business website Canada",
    "Next.js developer",
    "secure web development",
    "cybersecurity analyst Edmonton",
    "SOC analyst",
    "blue team",
    "Raghav Mahajan",
  ],
} as const;

/**
 * Title, description, canonical URL and social cards for a page. The root layout supplies the
 * " | raghv.dev" title suffix and the default share image (app/opengraph-image.tsx).
 */
export function pageMetadata(path: string, title: string, description: string, extra: Metadata = {}): Metadata {
  const url = `${site.url}${path === "/" ? "" : path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: site.name, type: "website", locale: "en_CA" },
    twitter: { card: "summary_large_image", title, description },
    ...extra,
  };
}
