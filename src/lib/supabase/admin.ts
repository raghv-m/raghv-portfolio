import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";
import { supabaseUrl } from "./env";

let adminClient: ReturnType<typeof createClient<Database>> | undefined;

/**
 * Service-role client: bypasses RLS. Server only (the "server-only" import makes any client
 * bundle that pulls this in fail to build). Use it only after the caller has been authorised,
 * e.g. through requireAdmin() in src/lib/session.ts, and audit-log every write it makes.
 */
export function getSupabaseAdmin() {
  if (!adminClient) {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
    adminClient = createClient<Database>(supabaseUrl(), key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}
