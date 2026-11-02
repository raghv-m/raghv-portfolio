"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Trash2, Undo2 } from "lucide-react";

import { useConfirm, useToast } from "@/components/ui/feedback";

/**
 * Delete with an undo window. The confirm dialog still comes first (this is
 * a permanent database delete), but confirming no longer fires the DELETE
 * immediately: the row dims, a toast offers Undo, and the request only goes
 * out when the window lapses. Undo, or leaving the page inside the window,
 * cancels the delete outright — nothing was ever sent.
 */

const UNDO_WINDOW_MS = 6000;

export default function DeletePostButton({ id, title }: { id: string; title?: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const confirm = useConfirm();
  const toast = useToast();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<number | null>(null);
  const rowRef = useRef<HTMLElement | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const setRowDimmed = (dim: boolean) => {
    const row = rowRef.current;
    if (!row) return;
    row.style.opacity = dim ? "0.45" : "";
  };

  const cancelDelete = () => {
    if (timerRef.current === null) return; // already cancelled or committed
    clearTimer();
    setRowDimmed(false);
    setUndoing(false);
    toast(title ? `Delete cancelled. “${title}” is untouched.` : "Delete cancelled. The post is untouched.");
  };

  // Leaving the page inside the window cancels the delete (see header note).
  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const commitDelete = async () => {
    timerRef.current = null;
    setUndoing(false);
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setRowDimmed(false);
        toast(typeof j.error === "string" ? j.error : "The post couldn't be deleted. Please try again.", "error");
        return;
      }
      toast("Post deleted");
      router.refresh();
    } catch {
      setRowDimmed(false);
      toast("Couldn't reach the server. Please try again.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const del = async () => {
    const ok = await confirm({
      title: title ? `Delete "${title}"?` : "Delete this post?",
      body: "The post is removed from the site and the database permanently. Right after you confirm, you get a few seconds to undo it.",
      confirmLabel: "Delete post",
      cancelLabel: "Keep post",
      destructive: true,
    });
    if (!ok) return;
    rowRef.current = buttonRef.current?.closest<HTMLElement>("[data-post-row]") ?? null;
    setRowDimmed(true);
    setUndoing(true);
    toast(title ? `Deleting “${title}”…` : "Deleting the post…", "success", {
      duration: UNDO_WINDOW_MS + 1000,
      action: { label: "Undo", onClick: cancelDelete },
    });
    timerRef.current = window.setTimeout(commitDelete, UNDO_WINDOW_MS);
  };

  if (undoing) {
    return (
      <button
        ref={buttonRef}
        onClick={cancelDelete}
        aria-label={title ? `Undo deleting ${title}` : "Undo delete"}
        className="btn-ghost btn-no-arrow text-xs px-2 py-1.5"
        style={{ borderColor: "var(--red)", color: "var(--red)" }}
      >
        <Undo2 className="w-3.5 h-3.5" /> Undo
      </button>
    );
  }

  return (
    <button ref={buttonRef} onClick={del} disabled={deleting} aria-label={title ? `Delete ${title}` : "Delete post"} className="btn-ghost btn-no-arrow text-xs px-2 py-1.5 hover:text-[var(--red)] hover:border-[var(--red)]">
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
