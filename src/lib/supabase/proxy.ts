import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Refreshes the Supabase session cookie on the way through the proxy, so Server Components
 * (which can't write cookies) always see a fresh session. Returns the response to continue with.
 */
export async function refreshSupabaseSession(request: NextRequest, response: NextResponse) {
  if (!isSupabaseConfigured()) return response;

  let current = response;
  const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        for (const { name, value } of toSet) request.cookies.set(name, value);
        const next = NextResponse.next({ request });
        // keep the security headers already set on the original response
        response.headers.forEach((value, key) => next.headers.set(key, value));
        for (const { name, value, options } of toSet) next.cookies.set(name, value, options);
        current = next;
      },
    },
  });
  // getClaims() verifies the JWT and refreshes it when expired. Don't put code between
  // createServerClient and this call (Supabase SSR guidance).
  await supabase.auth.getClaims();
  return current;
}
