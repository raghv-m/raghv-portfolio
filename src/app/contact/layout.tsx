import type { Metadata } from "next";

import { pageMetadata } from "@/config/site";

export const metadata: Metadata = pageMetadata(
  "/contact",
  "Contact",
  "Get in touch with Raghav Mahajan in Edmonton: a website or web app for your business, or an entry-level SOC analyst opportunity, in Edmonton or remotely across Canada.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
