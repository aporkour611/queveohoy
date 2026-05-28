import type { NextConfig } from "next";
import { buildSecurityHeaders } from "./app/lib/security-headers";
import { SEO_HUB_SLUGS } from "./app/lib/seo-hubs";

const isProduction = process.env.NODE_ENV === "production";
const securityHeaders = buildSecurityHeaders(isProduction);

function buildBeforeFileRewrites() {
  const rewrites: { source: string; destination: string }[] = [
    {
      source: "/api/home-feed",
      destination: "/api/events?scope=home",
    },
    {
      source: "/partidos-hoy/:fecha",
      destination: "/agenda/partidos-hoy/:fecha",
    },
  ];

  for (const slug of SEO_HUB_SLUGS) {
    rewrites.push({
      source: `/${slug}`,
      destination: `/agenda/${slug}`,
    });
  }

  return rewrites;
}

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "react",
      "react-dom",
      "@vercel/analytics",
      "@vercel/speed-insights",
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75],
    minimumCacheTTL: 60 * 60 * 24,
    deviceSizes: [640, 750, 828, 1080],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "crests.football-data.org",
      },
      {
        protocol: "https",
        hostname: "cdn.pandascore.co",
      },
      {
        protocol: "https",
        hostname: "cdn-api.pandascore.co",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",
      },
      {
        protocol: "https",
        hostname: "r2.thesportsdb.com",
      },
      {
        protocol: "https",
        hostname: "www.thesportsdb.com",
      },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: buildBeforeFileRewrites(),
    };
  },
};

export default nextConfig;
