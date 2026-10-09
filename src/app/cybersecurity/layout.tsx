import type { Metadata } from "next";

import { pageMetadata } from "@/config/site";

export const metadata: Metadata = pageMetadata(
  "/cybersecurity",
  "Cybersecurity skills",
  "Detection engineering, incident response, SIEM (Wazuh, Splunk) and blue-team skills, mapped to MITRE ATT&CK.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
