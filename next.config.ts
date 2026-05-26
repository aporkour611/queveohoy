import type { NextConfig } from "next";
import { SEO_HUB_SLUGS } from "./app/lib/seo-hubs";

function buildBeforeFileRewrites() {
  const rewrites: { source: string; destination: string }[] = [
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
    optimizePackageImports: ["react", "react-dom"],
  },
  images: {
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
        hostname: "image.tmdb.org",
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
