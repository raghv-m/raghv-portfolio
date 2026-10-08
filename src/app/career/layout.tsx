import type { Metadata } from "next";

import { pageMetadata } from "@/config/site";

export const metadata: Metadata = pageMetadata(
  "/career",
  "Career path",
  "From freelance web development to SOC analyst: Raghav Mahajan's cybersecurity career path and goals.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
