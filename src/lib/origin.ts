import "server-only";

import { headers } from "next/headers";

/** The site address this request came in on (localhost, a preview, or raghv.dev), for links in emails. */
export async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://raghv.dev").replace(/\/$/, "");
  return `${h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")}://${host}`;
}
