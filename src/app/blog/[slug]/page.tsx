import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Callout } from "@/components/blog/Callout";
import Link from "next/link";
import { ArrowLeft, Clock, Tag, Calendar } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug, published: true } });
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug, published: true } });
  if (!post) notFound();

  // Increment views (fire and forget)
  prisma.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } }).catch(() => {});

  let tags: string[] = [];
  try { tags = JSON.parse(post.tags); } catch { tags = []; }

  // Extract TOC from content
  const headings: { id: string; text: string; level: number }[] = [];
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  let m;
  while ((m = headingRegex.exec(post.content)) !== null) {
    const level = m[1].length;
    const text = m[2];
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    headings.push({ id, text, level });
  }

  const components = {
    Callout,
    h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h1 className="font-display text-3xl font-bold mt-10 mb-4 text-[var(--text)]" {...props} />
    ),
    h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
      const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return <h2 id={id} className="font-display text-2xl font-bold mt-10 mb-4 text-[var(--text)] scroll-mt-20" {...props}>{children}</h2>;
    },
    h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
      const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return <h3 id={id} className="font-display text-xl font-semibold mt-8 mb-3 text-[var(--text)] scroll-mt-20" {...props}>{children}</h3>;
    },
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className="mb-4 text-[var(--text-muted)] leading-[1.8]" {...props} />
    ),
    a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a className="text-[var(--gold)] hover:text-[var(--gold-light)] underline underline-offset-2 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
    ),
    ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
      <ul className="mb-4 pl-5 space-y-1.5 list-none" {...props} />
    ),
    ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
      <ol className="mb-4 pl-5 space-y-1.5 list-decimal list-inside" {...props} />
    ),
    li: (props: React.HTMLAttributes<HTMLLIElement>) => (
      <li className="text-[var(--text-muted)] leading-relaxed flex gap-2 items-start before:content-['▸'] before:text-[var(--gold)] before:mt-0.5 before:shrink-0" {...props} />
    ),
    blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
      <blockquote className="my-6 border-l-2 border-[var(--gold)] pl-5 italic text-[var(--text-muted)]" {...props} />
    ),
    code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) => {
      if (className?.includes("language-")) {
        return (
          <div className="my-5 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between px-4 py-2 bg-[var(--card)] border-b border-[var(--border)]">
              <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider">
                {className.replace("language-", "")}
              </span>
            </div>
            <code
              className={`${className} block overflow-x-auto bg-[var(--surface)] p-5 font-mono text-sm leading-relaxed`}
              {...props}
            >
              {children}
            </code>
          </div>
        );
      }
      return (
        <code className="font-mono text-[var(--gold)] bg-[rgba(212,160,23,0.08)] px-1.5 py-0.5 rounded text-[0.85em]" {...props}>
          {children}
        </code>
      );
    },
    pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
      <pre className="m-0 p-0 bg-transparent overflow-x-auto" {...props} />
    ),
    hr: () => <div className="my-8 border-t border-[var(--border)]" />,
    table: (props: React.HTMLAttributes<HTMLTableElement>) => (
      <div className="my-6 overflow-x-auto rounded-lg border border-[var(--border)]">
        <table className="w-full text-sm" {...props} />
      </div>
    ),
    th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
      <th className="px-4 py-2.5 text-left font-display text-xs font-semibold text-[var(--gold)] bg-[var(--card)] border-b border-[var(--border)]" {...props} />
    ),
    td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
      <td className="px-4 py-2.5 text-[var(--text-muted)] border-b border-[var(--border)] last-of-type:border-0" {...props} />
    ),
    img: ({ src, alt }: { src?: string; alt?: string }) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt || ""} className="my-6 rounded-xl w-full" style={{ border: "1px solid var(--border)" }} />
    ),
  };

  return (
    <div className="min-h-screen pt-24 pb-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors font-mono text-[10px] mb-8">
          <ArrowLeft className="w-3 h-3" /> Back to Blog
        </Link>

        <div className="lg:grid lg:grid-cols-4 lg:gap-10">
          {/* Sticky TOC sidebar — desktop */}
          {headings.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <p className="font-mono text-[9px] tracking-wider text-[var(--text-muted)] mb-3">ON THIS PAGE</p>
                <nav className="space-y-1">
                  {headings.map((h) => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      className="block font-mono text-[10px] text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors py-0.5 leading-snug"
                      style={{ paddingLeft: h.level === 3 ? "12px" : "0" }}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          {/* Article */}
          <article className={headings.length > 0 ? "lg:col-span-3" : "lg:col-span-4"}>
            {/* Cover image */}
            {post.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.coverImage} alt={post.title} className="w-full rounded-2xl mb-8 aspect-video object-cover" style={{ border: "1px solid var(--border)" }} />
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="tag tag-gold">{post.category}</span>
              {post.readTime && (
                <div className="flex items-center gap-1 text-[var(--text-muted)]">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono text-[10px]">{post.readTime} min read</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-[var(--text-muted)]">
                <Calendar className="w-3 h-3" />
                <span className="font-mono text-[10px]">{new Date(post.createdAt).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--text)] mb-4 leading-tight">{post.title}</h1>
            <p className="text-[var(--text-muted)] text-base leading-relaxed mb-8 border-b border-[var(--border)] pb-8">{post.excerpt}</p>

            {/* Mobile TOC */}
            {headings.length > 0 && (
              <details className="lg:hidden mb-8 glass rounded-xl p-4">
                <summary className="font-mono text-[10px] tracking-wider text-[var(--text-muted)] cursor-pointer">TABLE OF CONTENTS</summary>
                <nav className="mt-3 space-y-1.5">
                  {headings.map((h) => (
                    <a key={h.id} href={`#${h.id}`} className="block font-mono text-[10px] text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors" style={{ paddingLeft: h.level === 3 ? "12px" : "0" }}>{h.text}</a>
                  ))}
                </nav>
              </details>
            )}

            {/* MDX Content */}
            <div className="prose-content max-w-[72ch]">
              <MDXRemote source={post.content} components={components} />
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-12 pt-6 border-t border-[var(--border)] flex items-center gap-2 flex-wrap">
                <Tag className="w-3 h-3 text-[var(--text-muted)]" />
                {tags.map((t) => <span key={t} className="tag">{t}</span>)}
              </div>
            )}

            {/* Nav to next/prev posts */}
            <div className="mt-12 pt-6 border-t border-[var(--border)]">
              <Link href="/blog" className="btn-ghost">← All Posts</Link>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
