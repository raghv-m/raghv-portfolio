import type { Metadata } from "next";

import { pageMetadata } from "@/config/site";

export const metadata: Metadata = pageMetadata(
  "/newsletter",
  "Blue Team Brief, the newsletter",
  "Every edition of Blue Team Brief, Raghav Mahajan's plain-English cybersecurity newsletter from Edmonton: the latest dispatch and the full archive.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
