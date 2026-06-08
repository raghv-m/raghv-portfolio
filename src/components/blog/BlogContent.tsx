"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Tag, Clock, ArrowRight, Star } from "lucide-react";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  tags: string[];
  readTime: number | null;
  featured: boolean;
  createdAt: string;
};

export default function BlogContent({ posts }: { posts: Post[] }) {
  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category)))];
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? posts : posts.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen pt-24 pb-32">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12">
          <p className="font-mono text-[10px] tracking-[0.35em] text-[var(--gold-muted)] mb-2">BLOG</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            Field <span className="gradient-gold">Notes</span>
          </h1>
          <p className="text-[var(--text-muted)] max-w-xl leading-relaxed">
            Technical writeups from the home lab — detection engineering, cert study notes,
            tool deep dives, and the non-traditional path into cybersecurity.
          </p>
          <div className="glow-line mt-6 max-w-24" />
        </motion.div>

        {/* Category filter */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-10 flex-wrap"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`font-mono text-[10px] px-4 py-2 rounded-lg transition-all ${
                filter === cat
                  ? "bg-[var(--gold)] text-[var(--bg)]"
                  : "glass text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {filtered.length === 0 ? (
          <p className="text-[var(--text-muted)] text-sm">No posts yet in this category.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="glass rounded-xl p-6 card-lift group block relative overflow-hidden"
                >
                  {post.featured && (
                    <div className="absolute top-3 right-4 flex items-center gap-1">
                      <Star className="w-3 h-3 text-[var(--gold)]" fill="currentColor" />
                      <span className="font-mono text-[8px] text-[var(--gold)] tracking-widest">FEATURED</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-3">
                    <span className="tag tag-gold">{post.category}</span>
                    <div className="flex items-center gap-1 text-[var(--text-muted)]">
                      <Clock className="w-3 h-3" />
                      <span className="font-mono text-[9px]">{post.readTime} min read</span>
                    </div>
                    <span className="font-mono text-[9px] text-[#444] ml-auto">
                      {new Date(post.createdAt).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </div>

                  <h2 className="font-display text-base font-bold text-[var(--text)] mb-2 group-hover:text-[var(--gold)] transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-4">{post.excerpt}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3 h-3 text-[var(--text-muted)]" />
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 4).map((t) => <span key={t} className="tag">{t}</span>)}
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-[var(--gold)] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-[var(--text-muted)] text-sm mb-4">
            Get notified when new posts drop.
          </p>
          <Link href="/contact" className="btn-gold">
            Stay in the loop <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
