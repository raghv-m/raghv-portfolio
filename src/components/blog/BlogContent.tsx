"use client";
import { useState } from "react";
import Link from "next/link";
import { PageHead } from "@/components/casefile/PageHead";
import { Reveal } from "@/components/casefile/Reveal";
import { Stamp } from "@/components/casefile/Stamp";

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
    <div className="cf-wrap pb-24">
      <div className="max-w-4xl mx-auto">
        <PageHead
          kicker="Blog, field notes"
          title="Field Notes"
          lede="Technical writeups from the home lab: detection engineering, cert study notes, tool deep dives, and the non-traditional path into cybersecurity."
        />

        {/* Category filter */}
        <div className="flex gap-2 mt-10 mb-10 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              aria-pressed={filter === cat}
              className="cf-chip cf-mono"
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="cf-body">No posts yet in this category.</p>
        ) : (
          <Reveal>
            <div style={{ borderTop: "2px solid var(--cf-ink)" }}>
              {filtered.map((post, i) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="cf-arch-row group">
                  <span className="cf-arch-no">{String(i + 1).padStart(2, "0")}</span>
                  <span className="cf-arch-date">
                    {new Date(post.createdAt).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                  <span>
                    <span className="cf-arch-title" style={{ fontSize: "21px", lineHeight: 1.25 }}>
                      {post.title}
                    </span>
                    {post.excerpt && (
                      <span className="block mt-1" style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--cf-muted)", fontWeight: 400 }}>
                        {post.excerpt}
                      </span>
                    )}
                    <span className="cf-mono block mt-2" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                      <span style={{ color: "var(--cf-red)", fontWeight: 700, textTransform: "uppercase" }}>{post.category}</span>
                      {post.tags.slice(0, 4).map((t) => (
                        <span key={t} style={{ color: "var(--cf-muted)" }}>
                          {"  /  "}
                          {t}
                        </span>
                      ))}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-2">
                    <span className="cf-mono" style={{ fontSize: "11px", color: "var(--cf-muted)", whiteSpace: "nowrap" }}>
                      {post.readTime} min read{" "}
                      <span aria-hidden="true" style={{ color: "var(--cf-red)" }}>
                        →
                      </span>
                    </span>
                    {post.featured && (
                      <Stamp tone="gold" r={-6 + (i % 8)} s={0.93 + (i % 3) * 0.05} o={0.84 + (i % 3) * 0.05} bw={2.3 + (i % 3) * 0.5} delay={120 + i * 40}>
                        Featured
                      </Stamp>
                    )}
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>
        )}

        {/* Newsletter CTA */}
        <Reveal className="mt-16">
          <div className="text-center" style={{ borderTop: "2px solid var(--cf-ink)", paddingTop: "32px" }}>
            <p className="cf-body mb-5">Get notified when new posts drop.</p>
            <Link href="/contact" className="cf-btn">
              Stay in the loop
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
