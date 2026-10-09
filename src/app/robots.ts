import type { MetadataRoute } from "next";

import { site } from "@/config/site";

/** Crawl everything public; keep private areas and API endpoints out of search. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/auth/", "/portal", "/unsubscribe"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
