import type { Metadata } from "next";

import { pageMetadata } from "@/config/site";

export const metadata: Metadata = pageMetadata(
  "/contact",
  "Contact",
  "Get in touch with Raghav Mahajan for a website, web app or security work in Edmonton or remotely across Canada.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
