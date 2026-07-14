import type { NextConfig } from "next";

// Set NEXT_PUBLIC_BASE_PATH=/suchedule when deploying to GitHub Pages.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
