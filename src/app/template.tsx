"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { isAppArea } from "@/components/layout/PublicChrome";
import { ViewTransition } from "@/components/casefile/ViewTransition";

/**
 * Page-to-page transition for the public site, on the real View Transitions
 * API: every navigation re-mounts this template, so the wrapper below is
 * the one element that exits the old page and enters the new one. The old
 * page fades and lifts in 140ms; the incoming page rises 14px, settles from
 * scale 0.994, and fades in over 280ms (the --cf-dur-page move the site has
 * always used, now with the exit phase the CSS-only entrance never had).
 * The animations themselves are the ::view-transition rules in
 * src/app/ux-pass.css; the navbar is pinned there as a named participant.
 *
 * History, because the previous version of this file claimed otherwise:
 * React's <ViewTransition> IS available to the App Router (its React build
 * carries it; the bundled Next guide documents it), just not declared in
 * @types/react yet, so it is imported through the typed shim in
 * components/casefile/ViewTransition.tsx. Without browser support the
 * navigation simply swaps, exactly as before view transitions existed.
 *
 * App areas (admin, portal, auth) render bare: no wrapper, no animation.
 */
export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isAppArea(pathname)) return <>{children}</>;
  return (
    <ViewTransition enter="cf-vt-enter" exit="cf-vt-exit" default="none">
      {children}
    </ViewTransition>
  );
}
