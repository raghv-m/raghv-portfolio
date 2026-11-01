"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { isAppArea } from "@/components/layout/PublicChrome";

/**
 * Page-to-page transition for the public site: every navigation re-mounts
 * this template, and the incoming page rises 10px and fades in over 280ms
 * (the --cf-dur-page token). Entrance only — App Router has no exit phase
 * without the View Transitions API, and React's <ViewTransition> is not in
 * this install (checked: react 19.2.4 exports undefined), so a fast,
 * never-blocking entrance is the honest version of the effect.
 *
 * App areas (admin, portal, auth) render bare: no wrapper, no animation.
 * The wrapper lands inside .cf-scope in the DOM, so the reduced-motion kill
 * switch in case-file.css covers it.
 */
export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isAppArea(pathname)) return <>{children}</>;
  return (
    <div key={pathname} className="cf-page-enter">
      {children}
    </div>
  );
}
