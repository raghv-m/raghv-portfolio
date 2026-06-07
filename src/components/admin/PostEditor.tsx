"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Eye, Bold, Code, Minus, AlertTriangle, Lightbulb, Info, XCircle, Hash, List, Upload, X } from "lucide-react";

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
    category: initial?.category ?? "Writeup",
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const [previewContent, setPreviewContent] = useState(data.content);

  useEffect(() => {
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => setPreviewContent(data.content), 500);
    return () => { if (previewTimer.current) clearTimeout(previewTimer.current); };
  }, [data.content]);

  const set = useCallback((k: keyof PostData, v: unknown) => setData(prev => ({ ...prev, [k]: v })), []);

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const insert = (before: string, after = "", placeholder = "text") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = ta.value.slice(start, end) || placeholder;
    const newVal = ta.value.slice(0, start) + before + sel + after + ta.value.slice(end);
    set("content", newVal);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + sel.length);
    }, 0);
  };

  const TOOLBAR = [
    { icon: Bold, label: "Bold", action: () => insert("**", "**") },
    { icon: Code, label: "Inline code", action: () => insert("`", "`") },
    { icon: Hash, label: "Heading", action: () => insert("\n## ", "", "Heading") },
    { icon: List, label: "List item", action: () => insert("\n- ", "", "Item") },
    { icon: Minus, label: "Divider", action: () => set("content", data.content + "\n\n---\n\n") },
    { icon: Info, label: "Callout info", action: () => insert("\n<Callout type=\"info\">\n", "\n</Callout>\n", "Your note here") },
    { icon: AlertTriangle, label: "Callout warning", action: () => insert("\n<Callout type=\"warning\">\n", "\n</Callout>\n", "Warning text") },
    { icon: XCircle, label: "Callout danger", action: () => insert("\n<Callout type=\"danger\">\n", "\n</Callout>\n", "Danger text") },
    { icon: Lightbulb, label: "Callout tip", action: () => insert("\n<Callout type=\"tip\">\n", "\n</Callout>\n", "Tip text") },
  ];

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !data.tags.includes(t)) set("tags", [...data.tags, t]);
    setTagInput("");
  };

  const save = async () => {
    setError("");
    setSaving(true);
    try {
      const body = {
        ...data,
        readTime: data.readTime === "" ? null : Number(data.readTime),
        coverImage: data.coverImage || null,
      };
      const url = data.id ? `/api/admin/posts/${data.id}` : "/api/admin/posts";
      const method = data.id ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) { setError(json.error?.message ?? JSON.stringify(json.error) ?? "Save failed"); return; }
      if (!data.id) router.push(`/admin/posts/${json.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-xl font-bold text-[var(--text)]">{data.id ? "Edit Post" : "New Post"}</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => setPreview(p => !p)} className="btn-ghost flex items-center gap-2">
              <Eye className="w-4 h-4" /> {preview ? "Editor" : "Preview"}
            </button>
            <button onClick={save} disabled={saving} className="btn-gold flex items-center gap-2">
              <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm text-[var(--red)] bg-[rgba(255,68,68,0.06)]" style={{ border: "1px solid rgba(255,68,68,0.2)" }}>{error}</div>
        )}

        {/* Title */}
        <input
          className="w-full font-display text-3xl font-bold text-[var(--text)] bg-transparent border-0 border-b border-[var(--border)] pb-3 mb-6 outline-none placeholder:text-[var(--border)] focus:border-[var(--gold)] transition-colors"
          placeholder="Post title…"
          value={data.title}
          onChange={e => { set("title", e.target.value); if (!data.id) set("slug", autoSlug(e.target.value)); }}
        />

        <div className="xl:grid xl:grid-cols-[1fr_320px] xl:gap-6">
          {/* Editor / Preview */}
          <div>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 mb-2 p-2 glass rounded-xl">
              {TOOLBAR.map(({ icon: Icon, label, action }) => (
                <button key={label} title={label} onClick={action} className="p-1.5 rounded hover:bg-[rgba(212,160,23,0.08)] text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {preview ? (
              <div className="glass rounded-xl p-6 min-h-[600px] prose-content">
                <div className="font-mono text-[10px] text-[var(--text-muted)] mb-4 tracking-wider">PREVIEW</div>
                <pre className="whitespace-pre-wrap font-mono text-sm text-[var(--text-muted)] leading-relaxed">{previewContent}</pre>
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                className="w-full glass rounded-xl p-4 font-mono text-sm text-[var(--text-muted)] resize-none outline-none focus:border-[var(--gold)] min-h-[600px] leading-relaxed"
                style={{ border: "1px solid var(--border)", background: "var(--surface)", tabSize: 2 }}
                placeholder="Write your post in MDX…"
                value={data.content}
                onChange={e => set("content", e.target.value)}
                onKeyDown={e => { if (e.key === "Tab") { e.preventDefault(); insert("  ", "", ""); } }}
              />
            )}
          </div>

          {/* Metadata sidebar */}
          <aside className="space-y-5 mt-6 xl:mt-0">
            {/* Publish toggle */}
            <div className="glass rounded-xl p-4 space-y-3">
              <p className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider">STATUS</p>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-[var(--text)]">Published</span>
                <input type="checkbox" checked={data.published} onChange={e => set("published", e.target.checked)} className="accent-[var(--gold)] w-4 h-4" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-[var(--text)]">Featured</span>
                <input type="checkbox" checked={data.featured} onChange={e => set("featured", e.target.checked)} className="accent-[var(--gold)] w-4 h-4" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-[var(--text)]">Notify subscribers</span>
                <input type="checkbox" checked={data.notifySubscribers} onChange={e => set("notifySubscribers", e.target.checked)} className="accent-[var(--gold)] w-4 h-4" />
              </label>
            </div>

            {/* Meta */}
            <div className="glass rounded-xl p-4 space-y-3">
              <p className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider">META</p>
              <div>
                <label className="font-mono text-[10px] text-[var(--text-muted)] block mb-1">SLUG</label>
                <input className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 font-mono text-xs text-[var(--text-muted)] outline-none focus:border-[var(--gold)]" value={data.slug} onChange={e => set("slug", e.target.value)} />
              </div>
              <div>
                <label className="font-mono text-[10px] text-[var(--text-muted)] block mb-1">EXCERPT</label>
                <textarea className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-muted)] outline-none focus:border-[var(--gold)] resize-none" rows={3} value={data.excerpt} onChange={e => set("excerpt", e.target.value)} />
              </div>
              <div>
                <label className="font-mono text-[10px] text-[var(--text-muted)] block mb-1">CATEGORY</label>
                <select className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-muted)] outline-none focus:border-[var(--gold)]" value={data.category} onChange={e => set("category", e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] text-[var(--text-muted)] block mb-1">READ TIME (min)</label>
                <input type="number" min={1} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-muted)] outline-none focus:border-[var(--gold)]" value={data.readTime} onChange={e => set("readTime", e.target.value)} />
              </div>
            </div>

            {/* Tags */}
            <div className="glass rounded-xl p-4 space-y-3">
              <p className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider">TAGS</p>
              <div className="flex gap-2">
                <input className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-muted)] outline-none focus:border-[var(--gold)]" placeholder="Add tag…" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTag()} />
                <button onClick={addTag} className="btn-ghost text-xs px-3 py-2">Add</button>
              </div>
              {data.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {data.tags.map(t => (
                    <span key={t} className="tag flex items-center gap-1">
                      {t}
                      <button onClick={() => set("tags", data.tags.filter(x => x !== t))} className="opacity-60 hover:opacity-100"><X className="w-2.5 h-2.5" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Cover image */}
            <div className="glass rounded-xl p-4 space-y-3">
              <p className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider">COVER IMAGE</p>
              <input className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-muted)] outline-none focus:border-[var(--gold)]" placeholder="https://... or /uploads/..." value={data.coverImage} onChange={e => set("coverImage", e.target.value)} />
              {data.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.coverImage} alt="cover preview" className="w-full rounded-lg aspect-video object-cover" />
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
