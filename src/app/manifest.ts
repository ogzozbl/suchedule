import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SUchedule",
    short_name: "SUchedule",
    description: "Course schedule builder for Sabancı University students",
    start_url: `${base}/`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    icons: [
      {
        src: `${base}/pwa-icon-192`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: `${base}/pwa-icon-512`,
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: `${base}/pwa-icon-512`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
