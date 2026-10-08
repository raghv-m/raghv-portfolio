import { site } from "@/config/site";
import { postUrl, publishedPosts, xmlEscape } from "@/lib/blog-feed";

export const revalidate = 3600;

/** RSS 2.0 feed of published blog posts. Every value is XML-escaped. */
export async function GET() {
  const posts = await publishedPosts();
  const items = posts
    .map(
      (p) => `    <item>
      <title>${xmlEscape(p.title)}</title>
      <link>${postUrl(p.slug)}</link>
      <guid isPermaLink="true">${postUrl(p.slug)}</guid>
      <pubDate>${p.createdAt.toUTCString()}</pubDate>
      <description>${xmlEscape(p.excerpt)}</description>
      <category>${xmlEscape(p.category)}</category>
    </item>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(`${site.person} · Blog`)}</title>
    <link>${site.url}/blog</link>
    <atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Web development and cybersecurity writeups by ${xmlEscape(site.person)}.</description>
    <language>en-ca</language>
${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" } });
}
