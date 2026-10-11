import Image from "next/image";
import type { CSSProperties } from "react";

// Keep in sync with images.remotePatterns in next.config.ts. next/image throws for any other
// host, and blog images can be pasted from anywhere.
const OPTIMIZABLE_HOSTS = new Set(["images.unsplash.com", "cdn.jsdelivr.net", "raw.githubusercontent.com", "avatars.githubusercontent.com"]);

function canOptimize(src: string) {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && OPTIMIZABLE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

/**
 * Image in a fixed-ratio box (no layout shift). Served as WebP/AVIF through next/image when the
 * source allows it; otherwise a plain lazy <img>. `priority` for above-the-fold images only.
 */
export function SmartImage({
  src,
  alt,
  aspect = "16 / 9",
  priority = false,
  sizes = "(min-width: 1024px) 768px, 100vw",
  className = "",
  style,
}: {
  src: string;
  alt: string;
  aspect?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={`relative block w-full overflow-hidden ${className}`} style={{ aspectRatio: aspect, ...style }}>
      {canOptimize(src) ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </span>
  );
}
