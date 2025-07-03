import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages configuration
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: '/community-fee-management',
  assetPrefix: '/community-fee-management/',
  
  // Environment configuration
  env: {
    DEMO_MODE: 'true'
  }
};

export default nextConfig;
