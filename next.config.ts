import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep transformers (and its onnxruntime native bindings) out of the
  // bundle - load from node_modules at runtime so serverless functions
  // don't crash at import (and CLIP has a chance to run on Vercel).
  serverExternalPackages: ["@huggingface/transformers"],
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
