"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";

import { isAppArea } from "@/components/layout/PublicChrome";

/**
 * Puts public page content inside the case-file design scope. App areas
 * (admin, portal, auth) get the quieter working scope: same tokens, same
 * button treatment, none of the theatrics.
 *
 * MotionConfig reducedMotion="user" makes every framer-motion animation in
 * the main content respect the OS reduced-motion setting (transforms and
 * layout animation switch off; content stays fully visible), matching the
 * CSS kill switch in case-file.css.
 */
export function CfScope({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isAppArea(pathname)) {
    return (
      <div className="cf-app">
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </div>
    );
  }
  return (
    <div className="cf-scope">
      {/* Ambient paper drift (see .cf-ambient): fixed, behind everything in
          this scope, purely decorative. */}
      <div className="cf-ambient" aria-hidden="true" />
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </div>
  );
}
