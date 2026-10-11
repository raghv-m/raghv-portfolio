import type { Metadata } from "next";

import { pageMetadata } from "@/config/site";

export const metadata: Metadata = pageMetadata(
  "/portfolio",
  "Portfolio",
  "Websites, web apps and security projects built by Raghav Mahajan, with the stack and results behind each one.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
