import type { Metadata } from "next";

import { pageMetadata } from "@/config/site";

export const metadata: Metadata = pageMetadata(
  "/hobbies",
  "Hobbies: strange GitHub repos and photography in Edmonton",
  "Off the clock: hunting down strange GitHub experiments, and photography — three of his photos were featured by the Edmonton Valley Zoo.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
