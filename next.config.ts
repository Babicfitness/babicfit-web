import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Supabase SSR cookies
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000'] },
  },
};

export default nextConfig;
