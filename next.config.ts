import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // This tells Next.js to completely ignore ESLint checks during 'next build'
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
