"use client";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import {
  Save, Eye, Code2, Bold, Code, Minus, AlertTriangle, Lightbulb,
  Info, XCircle, Hash, List, X, ExternalLink, Image as ImageIcon,
} from "lucide-react";

interface PostData {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  coverImage: string;
  published: boolean;
  featured: boolean;
  readTime: number | "";
  notifySubscribers: boolean;
}

interface Props { initial?: Partial<PostData> }

const CATEGORIES = ["Writeup", "Lab", "Tutorial", "Research", "Opinion", "Career"];

export default function PostEditor({ initial }: Props) {
  const router = useRouter();
  const [data, setData] = useState<PostData>({
    id: initial?.id,
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    category: initial?.category ?? "Lab",
    tags: initial?.tags ?? [],
    coverImage: initial?.coverImage ?? "",
    published: initial?.published ?? false,
    featured: initial?.featured ?? false,
    readTime: initial?.readTime ?? "",
    notifySubscribers: initial?.notifySubscribers ?? false,
  });
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [savedId, setSavedId] = useState(initial?.id);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Rendered MDX preview
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const previewTimer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (!preview) return;
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(async () => {
      setPreviewLoading(true);
      setPreviewError("");
      try {
        const res = await fetch("/api/admin/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: data.content }),
        });
        const json = await res.json();
        if (json.mdxSource) setMdxSource(json.mdxSource);
        else setPreviewError(json.error ?? "Preview failed");
      } catch {
        setPreviewError("Preview unavailable");
      } finally {
        setPreviewLoading(false);
      }
    }, 600);
    return () => { if (previewTimer.current) clearTimeout(previewTimer.current); };
  }, [data.content, preview]);

  const set = useCallback(<K extends keyof PostData>(k: K, v: PostData[K]) =>
    setData(prev => ({ ...prev, [k]: v })), []);

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const insert = useCallback((before: string, after = "", placeholder = "text") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = ta.value.slice(start, end) || placeholder;
    const newVal = ta.value.slice(0, start) + before + sel + after + ta.value.slice(end);
    set("content", newVal as PostData["content"]);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + sel.length);
    }, 0);
  }, [set]);

  const insertCodeBlock = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const sel = ta.value.slice(ta.selectionStart, ta.selectionEnd) || "# your code here";
    const block = `\n\`\`\`bash\n${sel}\n\`\`\`\n`;
    set("content", (ta.value.slice(0, ta.selectionStart) + block + ta.value.slice(ta.selectionEnd)) as PostData["content"]);
  }, [set]);

  const TOOLBAR = useMemo(() => [
    { icon: Bold,          label: "Bold",            action: () => insert("**", "**") },
    { icon: Code,          label: "Inline code",     action: () => insert("`", "`") },
    { icon: Code2,         label: "Code block",      action: insertCodeBlock },
    { icon: Hash,          label: "Heading",         action: () => insert("\n## ", "", "Heading") },
    { icon: List,          label: "List item",       action: () => insert("\n- ", "", "Item") },
    { icon: Minus,         label: "Divider",         action: () => set("content", (data.content + "\n\n---\n\n") as PostData["content"]) },
    { icon: ImageIcon,     label: "Image",           action: () => insert("\n![", "](https://...)\n", "alt text") },
    { icon: Info,          label: "Callout info",    action: () => insert('\n<Callout type="info">\n', "\n</Callout>\n", "Note here") },
    { icon: AlertTriangle, label: "Callout warning", action: () => insert('\n<Callout type="warning">\n', "\n</Callout>\n", "Warning text") },
    { icon: XCircle,       label: "Callout danger",  action: () => insert('\n<Callout type="danger">\n', "\n</Callout>\n", "Danger text") },
    { icon: Lightbulb,     label: "Callout tip",     action: () => insert('\n<Callout type="tip">\n', "\n</Callout>\n", "Tip text") },
  ], [insert, insertCodeBlock, set, data.content]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !data.tags.includes(t)) set("tags", [...data.tags, t]);
    setTagInput("");
  };

  const save = async (andPublish?: boolean) => {
    setError("");
    setSaving(true);
    try {
      const body = {
        ...data,
        published: andPublish ?? data.published,
        readTime: data.readTime === "" ? null : Number(data.readTime),
        coverImage: data.coverImage || null,
      };
      const id = savedId ?? data.id;
      const url = id ? `/api/admin/posts/${id}` : "/api/admin/posts";
      const method = id ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) { setError(json.error?.message ?? JSON.stringify(json.error) ?? "Save failed"); return; }
      if (!id) {
        setSavedId(json.id);
        router.push(`/admin/posts/${json.id}`);
      } else if (andPublish !== undefined) {
        set("published", andPublish);
      }
    } finally {
      setSaving(false);
    }
  };

  const wordCount = data.content.trim().split(/\s+/).filter(Boolean).length;
  const estimatedRead = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="min-h-screen pt-16 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">

        {/* Topbar */}
        <div className="flex items-center justify-between mb-4 pt-4">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-lg font-bold text-[var(--text)]">
              {data.id ? "Edit Post" : "New Post"}
            </h1>
            {data.published
              ? <span className="tag tag-gold">Published</span>
              : <span className="tag">Draft</span>}
          </div>

          <div className="flex items-center gap-2">
            {/* Preview toggle */}
            <button
              onClick={() => setPreview(p => !p)}
              className={`btn-ghost flex items-center gap-1.5 text-xs ${preview ? "text-[var(--gold)]" : ""}`}
            >
              <Eye className="w-3.5 h-3.5" />
              {preview ? "Editor" : "Preview"}
            </button>

            {/* View live */}
            {(savedId ?? data.id) && data.published && (
              <a
                href={`/blog/${data.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost flex items-center gap-1.5 text-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View Live
              </a>
            )}

            {/* Save draft */}
            <button
              onClick={() => save()}
              disabled={saving}
              className="btn-ghost flex items-center gap-1.5 text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving…" : "Save Draft"}
            </button>

            {/* Publish / Unpublish */}
            {data.published ? (
              <button onClick={() => save(false)} disabled={saving} className="btn-ghost text-xs text-red-400 hover:text-red-300">
                Unpublish
              </button>
            ) : (
              <button onClick={() => save(true)} disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs">
                Publish
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-3 px-4 py-2.5 rounded-xl text-xs text-[var(--red)] bg-[rgba(255,68,68,0.06)]" style={{ border: "1px solid rgba(255,68,68,0.2)" }}>
            {error}
          </div>
        )}

        {/* Title */}
        <input
          className="w-full font-display text-3xl font-bold text-[var(--text)] bg-transparent border-0 border-b border-[var(--border)] pb-3 mb-5 outline-none placeholder:text-[var(--border)] focus:border-[var(--gold)] transition-colors"
          placeholder="Post title…"
          value={data.title}
          onChange={e => {
            set("title", e.target.value);
            if (!data.id && !savedId) set("slug", autoSlug(e.target.value));
          }}
        />

        <div className="xl:grid xl:grid-cols-[1fr_300px] xl:gap-5">

          {/* ── Editor / Preview ── */}
          <div>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-0.5 mb-2 p-2 glass rounded-xl">
              {/* eslint-disable-next-line react-hooks/refs -- action() only runs from the button's onClick; the ref read in insert()/insertCodeBlock() never happens during render, the compiler just can't trace it through the TOOLBAR data array */}
              {TOOLBAR.map(({ icon: Icon, label, action }) => (
                <button
                  key={label}
                  title={label}
                  onClick={action}
                  className="p-1.5 rounded hover:bg-[rgba(212,160,23,0.08)] text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
              <span className="ml-auto font-mono text-[9px] text-[#333] self-center pr-1">
                {wordCount} words · ~{estimatedRead} min read
              </span>
            </div>

            {preview ? (
              <div className="glass rounded-xl p-6 min-h-[640px]" style={{ border: "1px solid var(--border)" }}>
                <div className="font-mono text-[9px] text-[var(--text-muted)] mb-5 tracking-[0.2em]">RENDERED PREVIEW</div>
                {previewLoading && (
                  <div className="font-mono text-xs text-[var(--text-muted)] animate-pulse">Rendering…</div>
                )}
                {previewError && (
                  <div className="font-mono text-xs text-[var(--red)]">{previewError}</div>
                )}
                {mdxSource && !previewLoading && (
                  <div className="prose-content max-w-[72ch]">
                    <MDXRemote {...mdxSource} />
                  </div>
                )}
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                className="w-full glass rounded-xl p-4 font-mono text-sm text-[var(--text-muted)] resize-none outline-none focus:border-[var(--gold)] min-h-[640px] leading-relaxed"
                style={{ border: "1px solid var(--border)", background: "var(--surface)", tabSize: 2 }}
                placeholder={`Write your post in MDX…\n\nTips:\n- Use ## for headings\n- \`\`\`bash for code blocks\n- <Callout type="info"> for callouts\n- Tab key inserts 2 spaces`}
                value={data.content}
                onChange={e => set("content", e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Tab") { e.preventDefault(); insert("  ", "", ""); }
                }}
              />
            )}
          </div>

          {/* ── Metadata sidebar ── */}
          <aside className="space-y-4 mt-5 xl:mt-0">

            {/* Status */}
            <div className="glass rounded-xl p-4 space-y-2.5">
              <p className="font-mono text-[9px] text-[var(--text-muted)] tracking-[0.2em]">STATUS</p>
              {(["published", "featured", "notifySubscribers"] as const).map(key => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-[var(--text)] capitalize">{key === "notifySubscribers" ? "Notify subscribers" : key}</span>
                  <input
                    type="checkbox"
                    checked={data[key] as boolean}
                    onChange={e => set(key, e.target.checked)}
                    className="accent-[var(--gold)] w-3.5 h-3.5"
                  />
                </label>
              ))}
            </div>

            {/* Meta */}
            <div className="glass rounded-xl p-4 space-y-3">
              <p className="font-mono text-[9px] text-[var(--text-muted)] tracking-[0.2em]">META</p>

              <div>
                <label className="font-mono text-[9px] text-[var(--text-muted)] block mb-1">SLUG</label>
                <input
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-1.5 font-mono text-xs text-[var(--text-muted)] outline-none focus:border-[var(--gold)]"
                  value={data.slug}
                  onChange={e => set("slug", e.target.value)}
                  placeholder="my-post-slug"
                />
              </div>

              <div>
                <label className="font-mono text-[9px] text-[var(--text-muted)] block mb-1">EXCERPT</label>
                <textarea
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-muted)] outline-none focus:border-[var(--gold)] resize-none"
                  rows={3}
                  value={data.excerpt}
                  onChange={e => set("excerpt", e.target.value)}
                  placeholder="Brief summary shown in post listings…"
                />
              </div>

              <div>
                <label className="font-mono text-[9px] text-[var(--text-muted)] block mb-1">CATEGORY</label>
                <select
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-muted)] outline-none focus:border-[var(--gold)]"
                  value={data.category}
                  onChange={e => set("category", e.target.value)}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="font-mono text-[9px] text-[var(--text-muted)] block mb-1">
                  READ TIME (min) <span className="text-[var(--gold)]">· auto: {estimatedRead}</span>
                </label>
                <input
                  type="number"
                  min={1}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-muted)] outline-none focus:border-[var(--gold)]"
                  value={data.readTime}
                  onChange={e => set("readTime", e.target.value as unknown as PostData["readTime"])}
                  placeholder={String(estimatedRead)}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="glass rounded-xl p-4 space-y-2.5">
              <p className="font-mono text-[9px] text-[var(--text-muted)] tracking-[0.2em]">TAGS</p>
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-muted)] outline-none focus:border-[var(--gold)]"
                  placeholder="wazuh, siem, linux…"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <button onClick={addTag} className="btn-ghost text-xs px-2.5 py-1.5">Add</button>
              </div>
              {data.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {data.tags.map(t => (
                    <span key={t} className="tag flex items-center gap-1 text-[10px]">
                      {t}
                      <button onClick={() => set("tags", data.tags.filter(x => x !== t))} className="opacity-60 hover:opacity-100">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Cover image */}
            <div className="glass rounded-xl p-4 space-y-2.5">
              <p className="font-mono text-[9px] text-[var(--text-muted)] tracking-[0.2em]">COVER IMAGE</p>
              <input
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-muted)] outline-none focus:border-[var(--gold)]"
                placeholder="https://..."
                value={data.coverImage}
                onChange={e => set("coverImage", e.target.value)}
              />
              {data.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.coverImage}
                  alt="cover preview"
                  className="w-full rounded-lg aspect-video object-cover"
                  style={{ border: "1px solid var(--border)" }}
                />
              )}
            </div>

            {/* MDX cheat sheet */}
            <details className="glass rounded-xl overflow-hidden">
              <summary className="px-4 py-3 font-mono text-[9px] text-[var(--text-muted)] tracking-[0.2em] cursor-pointer hover:text-[var(--gold)] transition-colors">
                MDX CHEAT SHEET
              </summary>
              <div className="px-4 pb-4 space-y-1.5 font-mono text-[10px] text-[var(--text-muted)]">
                {[
                  ["## Heading 2", "h2 section"],
                  ["### Heading 3", "h3 sub-section"],
                  ["**bold**", "bold text"],
                  ["`code`", "inline code"],
                  ["```bash\\ncommand\\n```", "code block"],
                  ["- item", "bullet list"],
                  ['<Callout type="info">', "info box"],
                  ['<Callout type="warning">', "warning box"],
                  ['<Callout type="tip">', "tip box"],
                  ['<Callout type="danger">', "danger box"],
                  ["![alt](url)", "image"],
                  ["---", "divider"],
                ].map(([syntax, desc]) => (
                  <div key={syntax} className="flex justify-between gap-2">
                    <code className="text-[var(--gold)] text-[9px]">{syntax}</code>
                    <span className="text-[9px] shrink-0">{desc}</span>
                  </div>
                ))}
              </div>
            </details>
          </aside>
        </div>
      </div>
    </div>
  );
}
