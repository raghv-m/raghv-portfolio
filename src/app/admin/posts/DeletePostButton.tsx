"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function DeletePostButton({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const del = async () => {
    if (!confirm("Delete this post permanently?")) return;
    setDeleting(true);
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <button onClick={del} disabled={deleting} className="btn-ghost text-xs px-2 py-1.5 hover:text-[var(--red)] hover:border-[var(--red)]">
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
