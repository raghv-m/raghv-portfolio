"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";

import { moveDealAction } from "@/app/admin/crm/actions";
import { useToast } from "@/components/ui/feedback";

const STAGES = [
  ["new", "New"],
  ["reviewed", "Reviewed"],
  ["quoted", "Quoted"],
  ["converted", "Won"],
  ["declined", "Lost"],
] as const;

export function MoveDeal({ id, current }: { id: string; current: string }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  // Optimistic stage: the select shows the new stage the moment it is picked.
  // If the save comes back failed, the transition ends without a refresh and
  // the select falls back to the stage the server still has.
  const [stage, setStage] = useOptimistic(current);
  return (
    <select
      aria-label="Move to stage"
      value={stage}
      disabled={pending}
      onChange={(e) =>
        start(async () => {
          const next = e.target.value as (typeof STAGES)[number][0];
          setStage(next);
          const res = await moveDealAction(id, next);
          if (!res.ok) {
            toast(res.error, "error");
            return;
          }
          router.refresh();
        })
      }
      className="mt-2 w-full bg-transparent border border-[var(--border)] rounded px-2 py-1 font-mono text-[10px] text-[var(--text-muted)]"
    >
      {STAGES.map(([value, label]) => <option key={value} value={value}>Move to: {label}</option>)}
    </select>
  );
}
