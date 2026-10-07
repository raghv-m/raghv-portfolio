import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { refreshSupabaseSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next();
  const headers = response.headers;

  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  );
  headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Resource-Policy", "same-origin");

  const isDev = process.env.NODE_ENV === "development";
  headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      isDev
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com"
        : "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // Allow external image hosts used by blog posts and the Next.js image optimizer
      "img-src 'self' data: blob: https://images.unsplash.com https://cdn.jsdelivr.net https://raw.githubusercontent.com https://avatars.githubusercontent.com https://*.google-analytics.com https://*.googletagmanager.com",
      // Google Tag Manager / GA4 beacons.
      // Supabase: REST/Auth/Storage over https, Realtime over wss.
      `connect-src 'self'${isDev ? " ws: wss:" : ""} https://*.supabase.co wss://*.supabase.co https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com`,
      // GTM's <noscript> fallback iframe.
      "frame-src https://www.googletagmanager.com",
      "frame-ancestors 'none'",
      "worker-src blob:",
    ].join("; ")
  );

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    // Verify the JWT, not just cookie presence.
    // getToken() can throw on a malformed Authorization header (GHSA-xmf8-cvqr-rfgj) — treat that as unauthenticated.
    let token;
    try {
      token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Keep the Supabase session fresh wherever it's used (Server Components can't write cookies).
  if (pathname.startsWith("/portal") || pathname.startsWith("/auth")) {
    return refreshSupabaseSession(request, response);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
