import type { MetadataRoute } from "next";

import { site } from "@/config/site";

// App icon when the site is added to a home screen.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "raghv.dev",
    description: site.description,
    start_url: "/",
    display: "browser",
    background_color: "#F4F1EC",
    theme_color: "#141414",
    icons: [
      { src: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/icon-512.png", type: "image/png", sizes: "512x512" },
      { src: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
    ],
  };
}
