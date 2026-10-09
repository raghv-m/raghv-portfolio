"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Areas with their own layout: no public navbar, footer, alert ticker or newsletter popup. */
const APP_AREAS = ["/admin", "/portal", "/auth"];

export function isAppArea(pathname: string | null): boolean {
  return APP_AREAS.some((area) => pathname === area || pathname?.startsWith(`${area}/`));
}

/** Renders the public site's chrome everywhere except the admin console, client portal and sign-in pages. */
export function PublicChrome({ children }: { children: ReactNode }) {
  return isAppArea(usePathname()) ? null : <>{children}</>;
}
