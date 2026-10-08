import type { Metadata } from "next";

import { pageMetadata } from "@/config/site";

export const metadata: Metadata = pageMetadata(
  "/homelab",
  "Home lab",
  "A hands-on SOC home lab: Active Directory, Wazuh SIEM, Splunk and attack simulations, documented end to end.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
