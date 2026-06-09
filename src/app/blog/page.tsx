import { prisma } from "@/lib/prisma";
import BlogContent from "@/components/blog/BlogContent";

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      category: true,
      tags: true,
      readTime: true,
      featured: true,
      createdAt: true,
    },
  });

  const serialized = posts.map((p) => ({
    ...p,
    tags: (() => { try { return JSON.parse(p.tags ?? "[]"); } catch { return []; } })(),
    createdAt: p.createdAt.toISOString(),
    featured: p.featured === true || (p.featured as unknown as number) === 1,
  }));

  return <BlogContent posts={serialized} />;
}
