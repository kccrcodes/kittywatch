import type { MetadataRoute } from "next";

/**
 * PWA manifest (#28) — App Router convention per SPEC §Stack (no next-pwa;
 * no service worker needed for installability). theme_color is the
 * design.md pink-500 primary; icons are the pixel cat pin on a cream tile
 * (maskable keeps the pin inside the safe zone).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CatWatch — Community Cat Tracker",
    short_name: "CatWatch",
    description:
      "Every stray cat gets a digital heartbeat. If it flatlines, the neighbourhood knows.",
    start_url: "/",
    display: "standalone",
    background_color: "#f9f3ee",
    theme_color: "#ec8ea4",
    icons: [
      { src: "/pwa-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa-icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/pwa-icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
