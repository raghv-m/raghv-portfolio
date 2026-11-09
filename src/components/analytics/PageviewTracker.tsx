"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Same GA4 property the root layout loads (see src/app/layout.tsx). The
// layout's ga4-init config call counts the initial page load; this tracker
// covers every client-side route change after that, which the App Router
// performs without a full page load (and therefore without a pageview).
const GA_ID = "G-70FNMH9P4X";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function PageviewTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the first run: the layout's config call already counted this
    // pageview, and sending it again would double-count the landing page.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    const query = searchParams?.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;
    window.gtag("config", GA_ID, { page_path: pagePath });
  }, [pathname, searchParams]);

  return null;
}

/** Sends a GA4 pageview on every client-side navigation. useSearchParams
 *  requires a Suspense boundary in the App Router, so the tracker wraps
 *  itself; callers just mount <PageviewTracker />. */
export function PageviewTracker() {
  return (
    <Suspense fallback={null}>
      <PageviewTrackerInner />
    </Suspense>
  );
}
