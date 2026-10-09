import type { Metadata } from "next";

import { pageMetadata } from "@/config/site";

export const metadata: Metadata = pageMetadata(
  "/about",
  "About Raghav Mahajan",
  "Web developer and cybersecurity analyst in Edmonton. How I work, what I build, and why security comes first in every site I ship.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
