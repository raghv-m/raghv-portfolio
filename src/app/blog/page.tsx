"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, Tag, Clock, ArrowRight } from "lucide-react";

// When posts exist in the DB, this page will hydrate from /api/posts
// For now: placeholder with category filter UI and empty state

const CATEGORIES = ["All", "Blue Team", "Home Lab", "Certifications", "Tools", "Career"];

const PLACEHOLDER_POSTS = [
  {
    id: "1",
    title: "Building Custom Wazuh Detection Rules for SSH Brute Force",
    slug: "wazuh-ssh-brute-force-rules",
    category: "Home Lab",
    readTime: "8 min",
    date: "Coming soon",
    excerpt: "A walkthrough of authoring custom Wazuh OSSEC rules to detect and automatically block SSH brute force attacks using active response.",
    tags: ["Wazuh", "SIEM", "Blue Team", "SSH"],
    draft: true,
  },
  {
    id: "2",
    title: "CompTIA Security+ SY0-701 Study Strategy",
    slug: "security-plus-study-strategy",
    category: "Certifications",
    readTime: "6 min",
    date: "Coming soon",
    excerpt: "How I'm approaching the Security+ exam — resource stack, study schedule, and which domains to prioritize for a SOC analyst track.",
    tags: ["Security+", "CompTIA", "Study Guide"],
    draft: true,
  },
  {
    id: "3",
    title: "From Kitchen to SOC: The Non-Traditional Path",
    slug: "kitchen-to-soc-path",
    category: "Career",
    readTime: "10 min",
    date: "Coming soon",
    excerpt: "A first-person account of how operational discipline from restaurant management and security guard work translates directly into a SOC analyst mindset.",
    tags: ["Career Change", "SOC", "Blue Team"],
    draft: true,
  },
  {
    id: "4",
    title: "Active Directory Attack & Defend in the Home Lab",
    slug: "ad-attack-defend-homelab",
    category: "Home Lab",
    readTime: "12 min",
    date: "Coming soon",
    excerpt: "Running Kerberoasting, Pass-the-Hash, and LLMNR poisoning attacks against DC-01, then building detection rules in Wazuh to catch them.",
    tags: ["Active Directory", "Red Team", "Blue Team", "Wazuh"],
    draft: true,
  },
];

export default function BlogPage() {
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All"
    ? PLACEHOLDER_POSTS
    : PLACEHOLDER_POSTS.filter((p) => p.category === filter);

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
          {CATEGORIES.map((cat) => (
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

        {/* Coming soon banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-gold rounded-xl p-5 mb-10 flex items-center gap-4"
        >
          <FileText className="w-5 h-5 text-[var(--gold)] shrink-0" />
          <div>
            <p className="font-display text-sm font-semibold text-[var(--text)] mb-0.5">Posts launching soon</p>
            <p className="font-mono text-[10px] text-[var(--text-muted)]">
              Writing is in progress. The drafts below show what&apos;s coming. Sign up for updates via the contact form.
            </p>
          </div>
        </motion.div>

        {/* Post cards */}
        <div className="space-y-4">
          {filtered.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="glass rounded-xl p-6 card-lift group relative overflow-hidden opacity-80"
            >
              {/* Draft watermark */}
              <div className="absolute top-3 right-4 font-mono text-[8px] text-[#333] tracking-widest">DRAFT</div>

              <div className="flex items-center gap-3 mb-3">
                <span className="tag tag-gold">{post.category}</span>
                <div className="flex items-center gap-1 text-[var(--text-muted)]">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono text-[9px]">{post.readTime} read</span>
                </div>
                <span className="font-mono text-[9px] text-[#333] ml-auto">{post.date}</span>
              </div>

              <h2 className="font-display text-base font-bold text-[var(--text)] mb-2 group-hover:text-[var(--gold)] transition-colors">
                {post.title}
              </h2>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-4">{post.excerpt}</p>

              <div className="flex items-center gap-2">
                <Tag className="w-3 h-3 text-[var(--text-muted)]" />
                <div className="flex flex-wrap gap-1">
                  {post.tags.map((t) => <span key={t} className="tag">{t}</span>)}
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-[var(--text-muted)] text-sm mb-4">
            Get notified when new posts drop — no newsletter, just a message.
          </p>
          <Link href="/contact" className="btn-gold">
            Stay in the loop <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
