import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  // pdfkit reads its built-in font metrics from node_modules at runtime; bundling breaks that.
  serverExternalPackages: ["pdfkit"],
  turbopack: {
    root: __dirname,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Optimized images are content-addressed by the optimizer, so a 30-day
    // minimum TTL is safe and satisfies the PageSpeed cache audit (Nov 2026).
    minimumCacheTTL: 2592000,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  // Long-lived caching for files in /public. They aren't fingerprinted like /_next/static
  // (which Next already serves as immutable for a year), so cache for 30 days and
  // revalidate in the background for a week: a replaced photo still shows up within
  // a day via stale-while-revalidate, while repeat visits skip the network entirely.
  async headers() {
    return [
      {
        source: "/:file*(svg|png|jpg|jpeg|webp|avif|ico|woff2)",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=604800" }],
      },
      {
        source: "/resume.pdf",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" }],
      },
    ];
  },
  async redirects() {
    return [{ source: "/projects", destination: "/portfolio", statusCode: 301 }];
  },
  experimental: {
    // forbidden() and unauthorized(), with app/forbidden.tsx and app/unauthorized.tsx.
    authInterrupts: true,
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
} as NextConfig;

export default nextConfig;
