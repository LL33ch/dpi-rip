import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/dpi-checker',
  images: {
    unoptimized: true,
    remotePatterns: [
      { hostname: 'flagcdn.com' },
    ],
  },
};

export default nextConfig;
