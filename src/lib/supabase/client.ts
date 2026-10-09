"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./database.types";
import { supabaseAnonKey, supabaseUrl } from "./env";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

/** Browser Supabase client (anon key + the user's session cookie; RLS applies). Used for Realtime. */
export function getSupabaseBrowserClient() {
  browserClient ??= createBrowserClient<Database>(supabaseUrl(), supabaseAnonKey());
  return browserClient;
}
