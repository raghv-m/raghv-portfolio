import type { Metadata } from "next";

import { pageMetadata } from "@/config/site";

export const metadata: Metadata = pageMetadata(
  "/experience",
  "Experience",
  "Raghav Mahajan's experience in web development, security operations and IT: roles, responsibilities and results.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
