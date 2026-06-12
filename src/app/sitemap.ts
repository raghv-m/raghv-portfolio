import { prisma } from "@/lib/prisma";

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://raghv.dev";

  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });

  const statics = [
    "",
    "/about",
    "/experience",
    "/career",
    "/certifications",
    "/cybersecurity",
    "/homelab",
    "/projects",
    "/blog",
    "/contact",
  ].map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
  }));

  return [
    ...statics,
    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt,
    })),
  ];
}
