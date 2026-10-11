import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import BlogContent from "@/components/blog/BlogContent";
import { ServiceNotice } from "@/components/layout/ServiceNotice";

export const revalidate = 60;

export default async function BlogPage() {
  const loaded = !isDatabaseConfigured ? { ok: true as const, posts: [] } : await prisma.post.findMany({
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
  }).then(
    (posts) => ({ ok: true as const, posts }),
    (error: unknown) => {
      console.error("[blog] posts failed to load", error);
      return { ok: false as const, posts: [] };
    },
  );
  const posts = loaded.posts;

  if (!loaded.ok) {
    return (
      <div className="min-h-screen pt-28 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="font-display text-4xl font-bold text-[var(--text)] mb-8">Blog</h1>
          <ServiceNotice what="The blog" />
        </div>
      </div>
    );
  }

  const serialized = posts.map((p) => ({
    ...p,
    tags: (() => { try { return JSON.parse(p.tags ?? "[]"); } catch { return []; } })(),
    createdAt: p.createdAt.toISOString(),
    featured: p.featured === true || (p.featured as unknown as number) === 1,
  }));

  return <BlogContent posts={serialized} />;
}
