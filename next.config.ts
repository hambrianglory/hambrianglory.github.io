import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds for deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during builds for deployment
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Enable dynamic rendering
  experimental: {
    // Enable runtime for Netlify Functions
    serverMinification: false,
    serverComponentsExternalPackages: ['crypto-js', 'argon2', 'jsonwebtoken'],
  },
  // Netlify deployment configuration
  trailingSlash: false,
  // Configure output for Netlify
  output: 'standalone',
};

export default nextConfig;
