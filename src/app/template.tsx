"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { isAppArea } from "@/components/layout/PublicChrome";
import { ViewTransition } from "@/components/casefile/ViewTransition";

/**
 * Page-to-page transition for the public site, on the real View Transitions
 * API: every navigation re-mounts this template, so the wrapper below is
 * the one element that exits the old page and enters the new one. The old
 * page fades and lifts in 180ms; the incoming page rises 28px, settles from
 * scale 0.994, and fades in over 400ms after a 40ms beat (the reference
 * motion's timing, with a rise built to be seen).
 * The animations themselves are the ::view-transition rules in
 * src/app/ux-pass.css; the navbar is pinned there as a named participant.
 *
 * All four class props carry the same class, cf-vt, on purpose: a route
 * change reconciles as an UPDATE of this boundary, not a mount/unmount,
 * so enter/exit alone did not reliably fire, and the old default="none"
 * left the browser's plain 250ms crossfade in charge whenever they did
 * not. That is why no rise was ever visible. The update and default
 * props close that gap, and the universal and root selectors in
 * ux-pass.css cover the fallback cases.
 *
 * The settling wrapper delays the page's own load-in stagger (cf-load)
 * until the transition snapshot lifts, so the heading steps play visibly
 * after the rise instead of running hidden under the snapshot. The
 * cfHasMounted latch keeps the first paint untouched: the class only
 * appears on client-side navigations, never on the first mount. It is
 * module state, so it survives template remounts; it only flips inside
 * an effect, so server renders and hydration always see it unset.
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

// Flips true after the first client mount and stays true. See the comment
// above: the settling shift is for navigations only, never first paint.
let cfHasMounted = false;

export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    cfHasMounted = true;
  }, []);
  if (isAppArea(pathname)) return <>{children}</>;
  return (
    <ViewTransition enter="cf-vt" exit="cf-vt" update="cf-vt" default="cf-vt">
      <div className={cfHasMounted ? "cf-vt-settling" : undefined}>{children}</div>
    </ViewTransition>
  );
}
