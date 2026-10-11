"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

import { useConfirm, useToast } from "@/components/ui/feedback";

export default function DeletePostButton({ id, title }: { id: string; title?: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const confirm = useConfirm();
  const toast = useToast();

  const del = async () => {
    const ok = await confirm({
      title: title ? `Delete "${title}"?` : "Delete this post?",
      body: "The post is removed from the site and the database permanently.",
      confirmLabel: "Delete post",
      cancelLabel: "Keep post",
      destructive: true,
    });
    if (!ok) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast(typeof j.error === "string" ? j.error : "The post couldn't be deleted. Please try again.", "error");
        return;
      }
      toast("Post deleted");
      router.refresh();
    } catch {
      toast("Couldn't reach the server. Please try again.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button onClick={del} disabled={deleting} aria-label={title ? `Delete ${title}` : "Delete post"} className="btn-ghost btn-no-arrow text-xs px-2 py-1.5 hover:text-[var(--red)] hover:border-[var(--red)]">
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
