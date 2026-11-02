import type { Metadata } from "next";

import { pageMetadata } from "@/config/site";

export const metadata: Metadata = pageMetadata(
  "/investigations/lab-001-ssh-brute-force",
  "LAB-001 — SSH Brute Force Detection",
  "Investigation LAB-001: a Wazuh SSH brute-force detection captured in a four-node home lab on Oct 14, 2026 — rules 5710 and 5712, the captured telemetry, and the limits of a single lab capture.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
