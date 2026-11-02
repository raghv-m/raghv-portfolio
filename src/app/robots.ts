import type { MetadataRoute } from "next";

import { site } from "@/config/site";

/** Crawl everything public; keep private areas and API endpoints out of search. */
export default function robots(): MetadataRoute.Robots {
  const disallow = ["/admin", "/api/", "/auth/", "/portal", "/unsubscribe"];
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
      // Audit-fix: the AI crawlers are named explicitly, with exactly the
      // wildcard's access — the site wants to be citable in AI answers, and
      // a named rule leaves no doubt the blanket Allow covers them.
      {
        userAgent: ["GPTBot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot", "Google-Extended"],
        allow: "/",
        disallow,
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
