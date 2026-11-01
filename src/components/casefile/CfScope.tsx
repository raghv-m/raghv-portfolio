"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { isAppArea } from "@/components/layout/PublicChrome";

/**
 * Puts public page content inside the case-file design scope. App areas
 * (admin, portal, auth) get the quieter working scope: same tokens, same
 * button treatment, none of the theatrics.
 */
export function CfScope({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isAppArea(pathname)) return <div className="cf-app">{children}</div>;
  return <div className="cf-scope">{children}</div>;
}
