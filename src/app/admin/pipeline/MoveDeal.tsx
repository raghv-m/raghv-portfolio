"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { moveDealAction } from "@/app/admin/crm/actions";

const STAGES = [
  ["new", "New"],
  ["reviewed", "Reviewed"],
  ["quoted", "Quoted"],
  ["converted", "Won"],
  ["declined", "Lost"],
] as const;

export function MoveDeal({ id, current }: { id: string; current: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <select
      aria-label="Move to stage"
      value={current}
      disabled={pending}
      onChange={(e) =>
        start(async () => {
          await moveDealAction(id, e.target.value as (typeof STAGES)[number][0]);
          router.refresh();
        })
      }
      className="mt-2 w-full bg-transparent border border-[var(--border)] rounded px-2 py-1 font-mono text-[10px] text-[var(--text-muted)]"
    >
      {STAGES.map(([value, label]) => <option key={value} value={value}>Move to: {label}</option>)}
    </select>
  );
}
