import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Mock cat photos only (lib/mock-data.ts). Swap for the Supabase
    // Storage hostname when real uploads land.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placecats.com",
      },
    ],
  },
};

export default nextConfig;
