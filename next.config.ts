import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages configuration
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Only use basePath in production
  basePath: process.env.NODE_ENV === 'production' ? '/community-fee-management' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/community-fee-management/' : '',
  
  // Environment configuration
  env: {
    DEMO_MODE: 'true'
  }
};

export default nextConfig;
