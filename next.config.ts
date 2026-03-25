import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/4_todo",
  images: { unoptimized: true },
};

export default nextConfig;
