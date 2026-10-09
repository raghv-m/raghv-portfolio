import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
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
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://maps.googleapis.com https://maps.gstatic.com"
        : "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://maps.googleapis.com https://maps.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // Allow external image hosts used by blog posts and the Next.js image optimizer
      "img-src 'self' data: blob: https://images.unsplash.com https://cdn.jsdelivr.net https://raw.githubusercontent.com https://avatars.githubusercontent.com https://*.google-analytics.com https://*.googletagmanager.com https://maps.gstatic.com https://*.googleapis.com",
      // Google Tag Manager / GA4 beacons.
      // Supabase: REST/Auth/Storage over https, Realtime over wss.
      `connect-src 'self'${isDev ? " ws: wss:" : ""} https://*.supabase.co wss://*.supabase.co https://maps.googleapis.com https://places.googleapis.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com`,
      // GTM's <noscript> fallback iframe.
      "frame-src https://www.googletagmanager.com",
      "frame-ancestors 'none'",
      "worker-src blob:",
    ].join("; ")
  );

  // Keep the Supabase session fresh wherever it's used (Server Components can't write cookies).
  if (pathname.startsWith("/portal") || pathname.startsWith("/auth") || pathname.startsWith("/admin")) {
    return refreshSupabaseSession(request, response);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
