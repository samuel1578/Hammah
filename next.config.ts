import type { NextConfig } from "next";

const LEGACY_PRODUCTION_HOST = "slhammah.vercel.app";
const PRODUCTION_ORIGIN = "https://www.hammah.store";

const nextConfig: NextConfig = {
  // The retired deployment host must never serve the site again (duplicate-host
  // risk). Scoped to this exact hostname only — every other *.vercel.app
  // preview deployment is unaffected. Pathname and query string are preserved.
  redirects: async () => [
    {
      source: "/",
      has: [{ type: "host", value: LEGACY_PRODUCTION_HOST }],
      destination: `${PRODUCTION_ORIGIN}/`,
      permanent: true,
    },
    {
      source: "/:path*",
      has: [{ type: "host", value: LEGACY_PRODUCTION_HOST }],
      destination: `${PRODUCTION_ORIGIN}/:path*`,
      permanent: true,
    },
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pixieset.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "media.slbyhammah.com",
      },
    ],
  },
};

export default nextConfig;
