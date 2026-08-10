import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

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
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // Allow external image hosts used by blog posts and the Next.js image optimizer
      "img-src 'self' data: blob: https://images.unsplash.com https://cdn.jsdelivr.net https://raw.githubusercontent.com https://avatars.githubusercontent.com",
      isDev
        ? "connect-src 'self' ws: wss:"
        : "connect-src 'self'",
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

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
