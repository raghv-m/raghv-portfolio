import type { Metadata } from "next";

import { pageMetadata } from "@/config/site";

export const metadata: Metadata = pageMetadata(
  "/portfolio",
  "Web development portfolio, Edmonton",
  "Websites and web apps built for small businesses by an Edmonton web developer, plus his security projects, with the stack and results behind each one.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
