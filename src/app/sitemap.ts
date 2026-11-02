import type { MetadataRoute } from "next";

import { site } from "@/config/site";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

// Rebuilt at most hourly so new blog posts show up without a deploy.
export const revalidate = 3600;

/**
 * Every public, indexable page. Admin, portal, auth and API routes are deliberately absent (and
 * blocked in robots.ts). `updated` is the date that page's content actually last changed
 * (checked against git history — SEO Finding 4); bump it when you edit a page so search
 * engines re-crawl it. priority/changeFrequency are omitted: Google ignores both.
 */
const PAGES: { path: string; updated: string }[] = [
  { path: "", updated: "2026-11-02" },
  { path: "/estimate", updated: "2026-11-02" },
  { path: "/portfolio", updated: "2026-11-02" },
  { path: "/about", updated: "2026-11-02" },
  { path: "/contact", updated: "2026-11-02" },
  { path: "/blog", updated: "2026-11-02" },
  { path: "/newsletter", updated: "2026-11-01" },
  { path: "/news", updated: "2026-11-02" },
  { path: "/cybersecurity", updated: "2026-11-02" },
  { path: "/experience", updated: "2026-11-02" },
  { path: "/roadmap", updated: "2026-11-02" },
  { path: "/certifications", updated: "2026-11-02" },
  { path: "/hobbies", updated: "2026-11-02" },
  { path: "/privacy", updated: "2026-11-01" },
  { path: "/terms", updated: "2026-10-08" },
  { path: "/cookies", updated: "2026-11-02" },
  { path: "/refunds", updated: "2026-10-08" },
  { path: "/accessibility", updated: "2026-10-08" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = !isDatabaseConfigured
    ? []
    : await prisma.post
        .findMany({ where: { published: true }, select: { slug: true, updatedAt: true }, orderBy: { updatedAt: "desc" } })
        .catch(() => []);

  return [
    ...PAGES.map(({ path, updated }) => ({
      url: `${site.url}${path}`,
      lastModified: new Date(updated),
    })),
    ...posts.map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: post.updatedAt,
    })),
  ];
}
