import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Mock cat photos (lib/mock-data.ts)
      {
        protocol: "https",
        hostname: "placecats.com",
      },
      // Real sighting photos in Supabase Storage
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
