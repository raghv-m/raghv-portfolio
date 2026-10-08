import { NextResponse } from "next/server";

import { site } from "@/config/site";
import { postUrl, publishedPosts } from "@/lib/blog-feed";

export const revalidate = 3600;

/** JSON Feed 1.1 of published posts. The LinkedIn autopost job reads this to queue new posts. */
export async function GET() {
  const posts = await publishedPosts();
  return NextResponse.json(
    {
      version: "https://jsonfeed.org/version/1.1",
      title: `${site.person} · Blog`,
      home_page_url: `${site.url}/blog`,
      feed_url: `${site.url}/blog/feed.json`,
      language: "en-CA",
      authors: [{ name: site.person, url: site.url }],
      items: posts.map((p) => ({
        id: p.id,
        url: postUrl(p.slug),
        title: p.title,
        summary: p.excerpt,
        tags: [p.category, ...p.tags].filter(Boolean),
        date_published: p.createdAt.toISOString(),
        date_modified: p.updatedAt.toISOString(),
      })),
    },
    { headers: { "Cache-Control": "public, max-age=0, s-maxage=3600" } },
  );
}
