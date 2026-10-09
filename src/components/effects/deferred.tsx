"use client";

import { useEffect, useState, type ComponentProps } from "react";
import dynamic from "next/dynamic";

/**
 * The decorative WebGL / canvas effects (3D hero, particles, smoke) are the heaviest JavaScript on
 * the site. They used to load and start during page load, delaying everything else (Lighthouse:
 * ~5s of main-thread work on mobile). Now they:
 *  - load only after the page is idle (or 2.5s, whichever comes first), so content shows first;
 *  - are skipped entirely on small screens, low-power devices, data-saver, and for anyone who
 *    prefers reduced motion. The page looks the same without them, just calmer.
 */
export function useHeavyEffects(): boolean {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    const capable =
      window.matchMedia("(min-width: 768px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !nav.connection?.saveData &&
      (nav.hardwareConcurrency ?? 8) > 4 &&
      (nav.deviceMemory ?? 8) > 4;
    if (!capable) return;

    const start = () => setAllowed(true);
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    let handle: number | undefined;
    const schedule = () => {
      handle = idle(start, { timeout: 2500 });
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      if (handle !== undefined) cancelIdle(handle);
    };
  }, []);

  return allowed;
}

const LazySparkles = dynamic(() => import("@/components/ui/sparkles").then((m) => m.SparklesCore), { ssr: false });
const LazySmoke = dynamic(() => import("@/components/ui/spooky-smoke-animation").then((m) => m.SmokeBackground), { ssr: false });
const LazyHeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });
const LazyCyberSphere = dynamic(() => import("@/components/three/CyberSphere"), { ssr: false });

export function SparklesCore(props: ComponentProps<typeof LazySparkles>) {
  return useHeavyEffects() ? <LazySparkles {...props} /> : null;
}

export function SmokeBackground(props: ComponentProps<typeof LazySmoke>) {
  return useHeavyEffects() ? <LazySmoke {...props} /> : null;
}

export function HeroScene(props: ComponentProps<typeof LazyHeroScene>) {
  return useHeavyEffects() ? <LazyHeroScene {...props} /> : null;
}

export function CyberSphere(props: ComponentProps<typeof LazyCyberSphere>) {
  return useHeavyEffects() ? <LazyCyberSphere {...props} /> : null;
}
