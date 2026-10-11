import type { Metadata } from "next";

// The page itself is a Client Component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
