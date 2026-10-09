import type { Metadata } from "next";

import { pageMetadata } from "@/config/site";

export const metadata: Metadata = pageMetadata(
  "/certifications",
  "Certifications",
  "CompTIA Security+, ISC2 Certified in Cybersecurity and more: Raghav Mahajan's security certifications.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
