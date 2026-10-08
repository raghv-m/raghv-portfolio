export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/auth", "/portal"] }],
    sitemap: "https://raghv.dev/sitemap.xml",
  };
}
