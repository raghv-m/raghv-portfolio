import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Eye } from "lucide-react";
import DeletePostButton from "./DeletePostButton";

export default async function AdminPostsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, slug: true, category: true, published: true, featured: true, views: true, createdAt: true },
  });

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl font-bold text-[var(--text)]">Posts</h1>
          <Link href="/admin/posts/new" className="btn-gold flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Post
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-[var(--text-muted)] mb-4">No posts yet.</p>
            <Link href="/admin/posts/new" className="btn-gold">Write your first post</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map(p => (
              <div key={p.id} className="glass rounded-xl px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="tag">{p.category}</span>
                    {p.published ? <span className="tag tag-gold">Published</span> : <span className="tag">Draft</span>}
                    {p.featured && <span className="tag" style={{ borderColor: "var(--gold)", color: "var(--gold)" }}>Featured</span>}
                  </div>
                  <p className="font-display font-semibold text-[var(--text)] truncate">{p.title}</p>
                  <p className="font-mono text-[10px] text-[var(--text-muted)] mt-0.5">/blog/{p.slug}</p>
                </div>
                <div className="flex items-center gap-1 text-[var(--text-muted)] shrink-0">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="font-mono text-xs">{p.views}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/admin/posts/${p.id}`} className="btn-ghost text-xs px-3 py-1.5">Edit</Link>
                  <DeletePostButton id={p.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
