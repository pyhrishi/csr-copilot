import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Seed JSON is read with fs by src/lib/data; make sure it ships with server bundles on Vercel.
  outputFileTracingIncludes: {
    "/**": ["./data/seed/**/*.json"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
