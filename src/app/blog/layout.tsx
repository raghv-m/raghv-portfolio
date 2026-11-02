import type { Metadata } from "next";

import { pageMetadata } from "@/config/site";

export const metadata: Metadata = pageMetadata(
  "/blog",
  "Blog: web development and security writeups",
  "Writeups on web development, security labs, threat detection and building for the web, by Raghav Mahajan.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
