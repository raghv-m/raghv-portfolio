import type { Metadata } from "next";

import { pageMetadata } from "@/config/site";

export const metadata: Metadata = pageMetadata(
  "/cybersecurity",
  "SOC analyst skills and blue team work in Edmonton",
  "Entry-level SOC analyst in Edmonton: detection, incident response and SIEM work with Wazuh and Splunk, mapped to MITRE ATT&CK and backed by a hands-on home lab.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
