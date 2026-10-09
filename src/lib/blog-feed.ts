import { site } from "@/config/site";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export type FeedPost = { id: string; slug: string; title: string; excerpt: string; category: string; tags: string[]; createdAt: Date; updatedAt: Date };

/** Published posts, newest first, for the RSS and JSON feeds (and the LinkedIn autopost job). */
export async function publishedPosts(limit = 50): Promise<FeedPost[]> {
  if (!isDatabaseConfigured) return [];
  const posts = await prisma.post
    .findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, slug: true, title: true, excerpt: true, category: true, tags: true, createdAt: true, updatedAt: true },
    })
    .catch(() => []);
  return posts.map((p) => ({
    ...p,
    tags: (() => {
      try {
        return JSON.parse(p.tags ?? "[]") as string[];
      } catch {
        return [];
      }
    })(),
  }));
}

export const postUrl = (slug: string) => `${site.url}/blog/${slug}`;

export const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
