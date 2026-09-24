import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // This will ignore ESLint errors during build
  },
  images: {
    // Envio logo host
    remotePatterns: [{ protocol: "https", hostname: "d30nibem0g3f7u.cloudfront.net" }],
  },
  env: {
    GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT,
  },
};

export default nextConfig;
