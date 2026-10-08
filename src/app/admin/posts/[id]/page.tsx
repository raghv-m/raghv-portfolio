import { requireAdmin } from "@/lib/session";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostEditor from "@/components/admin/PostEditor";

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  await requireAdmin();

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();

  let tags: string[] = [];
  try { tags = JSON.parse(post.tags); } catch { tags = []; }

  return (
    <PostEditor
      initial={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        tags,
        coverImage: post.coverImage ?? "",
        published: post.published,
        featured: post.featured,
        readTime: post.readTime ?? "",
        notifySubscribers: post.notifySubscribers,
      }}
    />
  );
}
