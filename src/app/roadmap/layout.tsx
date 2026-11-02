import type { Metadata } from "next";

import { pageMetadata } from "@/config/site";

export const metadata: Metadata = pageMetadata(
  "/roadmap",
  "Career roadmap: SOC analyst path and certification track",
  "Raghav Mahajan's career roadmap: security operations to SOC analyst and beyond. Security+ and ISC2 CC earned; SC-200 and TryHackMe SOC L1 in progress; OSCP the long-term goal.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
