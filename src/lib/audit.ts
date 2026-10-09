import "server-only";

import { headers } from "next/headers";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Appends to public.audit_logs (append-only in the database: updates and deletes are rejected
 * even for the service role). Call it after every admin mutation. Never throws: a failed audit
 * write is logged loudly but doesn't undo the action that already happened.
 */
export async function logAudit(entry: {
  actorId: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  changes?: Record<string, unknown> | null;
}): Promise<void> {
  try {
    const h = await headers();
    const { error } = await getSupabaseAdmin()
      .from("audit_logs")
      .insert({
        actor_id: entry.actorId,
        action: entry.action,
        resource_type: entry.resourceType,
        resource_id: entry.resourceId ?? null,
        changes: entry.changes ?? null,
        ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        user_agent: h.get("user-agent")?.slice(0, 500) ?? null,
      });
    if (error) throw error;
  } catch (error) {
    console.error("[audit] FAILED to write audit log", entry.action, entry.resourceType, error);
  }
}
