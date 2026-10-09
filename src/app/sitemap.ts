import type { MetadataRoute } from "next";

import { site } from "@/config/site";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

// Rebuilt at most hourly so new blog posts show up without a deploy.
export const revalidate = 3600;

/**
 * Every public, indexable page. Admin, portal, auth and API routes are deliberately absent (and
 * blocked in robots.ts). lastModified for static pages is the date their content last changed;
 * bump it when you edit a page so search engines re-crawl it.
 */
const PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; updated: string }[] = [
  { path: "", priority: 1.0, changeFrequency: "weekly", updated: "2026-10-08" },
  { path: "/estimate", priority: 0.9, changeFrequency: "monthly", updated: "2026-10-08" },
  { path: "/projects", priority: 0.8, changeFrequency: "monthly", updated: "2026-10-09" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly", updated: "2026-10-08" },
  { path: "/contact", priority: 0.7, changeFrequency: "yearly", updated: "2026-10-08" },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly", updated: "2026-10-08" },
  { path: "/news", priority: 0.6, changeFrequency: "daily", updated: "2026-10-09" },
  { path: "/cybersecurity", priority: 0.6, changeFrequency: "monthly", updated: "2026-10-08" },
  { path: "/homelab", priority: 0.6, changeFrequency: "monthly", updated: "2026-10-08" },
  { path: "/experience", priority: 0.6, changeFrequency: "monthly", updated: "2026-10-08" },
  { path: "/certifications", priority: 0.5, changeFrequency: "monthly", updated: "2026-10-08" },
  { path: "/career", priority: 0.5, changeFrequency: "monthly", updated: "2026-10-08" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly", updated: "2026-10-08" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly", updated: "2026-10-08" },
  { path: "/cookies", priority: 0.1, changeFrequency: "yearly", updated: "2026-10-08" },
  { path: "/refunds", priority: 0.1, changeFrequency: "yearly", updated: "2026-10-08" },
  { path: "/accessibility", priority: 0.1, changeFrequency: "yearly", updated: "2026-10-08" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = !isDatabaseConfigured
    ? []
    : await prisma.post
        .findMany({ where: { published: true }, select: { slug: true, updatedAt: true }, orderBy: { updatedAt: "desc" } })
        .catch(() => []);

  return [
    ...PAGES.map(({ path, priority, changeFrequency, updated }) => ({
      url: `${site.url}${path}`,
      lastModified: new Date(updated),
      changeFrequency,
      priority,
    })),
    ...posts.map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
